import io
import xlsxwriter
from . import models
from datetime import datetime


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


def export_report(request, sales):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output)

    main = workbook.add_worksheet("Report")
    headers = ['ID', 'TRANS_DATE', 'CUSTOMER', 'DELIVERY NOTE', 'VEH#',
               'TAX INVOICE', 'SO#', 'PRODUCT', 'QTY(TONS)', 'VALUE', 'DESTINATION', 'AGENT', 'DOCS']
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
        row.append(int(prj.quantity))
        row.append(float(prj.total_value))
        row.append(prj.destination)
        row.append(prj.agent.code if prj.agent else 'None')
        row.append(prj.doc_count)
        rows.append(row)

    for j, col in enumerate(headers, start=1):
        main.write(f'{cell(1, j)}', col)

    for i, row in enumerate(rows, start=2):
        for j, col in enumerate(row, start=1):
            main.write(f'{cell(i, j)}', col)

    workbook.close()
    xlsx_data = output.getvalue()
    return xlsx_data