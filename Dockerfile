FROM ubuntu:latest 
RUN apt-get update && apt-get install -y gcc
RUN apt-get update && apt install -y default-jre 
RUN apt-get update && apt-get install -y node.js
RUN apt-get update && apt-get install -y npm
RUN mkdir project

WORKDIR /project

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY index.js index.js
COPY .env .env
COPY src src

RUN npm i

RUN npm start
