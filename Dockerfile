FROM node:lts AS build

WORKDIR  /usr/src/app

ARG REACT_APP_API_URL="http://recyclerie.adapemont.fr"
ARG API_BASE_URL="http://recyclerie.adapemont.fr"
ARG VITE_BANNER_TEXT

COPY package.json ./

RUN npm install

COPY . .

RUN npm run fast-build


FROM nginx:latest

COPY --from=build /usr/src/app/dist/ /usr/share/nginx/html/
