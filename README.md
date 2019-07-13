!! Work in progress, absolute not ready for production or a working app !!
# F-IPM
Forked IOTA Peer Manager. 

F-IPM is a nodejs program for monitoring and managing IOTA peers connected with your IOTA Reference Implementation (IRI)
The original IPM is available at https://github.com/akashgoswami/ipm
To learn more about IOTA, please visit [iota.org](https://iota.org)


![F-IPM snapshot](/public/img/ipm.jpg)

## How to install

To install this package, 

> npm i -g iota-peers

## How to run

** Note: Before running this program, you should run your IOTA IRI or at least have a known IRI URI which is accessible. **

> iota-peers 

```
iota-peers [--iri=iri_api_url] [--port=IP:your_local_port] [--refresh=interval]
  -i --iri       = The API endpoint for IOTA IRI implementation (Full Node). 
  -p --port      = Local server IP and port where the dashboard web server should be running
  -r --refresh   = Refresh interval in seconds for IRI statistics gathering (default 10s)
  -h --help      = print this message
            
Example.
iota-peers -i http://127.0.0.1:14265 -p 127.0.0.1:8888
IPM will connect to IOTA endpoint and produce the status at localhost port 8888
To view the dashboard, simply open a browser and point to http://127.0.0.1:8888

``` 

### As a daemon using systemd
Copy the file located in systemd/iota-peers.service to /etc/systemd/system/iota-peers.service, modifying the parameters to match your setup.
Run `systemctl daemon-reload` for reloading your configuration. From here on you can use normal start/stop/status commands to manage iota-peers as a daemon.

## Persistent Tag

Any custom tag assigned to a peer will be saved inside user's home directory in file iota-peers.conf
In Windows this will be C:\Users\username and Linux it will be $HOME. If none of these could be found, it will try to create the file in current working directory.

## Peer management
The program doesn't manages peers configured in IRI config files. If you delete or add a peer via the UI, please make sure to update it also in the IRI config.
