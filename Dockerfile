FROM ubuntu:18.04

RUN apt-get update -y && apt-get upgrade -y

RUN apt-get install curl \
    libgtk2.0-0 \
    libnotify-bin \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    build-essential \
    python2.7 -y

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs mesa-utils

WORKDIR /app
COPY . ./

RUN npm install

RUN npm run build