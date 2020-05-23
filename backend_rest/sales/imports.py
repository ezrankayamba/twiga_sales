import openpyxl
from . import models
from zipfile import ZipFile
from django.core.files import File
from io import TextIOWrapper
import re
import io
from django.core.files.base import ContentFile
import threading
from . import ocr
import xlsxwriter
import json


def doc_key(name):
    return f'{name.lower()}_doc'


docs_schema = [
    {'name': models.Document.DOC_C2, 'letter': models.Document.LETTER_C2, 'key': doc_key(
        models.Document.DOC_C2), 'regex': '[\\n[]{0,}(\w+)[\({]', 'params': {'x': 700, 'y': 600, 'h': 200, 'w': 600}},
    {'name': models.Document.DOC_ASSESSMENT, 'letter': models.Document.LETTER_ASSESSMENT, 'key': doc_key(models.Document.DOC_ASSESSMENT), 'regex': ' (\d{2,})', 'params': {
        'x': 900, 'y': 120, 'h': 200, 'w': 600}},
    {'name': models.Document.DOC_EXIT, 'letter': models.Document.LETTER_EXIT, 'key': doc_key(
        models.Document.DOC_EXIT), 'regex': ':(\d{4} [\w/]+)', 'params': {'x': 140, 'y': 920, 'h': 200, 'w': 600}}
]


def import_sales(batch):
    excel_file = batch.file_in
    wb = openpyxl.load_workbook(excel_file)
    ws = wb.active
    i = 0
    rows = []
    for row in ws.values:
        if i:
            res = {'TRANS DATE': '', 'CUSTOMER': '', 'DELIVERY NOTE': '', 'VEH#': '',
                   'TAX INVOICE': '', 'SO#': '', 'PRODUCT': '', 'QTY9TONS': '', 'VALUE': '', 'DESTINATION': '', 'STATUS': '', 'DETAILS': ''}
            dict = {}
            try:
                dict['transaction_date'] = row[0]
                res['TRANS DATE'] = row[0]
                dict['customer_name'] = row[1]
                res['CUSTOMER'] = row[1]
                dict['delivery_note'] = row[2]
                res['DELIVERY NOTE'] = row[2]
                dict['vehicle_number'] = row[3]
                res['VEH#'] = row[3]
                dict['tax_invoice'] = row[4]
                res['TAX INVOICE'] = row[4]
                dict['sales_order'] = row[5]
                res['SO#'] = row[5]
                dict['product_name'] = row[6]
                res['PRODUCT'] = row[6]
                dict['quantity'] = row[7]
                res['QTY9TONS'] = row[7]
                dict['total_value'] = row[8]
                res['VALUE'] = row[8]
                dict['destination'] = row[9]
                res['DESTINATION'] = row[9]
                models.Sale.objects.create(**dict)
                res['STATUS'] = 'Success'
                res['DETAILS'] = json.dumps({'errors': []})
                rows.append(res)
            except Exception as e:
                print(e)
                err_msg = str(e)
                if 'UNIQUE' in err_msg:
                    err_msg = 'Duplicate record'
                res['STATUS'] = 'Fail'
                res['DETAILS'] = json.dumps({'errors': [{'message': err_msg}]})
                rows.append(res)
        else:
            if len(row) < 2:
                print('Not enough columns')
                break
        i += 1

    write_out(batch, rows, headers=['TRANS DATE', 'CUSTOMER', 'DELIVERY NOTE', 'VEH#',
                                    'TAX INVOICE', 'SO#', 'PRODUCT', 'QTY9TONS)', 'VALUE', 'DESTINATION', 'STATUS', 'DETAILS'])
    print('Completed processing the upload')


def map_error(error):
    res = {}
    key = error['name']
    res[key] = error['message']
    return res


def read_entries(zip, row, docs_list, agent):
    so, qty, val = (row[0], row[1], row[2])
    sale = models.Sale.objects.filter(sales_order=so).first()
    if sale:
        doc_entries = filter(lambda x: so in x.filename, docs_list)
        errors, docs = ([], [])
        for doc_entry in doc_entries:
            with zip.open(doc_entry, 'r') as file:
                filename = doc_entry.filename.split("/")[1]
                doc_type = filename.split(' ')[0]
                d = next(x for x in docs_schema if doc_type == x['letter'])
                args, name, regex, pdf_data = (d['params'], d['name'], d['regex'], io.BytesIO(file.read()))
                ret = re.search(regex, ocr.extract_from_file(pdf_data, **args))
                error = None
                if ret:
                    ref_number = ret.group(1)
                    duplicate = models.Document.objects.filter(ref_number=ref_number).first()
                    if duplicate:
                        error = f'Duplicate {name} document'
                    else:
                        docs.append({
                            'ref_number': ref_number,
                            'file': File(pdf_data, name=filename.split(' ')[1]),
                            'sale': sale,
                            'doc_type': name
                        })
                else:
                    error = f'Invalid {name} document'
                if error:
                    errors.append({
                        'key': d['key'],
                        'name': name,
                        'message': error,
                    })
        if len(errors):
            print('Errors: ', errors)
        else:
            print('Docs: ', docs)
            sale.agent = agent
            sale.quantity2 = qty
            sale.total_value2 = val
            sale.save()
            for doc in docs:
                models.Document.objects.create(**doc)
        return {'sale': sale, 'result': 0, 'errors': list(map(map_error, errors))}
    else:
        return {'sale': sale, 'result': -1, 'errors': [{'sale': 'Sales order number is not valid'}]}


def cell(i, j):
    char = "A"
    char = chr(ord(char[0]) + j - 1)
    return f'{char}{i}'


def write_out(batch, rows, headers):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output)
    main = workbook.add_worksheet("Result")
    print(rows[0], headers)

    for j, col in enumerate(headers, start=1):
        main.write(f'{cell(1, j)}', col)

    for i, row in enumerate(rows, start=2):
        for j, col in enumerate(row, start=1):
            main.write(f'{cell(i, j)}', row[col])

    workbook.close()
    xlsx_data = output.getvalue()
    batch.file_out = File(output, name=f'Result_{batch.id}.xlsx')
    # batch.file_out.save()
    batch.status = 1
    batch.save()


def import_docs(batch):
    agent = batch.user.agent
    rows = []
    with ZipFile(batch.file_in, 'r') as zip:
        docs_list = []
        for entry in zip.infolist():
            if '/' in entry.filename:
                docs_list.append(entry)
            else:
                excel = entry
        sales = []
        if excel:
            with zip.open(excel, 'r') as file:
                ws = openpyxl.load_workbook(ContentFile(file.read())).active
                i = 0
                for row in ws.values:
                    if i and len(row) == 3:
                        try:
                            res = read_entries(zip, row, docs_list, agent)
                            rec = {}
                            rec['SO#'] = row[0]
                            rec['Quantity'] = row[1]
                            rec['Volume'] = row[2]
                            rec['Status'] = 'Completed' if res['result'] == 0 else 'Failed'
                            rec['Detail'] = json.dumps({'errors': res['errors']})
                            rows.append(rec)
                        except Exception as e:
                            print(e)
                    i += 1
    headers = ['SO#', 'Quantity', 'Volume', 'Status', 'Detail']
    write_out(batch, rows, headers=headers)
    print('Completed processing the upload')


def sales_import_async(batch):
    t = threading.Thread(target=import_sales, args=(batch,), kwargs={})
    t.setDaemon(True)
    t.start()


def docs_import_async(batch):
    t = threading.Thread(target=import_docs, args=(batch,), kwargs={})
    t.setDaemon(True)
    t.start()
