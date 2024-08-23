FROM ubuntu:latest 
RUN apt-get update && apt-get install -y node.js
RUN apt-get update && apt-get install -y npm
RUN mkdir project

WORKDIR /project

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm i
COPY index.js index.js
COPY .env .env
COPY src src
ENTRYPOINT ["node","index.js" ]


