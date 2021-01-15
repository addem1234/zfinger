FROM ubuntu:latest
RUN apt-get update && apt-get install -y python3 && mkdir /zfinger
WORKDIR /zfinger
