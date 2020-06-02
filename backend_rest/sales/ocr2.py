# import fitz
import pytesseract
from PIL import Image
import io
import cv2
import numpy as np
from pdf2image import convert_from_bytes
import re

from .ocr import get_image, Timer, remove_noise, de_skew, crop


def get_grayscale(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


def remove_noise(image):
    return cv2.medianBlur(image, 5)


def thresholding(image):
    return cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]


def dilate(image):
    kernel = np.ones((5, 5), np.uint8)
    return cv2.dilate(image, kernel, iterations=1)


def erode(image):
    kernel = np.ones((5, 5), np.uint8)
    return cv2.erode(image, kernel, iterations=1)


def opening(image):
    kernel = np.ones((5, 5), np.uint8)
    return cv2.morphologyEx(image, cv2.MORPH_OPEN, kernel)


def canny(image):
    return cv2.Canny(image, 100, 200)


def deskew(image):
    coords = np.column_stack(np.where(image > 0))
    angle = cv2.minAreaRect(coords)[-1]
    print(angle)
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    print(angle)
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated


def match_template(image, template):
    return cv2.matchTemplate(image, template, cv2.TM_CCOEFF_NORMED)


def get_ref_number(text, regex):
    ret = re.search(regex, text.strip())
    if ret:
        return ret.group(1)


def extract_ref_number(pdf_data, regex, **kwargs):
    threshold = kwargs.get('threshold')
    if not threshold:
        threshold = 210
    else:
        del kwargs['threshold']
    img = np.array(get_image(pdf_data))
    img = de_skew(img, show=False)
    # img = cv2.cvtColor(np.array(img), cv2.COLOR_BGR2GRAY)
    img = crop(img, **kwargs)
    config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(img, lang='eng', config=config)
    lines = text.split("\n")
    print("\n\n\n")
    print("========================================================")
    print(regex)
    for line in lines:
        ref_number = get_ref_number(line, regex)
        print(line)
        if ref_number:
            print("Ref Number: ", ref_number)
            return ref_number


# with Timer(message='Extract lasted for {} ms'):
#     file = 'C:\\Users\\godfred.nkayamba\\Downloads\\SOC200004184\\SOC200004276\\E.pdf'
#     letter = 'E'
#     config = r'--oem 3 --psm 6'
#     regex = 'laration[ +\d:]{1,}(\d{4} [\w/]+)'
#     with open(file, 'rb') as pdf_data:
#         ref_number = extract_ref_number(pdf_data, regex)
#         print("Result: ", ref_number)
