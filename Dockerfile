FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y python3 pipenv nodejs npm git

RUN groupadd -g 1000 zfinger && useradd -m --no-log-init -u 1000 -g zfinger zfinger
USER zfinger
WORKDIR /home/zfinger/

COPY package.json package-lock.json .babelrc ./
COPY ./src ./src
COPY ./public ./public
RUN npm install

COPY app.py s3.py Pipfile Pipfile.lock ./
RUN pipenv sync

CMD ["pipenv", "run", "gunicorn", "-b", "0.0.0.0:5000", "app:app"]
