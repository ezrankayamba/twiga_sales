FROM nginx:alpine

RUN rm -rf /etc/nginx/conf.d
COPY nginx /etc/nginx

COPY ./dist/* /usr/share/nginx/html/