# import fitz
import pytesseract
from PIL import Image
import io
import cv2
import numpy as np
from pdf2image import convert_from_bytes
import re
from time import time


class Timer():
    def __init__(self, message, name=None, writer=None):
        self.message = message
        self.writer = writer
        self.name = name

    def __enter__(self):
        self.start = time()
        return None  # could return anything, to be used like this: with Timer("Message") as value:

    def __exit__(self, type, value, traceback):
        elapsed_time = (time() - self.start) * 1000
        print(self.message.format(elapsed_time))


def get_image(data):
    image = convert_from_bytes(data.read())[0]
    return image


def extract(image):
    text = pytesseract.image_to_string(image, lang='eng')
    return text


def crop(image, x=0, y=0, h=2338, w=1653, show=False):
    data = np.array(image)
    img = data[:, :, ::-1].copy()
    crop_img = img[y:y + h, x:x + w]
    if show:
        cv2.imshow("cropped", crop_img)
        cv2.waitKey(0)
    return crop_img


def remove_noise(gray):
    img_med = cv2.medianBlur(gray, ksize=15)
    ret, th_img = cv2.threshold(img_med, thresh=127, maxval=255, type=cv2.THRESH_BINARY)
    img_dest = gray.copy()
    img_dest[th_img == 0] = 255
    return img_dest


def auto_crop(image, threshold=210):
    gray = cv2.cvtColor(np.array(image), cv2.COLOR_BGR2GRAY)
    # gray = remove_noise(gray)

    (thresh, img) = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)
    bit = cv2.bitwise_not(img)
    nonzero = np.nonzero(bit)
    minx = min(nonzero[1])
    maxx = max(nonzero[1])
    miny = min(nonzero[0])
    maxy = max(nonzero[0])
    cv2.rectangle(img, (minx, miny), (maxx, maxy), (0, 0, 255), 2)
    img = np.stack((img,) * 3, axis=-1)
    return img


def extract_from_file(file, **kwargs):
    import string
    print(kwargs)
    threshold = kwargs.get('threshold')
    if not threshold:
        threshold = 210
    else:
        del kwargs['threshold']
    res = extract(crop(auto_crop(get_image(file), threshold=threshold), **kwargs))
    res = ''.join(filter(lambda x: x in set(string.printable), res))
    print("Result: ", res)
    return res.upper()


def new_extract_from_file(regex, pdf_data, **kwargs):
    import string
    threshold = kwargs.get('threshold')
    if not threshold:
        threshold = 210
    else:
        del kwargs['threshold']
    ref_number = None
    image = get_image(pdf_data)
    img = np.array(image)
    img = crop(auto_crop(de_skew(img), threshold), **kwargs)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    print(img.shape)
    ret, thresh1 = cv2.threshold(gray, 0, 255, cv2.THRESH_OTSU | cv2.THRESH_BINARY_INV)
    rect_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (64, 64))
    dilation = cv2.dilate(thresh1, rect_kernel, iterations=1)
    contours, hierarchy = cv2.findContours(dilation, cv2.RETR_EXTERNAL,
                                           cv2.CHAIN_APPROX_NONE)
    im2 = img.copy()
    count = 0
    print()
    print()
    print()
    print()
    print("==========================")
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        rect = cv2.rectangle(im2, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cropped = im2[y:y + h, x:x + w]
        text = pytesseract.image_to_string(cropped).strip()
        text = ''.join(filter(lambda x: x in set(string.printable), text))
        # text = text.replace('\n', '')
        text = text.replace('\t', '')
        print(text)
        if text:
            print(text)
            ret = re.search(regex, text.strip())
            if ret:
                ref_number = ret.group(1)
                print(ref_number)
                break
        count += 1
    print(f'{count} iteration(s): {ref_number}')
    return ref_number


def remove_lines():
    print("Test")
    file = 'C:/Users/godfred.nkayamba/Downloads/SO2945062001/SO2945052001/E .pdf'

    with open(file, 'rb') as pdf_data:
        # kwargs = {'x': 20, 'y': 900, 'h': 400, 'w': 600}
        kwargs = {'x': 20, 'y': 700, 'h': 400, 'w': 600, 'threshold': 220, 'show': True}
        regex = 'Declaration[\w :]{1,}(\d{4} [\w/]+)'
        with Timer("Elapsed time to extract text: {:,.2f} ms"):
            new_extract_from_file(regex, pdf_data, **kwargs)
    print(file)


# remove_lines()


def de_skew(image, show=False):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = 255 - gray
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    coords = np.column_stack(np.where(thresh > 0))
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
    if show:
        cv2.imshow("Unrotated", image)
        cv2.imshow("Rotated", rotated)
        cv2.waitKey(0)
    return rotated


# file = 'C:/Users/godfred.nkayamba/Downloads/SO2945062001/SO2945062001/E .pdf'
# with open(file, 'rb') as pdf_data:
#     image = get_image(pdf_data)
#     image = np.array(image)
#     de_skew(image, show=True)
