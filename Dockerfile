from library/node

RUN npm i -g iota-pm

EXPOSE 8081
ENTRYPOINT ["iota-pm", "--iri=http://node1.iota.buaho.net:14265", "--port=0.0.0.0:8081"]

