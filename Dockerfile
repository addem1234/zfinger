FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y python3 pipenv nodejs npm git

WORKDIR /zfinger

COPY package.json package-lock.json .babelrc ./
RUN npm install

COPY ./src ./src
COPY ./public ./public
RUN npm run build

COPY app.py s3.py Pipfile Pipfile.lock ./
RUN pipenv sync

# Do something to make sure this runs as a user account and not root inside the
# container. Not super critical, but should probably be done.

CMD ["pipenv", "run", "gunicorn", "-b", "0.0.0.0:5000", "app:app"]
