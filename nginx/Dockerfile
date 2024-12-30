FROM nginx:stable-alpine
COPY ./nginx/app.conf /etc/nginx/conf.d/app.conf
COPY ./nginx/landing.conf /etc/nginx/conf.d/landing.conf
COPY  ./front-builder/dist /usr/share/nginx/html
#temporary landing
COPY  ./nginx/landing.html /usr/share/nginx/landing/index.html 