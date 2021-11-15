FROM tiangolo/uwsgi-nginx-flask:python3.8-alpine

ENV PYTHONUNBUFFERED=1
ENV STATIC_URL /static
ENV STATIC_PATH /app/frontend/public/static

WORKDIR /app

COPY --from=frontend /app/build /app/frontend/public
COPY ./requirements.txt /var/www/requirements.txt
RUN pip install -r /var/www/requirements.txt
ADD requirements.txt .
RUN pip install -r requirements.txt

RUN ls /app/frontend/public

ADD api api
ADD uwsgi.ini .
ADD app.py .
