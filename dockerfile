FROM node:18.17.0-alpine
WORKDIR /proxy-app
COPY . .
RUN yarn add express cors http-proxy-middleware
CMD node ./proxy.js