FROM ubuntu:20.04 AS frontend
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y python3 pipenv nodejs npm git && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 1000 zfinger && useradd -m --no-log-init -u 1000 -g zfinger zfinger
USER zfinger
WORKDIR /home/zfinger/

COPY package.json package-lock.json .babelrc ./
COPY ./src ./src
COPY ./public ./public
RUN npm install

COPY Pipfile Pipfile.lock ./
RUN pipenv sync
COPY app.py s3.py ./

CMD ["pipenv", "run", "gunicorn", "-b", "0.0.0.0:5000", "app:app"]
