FROM python:3.7
#RUN apt-get update && apt-get install -y python3 pipenv && mkdir /zfinger
RUN mkdir /zfinger && cd zfinger && pip install --no-cache-dir pipenv
RUN pipenv install
WORKDIR /zfinger
