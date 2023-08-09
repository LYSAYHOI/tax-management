FROM node:18.17.0-alpine
WORKDIR /proxy-app
COPY . .
RUN yarn install express cors http-proxy-middleware
CMD node ./proxy.js