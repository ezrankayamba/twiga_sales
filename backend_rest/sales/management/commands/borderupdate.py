from django.core.management.base import BaseCommand, CommandError
import csv
from sales.models import Sale, Document
from sales.reports import get_sales


class Command(BaseCommand):
    help = 'Update Qty & Values from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('file', type=str)

    def handle(self, *args, **options):
        file = options['file']
        if file:
            with open(file, 'r') as csv_file:
                reader = csv.DictReader(csv_file)
                for row in reader:
                    so = row['SO']
                    qty = row['QTY']
                    value = row['VALUE']
                    sale = get_sales(q='withdocs').filter(sales_order=so, invoice__isnull=True).first()
                    if sale:
                        sale.quantity2 = qty
                        sale.total_value2 = value
                        sale.save()
                        print(f'Updated qty & value for SO: {so}')
                    else:
                        print(f'Sale not available or documents not attached for SO: {so}')
        else:
            print("csv file is required")
