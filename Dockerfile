FROM node:lts AS build

WORKDIR  /usr/src/app

ARG REACT_APP_API_URL="http://recyclerie.adapemont.fr"
ARG API_BASE_URL="http://recyclerie.adapemont.fr"

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build


FROM nginx:latest

COPY --from=build /usr/src/app/build/ /usr/share/nginx/html/
