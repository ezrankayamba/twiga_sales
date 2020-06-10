from . import ocr2 as ocr
import numpy as np

import pytesseract
import io
import re
from decimal import Decimal


def from_letter(pdf_data):
    kwargs = {'y': 500, 'h': 600}
    regex = 'exited[\w ]+ ([\d,.]+) tons[\w \n]+TZS[\. ]+([\d,.]+).\ Vat[\w \n\.]+(\d{4,})\.'
    threshold = 220

    img = np.array(ocr.get_image(pdf_data))
    img = ocr.get_grayscale(img)
    img = ocr.crop(img, **kwargs)
    img = ocr.thresholding(np.array(img), threshold=threshold)
    text = ocr.image_to_string(img)
    ret = re.search(regex, text)
    if ret:
        result = {}
        result['volume'] = float(ret.group(1).replace(',', ''))
        result['value'] = float(ret.group(2).replace(',', ''))
        result['invoice_number'] = int(ret.group(3))
        return result


def from_invoice(pdf_data):
    regex = 'ce No[\. ]{1,}(\d{2,})'
    threshold = 148

    img = np.array(ocr.get_image(pdf_data))
    img = ocr.get_grayscale(img)
    h, w = img.shape
    kwargs = {'x': int(w*2/3), 'w': 1000, 'y': 0, 'h': 300, 'show': False}
    img = ocr.crop(img, **kwargs)

    img = ocr.thresholding(np.array(img), threshold=threshold)
    text = ocr.image_to_string(img)
    ret = re.search(regex, text)
    if ret:
        result = {}
        result['invoice_number'] = int(ret.group(1))
        return result


def extract_invoice_copy(invoice, letter):
    letter = from_letter(letter)
    invoice = from_invoice(invoice)
    return (invoice, letter)


# folder = 'C:\\Users\\godfred.nkayamba\\Downloads\\exporttooltaxinvoicesample\\'
# file1 = f'{folder}SKM_Sales20060907571_Breakdown_Rotated.pdf'
# file2 = f'{folder}SKM_Sales20060907570.pdf'
# with open(file1, 'rb') as pdf_data1, open(file2, 'rb') as pdf_data2:
#     res = extract_invoice_copy(pdf_data1, pdf_data2)
#     print(res)
