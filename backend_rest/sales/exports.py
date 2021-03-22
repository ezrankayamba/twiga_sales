import io
import xlsxwriter
from . import models
from datetime import datetime
import decimal


def date_parse(str, fmt='%Y-%m-%d %H:%M:%S'):
    if str == None:
        return None
    return datetime.strptime(str, fmt)


def cell(i, j):
    char = "A"
    char = chr(ord(char[0]) + j - 1)
    return f'{char}{i}'


def date_fmt(date):
    if date == None:
        return None
    return date.strftime("%d/%m/%Y")


def get_refs(sale):
    exit_ref = None
    c2_ref = None
    assessment_ref = None
    aggr = True if sale.aggregate else False
    objs = models.AggregateDocument.objects if aggr else models.Document.objects

    if aggr:
        exit_doc = objs.filter(doc_type=models.AggregateDocument.DOC_RELEASE_NOTE, aggregate_sale=sale.aggregate).first()
    else:
        exit_doc = objs.filter(doc_type=models.Document.DOC_EXIT, sale=sale).first()
    if exit_doc:
        exit_ref = exit_doc.ref_number

    if aggr:
        assessment_doc = objs.filter(doc_type=models.AggregateDocument.DOC_ASSESSMENT_KG, aggregate_sale=sale.aggregate).first()
    else:
        assessment_doc = objs.filter(doc_type=models.Document.DOC_ASSESSMENT, sale=sale).first()
    if assessment_doc:
        assessment_ref = assessment_doc.ref_number

    if aggr:
        c2_doc = objs.filter(doc_type=models.Document.DOC_C2, aggregate_sale=sale.aggregate).first()
    else:
        c2_doc = objs.filter(doc_type=models.Document.DOC_C2, sale=sale).first()
    if c2_doc:
        c2_ref = c2_doc.ref_number

    return [c2_ref, assessment_ref, exit_ref]


def export_report(request, sales):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output)

    main = workbook.add_worksheet("Report")
    headers = ['ID', 'TRANS_DATE', 'CUSTOMER', 'DELIVERY NOTE', 'VEH#',
               'TAX INVOICE', 'SO#', 'PRODUCT', 'QTY(TONS)', 'VALUE', 'DESTINATION', 'VEH# TRAILER', 'AGENT', 'C2', 'ASSESSMENT', 'EXIT/RELEASE', 'ASSIGN#']
    rows = []

    for prj in sales:
        row = []
        row.append(prj.id)
        row.append(date_fmt(date_parse(prj.transaction_date)))
        row.append(prj.customer_name)
        row.append(prj.delivery_note)
        row.append(prj.vehicle_number)
        row.append(prj.tax_invoice)
        row.append(prj.sales_order)
        row.append(prj.product_name)
        row.append(float(prj.quantity))
        row.append(float(prj.total_value))
        row.append(prj.destination)
        row.append(prj.vehicle_number_trailer)
        row.append(prj.agent.code if prj.agent else 'None')
        row.extend(get_refs(prj))
        row.append(prj.assign_no)
        rows.append(row)

    for j, col in enumerate(headers, start=1):
        main.write(f'{cell(1, j)}', col)

    for i, row in enumerate(rows, start=2):
        for j, col in enumerate(row, start=1):
            main.write(f'{cell(i, j)}', col)
    workbook.close()
    xlsx_data = output.getvalue()
    return xlsx_data


def export_customers(request, customers):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output)

    main = workbook.add_worksheet("Report")
    headers = ['CUSTOMER', 'COUNT', 'FACTORY VALUE', 'FACTORY VOLUME', 'BORDER VALUE', 'BORDER VOLUME', '% VOLUME']
    # columns = ['customer_name', 'qty', 'total_value', 'total_volume', 'total_value2', 'total_volume2']
    rows = []

    for prj in customers:
        row = []
        vol2 = prj['total_volume2'] if prj['total_volume2'] else 0
        val2 = prj['total_value2'] if prj['total_value2'] else 0
        pct = 100*(vol2/prj['total_volume'])
        row.append(prj['customer_name'])
        row.append(prj['qty'])
        row.append(prj['total_value'])
        row.append(prj['total_volume'])
        row.append(val2)
        row.append(vol2)
        row.append(float(f'{pct:.2f}'))

        rows.append(row)

    for j, col in enumerate(headers, start=1):
        main.write(f'{cell(1, j)}', col)

    for i, row in enumerate(rows, start=2):
        for j, col in enumerate(row, start=1):
            main.write(f'{cell(i, j)}', col)
    workbook.close()
    xlsx_data = output.getvalue()
    return xlsx_data
