# import fitz
import pytesseract
from PIL import Image
import io
import cv2
import numpy as np
from pdf2image import convert_from_bytes
import re


def de_skew(image, show=False, delta=0):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = 255 - gray
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    coords = np.column_stack(np.where(thresh > 0))
    angle = cv2.minAreaRect(coords)[-1]
    print('Angle: ', angle)
    if angle == 90:
        angle = 0
    elif angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    angle = angle + delta
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


def get_image(data):
    image = convert_from_bytes(data.read())[0]
    return image


def crop(image, x=0, y=0, h=2338, w=1653, show=False, is_gray=True):
    if not is_gray:
        image = get_grayscale(image)
    crop_img = image[y:y + h, x:x + w]
    if show:
        cv2.imshow("cropped", crop_img)
        cv2.waitKey(0)
    return crop_img


def get_grayscale(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


def remove_noise(image):
    return cv2.medianBlur(image, 5)


def thresholding(image, threshold=240):
    ret, th_img = cv2.threshold(image, thresh=threshold, maxval=255, type=cv2.THRESH_BINARY)
    return th_img


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


# def deskew(image):
#     coords = np.column_stack(np.where(image > 0))
#     angle = cv2.minAreaRect(coords)[-1]
#     print(angle)
#     if angle < -45:
#         angle = -(90 + angle)
#     else:
#         angle = -angle
#     print(angle)
#     (h, w) = image.shape[:2]
#     center = (w // 2, h // 2)
#     M = cv2.getRotationMatrix2D(center, angle, 1.0)
#     rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
#     return rotated


def match_template(image, template):
    return cv2.matchTemplate(image, template, cv2.TM_CCOEFF_NORMED)


def image_to_string(image):
    config = r'--oem 3 --psm 6'
    return pytesseract.image_to_string(image, lang='eng', config=config)


def get_ref_number(image, regex):
    text = image_to_string(image)
    lines = text.split("\n")
    print("\n")
    # print("========================================================")
    # print(regex)
    i = 0
    for line in lines:
        ret = re.search(regex, line.strip())
        i = i+1
        print(i, '. ', line)
        if ret:
            return ret.group(1)


def threshold_trials(orig_img, regex,  thresholds, i=0):
    img = orig_img.copy()
    threshold = thresholds[i]
    print("Try with threshold: ", threshold)
    img = thresholding(np.array(img), threshold=threshold)
    ref_number = get_ref_number(img, regex)
    if ref_number:
        return ref_number
    j = i+1
    if j < len(thresholds):
        return threshold_trials(orig_img, regex,  thresholds, i=j)


def zoom_in(img, zoom):
    return cv2.resize(img, None, fx=zoom, fy=zoom)


def extract_ref_number(pdf_data, regex, **kwargs):
    try:
        threshold = kwargs.get('threshold')
        zoom = kwargs.get('zoom')
        if threshold:
            del kwargs['threshold']
        if zoom:
            del kwargs['zoom']
        else:
            zoom = 1.0
        img = np.array(get_image(pdf_data))
        img = crop(img, **kwargs)
        img = de_skew(img, show=False)
        img = zoom_in(img, zoom)
        ref_number = get_ref_number(img, regex)
        if not ref_number:
            thresholds = [threshold, threshold-7, threshold+7, threshold-14, threshold+14,  threshold*2/3.5, threshold*2/3]
            print("Try with thresholds: ", thresholds)
            ref_number = threshold_trials(img, regex, thresholds)
        return ref_number
    except Exception as ex:
        return None


def show_wait_destroy(winname, img):
    cv2.imshow(winname, img)
    cv2.moveWindow(winname, 500, 0)
    cv2.waitKey(0)
    cv2.destroyWindow(winname)


def apply_corrections(ref_number, corrections):
    if corrections and ref_number:
        res = list(ref_number)
        for c in corrections:
            pos = c['pos']
            x = res[pos]
            if x == c['val']:
                res[pos] = c['rep']
        return ''.join(res)
    else:
        return ref_number


def auto_remove_scratches():
    print("Removing scratches...")
    file = "C:\\Users\\godfred.nkayamba\\Downloads\\failed\\C.pdf"
    with open(file, 'rb') as pdf_data:
        img = np.array(get_image(pdf_data))
        print(img.shape)
        corrections = [{'pos': 1, 'val': '2', 'rep': 'Z'}]
        C_regex = '[ ]{0,1}(\w{15,})[\({ ]'
        A_kwargs = {'x': 700, 'y': 20, 'h': 500, 'w': 800, 'threshold': 230}
        C_kwargs = {'x': 700, 'y': 600, 'h': 400, 'w': 800, 'threshold': 225}
        kwargs = C_kwargs
        regex = C_regex
        threshold = kwargs.get('threshold')
        if threshold:
            del kwargs['threshold']
        img = crop(img, **kwargs)
        img = de_skew(img, show=False)

        # ret, binary = cv2.threshold(img, threshold*2/3.5, 255, cv2.THRESH_BINARY)
        # ref_number = get_ref_number(binary, regex)
        thresholds = [threshold, threshold+7, threshold-1,  threshold*2/3.5, threshold*2/3]
        print("Try with thresholds: ", thresholds)
        ref_number = threshold_trials(img, regex, thresholds)
        print(corrections)
        if ref_number and corrections and len(corrections):
            ref_number = apply_corrections(ref_number, corrections)
        print(ref_number)
        # cv2.imshow("Orig", orig)
        # cv2.imshow("Binary", binary)
        # cv2.waitKey(0)


# auto_remove_scratches()


def remove_lines(image, line_spec=(1, 6)):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    # Remove horizontal
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (64, 2))
    detected_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)
    cnts = cv2.findContours(detected_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]
    for c in cnts:
        cv2.drawContours(image, [c], -1, (255, 255, 255), 2)

    # Repair image
    repair_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 6))
    result = 255 - cv2.morphologyEx(255 - image, cv2.MORPH_CLOSE, repair_kernel, iterations=1)

    # cv2.imshow('thresh', thresh)
    # cv2.imshow('detected_lines', detected_lines)
    # cv2.imshow('image', image)
    cv2.imshow('result', result)
    cv2.waitKey()
