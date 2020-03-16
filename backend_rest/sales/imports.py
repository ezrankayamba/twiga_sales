import openpyxl
from . import models
from zipfile import ZipFile
from django.core.files import File
from io import TextIOWrapper
import re
import io
from django.core.files.base import ContentFile


def import_sales(excel_file):
    wb = openpyxl.load_workbook(excel_file)
    ws = wb.active
    i = 0
    for row in ws.values:
        if i:
            dict = {}
            try:
                dict['transaction_date'] = row[0]
                dict['customer_name'] = row[1]
                dict['delivery_note'] = row[2]
                dict['vehicle_number'] = row[3]
                dict['tax_invoice'] = row[4]
                dict['sales_order'] = row[5]
                dict['product_name'] = row[6]
                dict['quantity'] = row[7]
                dict['total_value'] = row[8]
                dict['destination'] = row[9]
                print(dict)
                models.Sale.objects.create(**dict)
            except Exception as e:
                print(e)
        else:
            if len(row) < 2:
                print('Not enough columns')
                break
        i += 1


def import_docs(zip_file, agent_code):
    with ZipFile(zip_file, 'r') as zip:
        regex = f'^(\w+)\/(\w) (\w+).(\w+)$'
        for entry in zip.infolist():
            print(entry.filename)
            match = re.match(regex, entry.filename)
            if match:
                so = match.group(1)
                doc_type = match.group(2)
                ref_number = match.group(3)
                ext = match.group(4)
                print(so, doc_type, ref_number, ext)
                sale = models.Sale.objects.filter(sales_order=so).first()
                if sale:
                    with zip.open(entry, 'r') as file:
                        doc_file = ContentFile(file.read())
                        doc_file.name = f'{doc_type} {ref_number}.{ext}'
                        d_type = None
                        if doc_type == 'A':
                            d_type = models.Document.DOC_ASSESSMENT
                        if doc_type == 'C':
                            d_type = models.Document.DOC_C2
                        if doc_type == 'E':
                            d_type = models.Document.DOC_EXIT
                        models.Document.objects.create(ref_number=f'{doc_type} {ref_number}', file=doc_file, sale=sale, doc_type=d_type)
                    sale.agent_code = agent_code
                    sale.save()
