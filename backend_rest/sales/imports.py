import openpyxl
from . import models
from zipfile import ZipFile
import csv
from io import TextIOWrapper


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


def import_docs(zip_file):
    with ZipFile(zip_file, 'r') as zip:
        with zip.open('DocsList.csv') as csv_file:
            print(csv_file)
            reader = csv.DictReader(TextIOWrapper(csv_file))
            for row in reader:
                print(row)
            # wb = openpyxl.load_workbook(TextIOWrapper(excel_file))
            # ws = wb.active
            # i = 0
            # for row in ws.values:
            #     if i:
            #         dict = {}
            #         try:
            #             dict['sales_order'] = row[0]
            #             dict['c2'] = row[1]
            #             dict['assessment'] = row[2]
            #             dict['exit'] = row[3]
            #             print(dict)
            #             # models.Sale.objects.create(**dict)
            #         except Exception as e:
            #             print(e)
            #     else:
            #         if len(row) < 2:
            #             print('Not enough columns')
            #             break
            #     i += 1

            pass
