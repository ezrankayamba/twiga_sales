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
    exit_doc = models.Document.objects.filter(doc_type=models.Document.DOC_EXIT, sale=sale).first()
    if exit_doc:
        exit_ref = exit_doc.ref_number
    assessment_doc = models.Document.objects.filter(doc_type=models.Document.DOC_ASSESSMENT, sale=sale).first()
    if assessment_doc:
        assessment_ref = assessment_doc.ref_number
    c2_doc = models.Document.objects.filter(doc_type=models.Document.DOC_C2, sale=sale).first()
    if c2_doc:
        c2_ref = c2_doc.ref_number

    return [c2_ref, assessment_ref, exit_ref]


def export_report(request, sales):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output)

    main = workbook.add_worksheet("Report")
    headers = ['ID', 'TRANS_DATE', 'CUSTOMER', 'DELIVERY NOTE', 'VEH#',
               'TAX INVOICE', 'SO#', 'PRODUCT', 'QTY(TONS)', 'VALUE', 'DESTINATION', 'VEH# TRAILER', 'AGENT', 'C2', 'ASSESSMENT', 'EXIT']
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


def export_report_inv_details(request, sales):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output)

    main = workbook.add_worksheet("Report")
    headers = ['ID', 'TRANS_DATE', 'CUSTOMER', 'DELIVERY NOTE', 'VEH#',
               'TAX INVOICE', 'SO#', 'PRODUCT', 'QTY(TONS)', 'DESTINATION', 'VEH# TRAILER', 'AGENT', 'C2', 'ASSESSMENT', 'EXIT', 'RATE/T',	'TOTAL VALUE EX VAT',	'VAT AMOUNT 18%',	'TOTAL VALUE INC VAT',	'INV NUMBER'
               ]
    rows = []

    for prj in sales:
        comm_amt = prj.quantity2 * prj.invoice.commission
        row = []
        row.append(prj.id)
        row.append(date_fmt(date_parse(prj.transaction_date)))
        row.append(prj.customer_name)
        row.append(prj.delivery_note)
        row.append(prj.vehicle_number)
        row.append(prj.tax_invoice)
        row.append(prj.sales_order)
        row.append(prj.product_name)
        row.append(float(prj.quantity2))
        row.append(prj.destination)
        row.append(prj.vehicle_number_trailer)
        row.append(prj.agent.code if prj.agent else 'None')
        row.extend(get_refs(prj))
        row.append(float(prj.invoice.commission))
        row.append(float(comm_amt))
        row.append(float(comm_amt * decimal.Decimal(0.18)))
        row.append(float(comm_amt*decimal.Decimal(1.18)))
        row.append(prj.invoice.number)
        rows.append(row)

    for j, col in enumerate(headers, start=1):
        main.write(f'{cell(1, j)}', col)

    for i, row in enumerate(rows, start=2):
        for j, col in enumerate(row, start=1):
            main.write(f'{cell(i, j)}', col)
    workbook.close()
    xlsx_data = output.getvalue()
    return xlsx_data


def export_invoices(request, invoices):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output)

    main = workbook.add_worksheet("Report")
    headers = ['ID', 'INVOICE NO', 'RATE', 'AGENT',
               'QUANTITY(TONS)', 'VALUE(TZS)', 'VALUE(VAT INCL.)', 'STATUS']
    rows = []

    for prj in invoices:
        row = []
        row.append(prj.id)
        row.append(prj.number)
        row.append(prj.commission)
        row.append(prj.agent.code)
        row.append(prj.quantity)
        row.append(prj.value)
        row.append(prj.value * decimal.Decimal(1.18))
        row.append('Pending' if prj.status == 0 else 'Completed')
        rows.append(row)

    for j, col in enumerate(headers, start=1):
        main.write(f'{cell(1, j)}', col)

    for i, row in enumerate(rows, start=2):
        for j, col in enumerate(row, start=1):
            main.write(f'{cell(i, j)}', col)
    workbook.close()
    xlsx_data = output.getvalue()
    return xlsx_data
