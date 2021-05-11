from smtplib import SMTP, SMTP_SSL
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import configparser
from email.mime.application import MIMEApplication
from os import path
from os.path import basename
from django.conf import settings
from email.message import EmailMessage

context = ssl.create_default_context()
config = configparser.ConfigParser()
config_path = path.join(settings.BASE_DIR, 'mailsender.ini')
config.read(config_path)


def attach_file(message, file_to_attach):
    with open(file_to_attach, 'rb') as attach_file:
        payload = MIMEBase('application', 'octate-stream')
        payload.set_payload((attach_file).read())
        encoders.encode_base64(payload)
        payload.add_header('Content-Decomposition', 'attachment', filename=file_to_attach)
        message.attach(payload)


def send_mail(to, subject='TWIGA SALES', text='Test message', files=None):
    sender = config['DEFAULT']['SOURCE_ADDR']
    pwd = config['DEFAULT']['SOURCE_PWD']
    message = EmailMessage()
    message['From'] = sender
    message['To'] = ", ".join(to)
    message['Subject'] = subject
    message.set_content('HTML disabled?')
    message.add_alternative(text, subtype='html')

    for f in files or []:
        with open(f, "rb") as fil:
            part = MIMEApplication(
                fil.read(),
                Name=basename(f)
            )
        part['Content-Disposition'] = 'attachment; filename="%s"' % basename(f)
        message.attach(part)

    with SMTP_SSL(config['DEFAULT']['SMTP_SERVER'], config['DEFAULT']['PORT']) as smtp:
        smtp.login(sender, pwd)
        smtp.send_message(message)
    print('Mail sent...')


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Send mail')
    parser.add_argument('receivers', type=str, nargs='+', help='Receiver(s) separated by space')
    args = parser.parse_args()
    print(args.receivers)
    files = ['README.md']
    send_mail(args.receivers, files=files)
