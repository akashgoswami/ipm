FROM node:8-alpine

RUN npm i -g iota-pm

ENV IOTA_HOST iri
ENV API_PORT 14265
ENV REFRESH 10s

EXPOSE 8888

RUN adduser -D -S -s /bin/false -u 1001 ipm
USER ipm
VOLUME /home/ipm/

CMD iota-pm -i http://$IOTA_HOST:$API_PORT -p 0.0.0.0:8888 -r $REFRESH
