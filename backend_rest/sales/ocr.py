# import fitz
import pytesseract
from PIL import Image
import io
import cv2
import numpy as np
from pdf2image import convert_from_bytes


def get_image(data):
    # doc = fitz.open('pdf', data)
    # page = doc.loadPage(0)
    # xref = page.getImageList()[0][0]
    # baseImage = doc.extractImage(xref)
    # image = Image.open(io.BytesIO(baseImage['image']))
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


def auto_crop(image):
    gray = cv2.cvtColor(np.array(image), cv2.COLOR_BGR2GRAY)
    (thresh, img) = cv2.threshold(gray, 160, 255, cv2.THRESH_BINARY)
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
    return extract(crop(auto_crop(get_image(file)), **kwargs))
