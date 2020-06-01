# import fitz
import pytesseract
from PIL import Image
import io
import cv2
import numpy as np
from pdf2image import convert_from_bytes


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


def remove_lines():
    print("Test")
    file = 'C:\\Users\\godfred.nkayamba\\Downloads\\Bulk Upload Export Docs (2)\\SOC200004272\\E .pdf'
    with open(file, 'rb') as pdf_data:
        print(pdf_data)
        image = get_image(pdf_data)
        img = np.array(image)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        img_med = cv2.medianBlur(gray, ksize=15)
        ret, th_img = cv2.threshold(img_med, thresh=220, maxval=255, type=cv2.THRESH_BINARY)
        # cv2.imshow("Img", th_img)
        img_dest = gray.copy()
        img_dest[th_img == 0] = 255
        cv2.imshow("Img", img_dest)
        cv2.waitKey()


# remove_lines()
