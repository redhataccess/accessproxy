accessproxy
==============
[![NPM](https://nodei.co/npm/accessproxy.png)](https://nodei.co/npm/accessproxy/)

Install the module with:
```bash
sudo npm install accessproxy -g
```

This line must be in your /etc/hosts file for this proxy to work properly:
`127.0.0.1 foo.redhat.com prod.foo.redhat.com`

the module has a helper that will assist with this and can be run with
```bash
npm run -g accessproxy hosts --unsafe
```

_Note about the `--unsafe`_: This allows the npm script to run as YOUR user... by default npm runs scripts as 'nobody'. This will just execute the [hosts.sh](hosts.sh) script. Feel free to browse that script if you don't trust me. :smirk:

On first run you will be prompted to enter a ci server location. Enter this **without** the protocol i.e. `the.ci.server.com`

## License

Copyright (c) 2014
Licensed under the MIT license.
