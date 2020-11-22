import configparser
import re
import os

print('Initializing deployment')

config = configparser.ConfigParser()
config.sections()
config.read('conf/settings.ini')
DEFAULT = config['DEFAULT']

program_name = DEFAULT['program_name']
project_name = DEFAULT['project_name']
supervisord_path = DEFAULT['supervisord_path']
nginx_path = DEFAULT['nginx_path']
domain_name = DEFAULT['domain_name']


def run_command(cmd):
    print("Running command:")
    print(cmd)
    print()
    os.system(cmd)


def init_config(filein, fileout):
    with open(filein, 'r') as f:
        content = f.read()
        for key in DEFAULT:
            value = DEFAULT[key]
            content = re.sub(f'\\[[{key}]+\\]', value, content)

        with open(f'{fileout}', 'w') as f2:
            f2.write(content)
            print(f'Successfully written to {fileout}')
            return True


print(init_config("./conf/supervisord.conf", f'{supervisord_path}{program_name}.conf'))
print(init_config("./conf/nginx", f'{nginx_path}{program_name}'))

run_command(f'cd ../backend_rest && source ../.venv/bin/activate && python manage.py collectstatic --noinput')
run_command(f'sudo service nginx reload && sudo supervisorctl reload && sudo supervisorctl restart {program_name}')
run_command(f'sudo certbot --nginx --non-interactive --agree-tos --redirect -d {domain_name}')
