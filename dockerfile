# build environment
FROM node:18.17.0-alpine as build 
WORKDIR /react-app
COPY . .
RUN yarn install
RUN yarn run build

# server environment
FROM nginx:1.25.1-alpine
COPY ./nginx/nginx.conf /etc/nginx/conf.d/configfile.template
COPY --from=build /react-app/build /usr/share/nginx/html

ENV PORT 8080
ENV HOST 0.0.0.0
EXPOSE 8080

CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"