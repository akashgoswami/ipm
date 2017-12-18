FROM node:8-alpine

ARG UID=1601
ARG GID=1601

RUN npm i -g iota-pm

ENV IOTA_HOST iri
ENV API_PORT 14265
ENV REFRESH 10s

EXPOSE 8888

RUN  addgroup --gid ${GID} ipm \
  && adduser --home /opt/ipm --no-create-home --uid ${UID} --gecos "IPM user" --gid ${GID} --disabled-password ipm

USER ipm
VOLUME /opt/ipm/

CMD iota-pm -i http://$IOTA_HOST:$API_PORT -p 0.0.0.0:8888 -r $REFRESH
