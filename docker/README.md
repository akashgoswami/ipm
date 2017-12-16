# IPM
IOTA Peer Manager.

IPM is a nodejs program for monitoring and managing IOTA peers connected with your IOTA Reference Implementation (IRI)
To learn more about IOTA, please visit [iota.org](http://iota.org)

This is not an official docker release of the [IPM Repo](https://github.com/akashgoswami/ipm). In case of problems contact me on Github at the [forked IPM Repo](https://github.com/ixidion/ipm).

## Run Command
```
docker run -t --rm -d -e REFRESH="10s" -e IOTA_HOST="iri" -e API_PORT="14265" -p 127.0.0.1:8888:8888 -v /change/config/folder:/home/ipm  ixidion/ipm:latest
```
Runs a IOTA Peermanager, which only accessible from  `localhost`. The IOTA host has the DNS name `iri` in this case and API enpoint is expected on the IOTA default port `14265`.

Ideally this container and IRI (IOTA Node) should be created and started by docker-compose. Please check  [IOTA-Docker-Repo](https://github.com/ixidion/iota-docker)
