FROM python:3.6

RUN mkdir -p /opt/backend_rest
WORKDIR /opt/backend_rest

RUN apt-get update && apt-get install -y supervisor && mkdir -p /var/log/supervisor


COPY ./requirements.txt /opt/backend_rest
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . /opt/backend_rest
RUN python manage.py collectstatic --noinput

COPY ./conf/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
CMD ["/usr/bin/supervisord"]
