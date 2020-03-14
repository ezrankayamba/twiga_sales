import configparser
import re
import os

print('Initializing deployment')

config = configparser.ConfigParser()
config.sections()
config.read('conf/settings.ini')
DEFAULT = config['DEFAULT']

program_name = DEFAULT['program_name']
supervisord_path = DEFAULT['supervisord_path']
nginx_path = DEFAULT['nginx_path']
domain_name = DEFAULT['domain_name']


def init_config(filein, fileout):
    with open(filein, 'r') as f:
        content = f.read()
        for key in DEFAULT:
            value = DEFAULT[key]
            content = re.sub(f'\\[[{key}]+\\]', value, content)

        with open(f'{fileout}', 'w') as f2:
            f2.write(content)


init_config("./conf/supervisord.conf", f'{supervisord_path}{program_name}.conf')
init_config("./conf/nginx", f'{nginx_path}{program_name}')

certbot = f'sudo certbot --nginx --non-interactive --agree-tos -d {domain_name}.nezatech.co.tz'
print(certbot)
os.system(certbot)
