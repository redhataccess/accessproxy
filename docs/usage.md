## Options

* `accessproxy -h, --help` - Output usage information.
* `accessproxy -V, --version` - Output the version number.
* `accessproxy -l, --listen <n>` - The port to listen on.
* `accessproxy -t, --target <n>` - The port to loopback to.
* `accessproxy -T, --hostname <hostname>` - The hostname to loopback to.
* `accessproxy -p, --proxy <hostname>` - The hostname to proxy to.
* `accessproxy -v, --verbose` - Enable verbose logging.
* `accessproxy -m, --mode <mode>` - Proxy mode (labs, portal, or mixed).
* `accessproxy -s, --static <path>` - Path to serve up static assets.

## Commands

* `accessproxy [options]` - The default command starts the proxy with the provided options.
* `accessproxy configure` - The configure command invokes configuration process.

## Configuration

Invoke configuration with `accessproxy configure`.

Configure will ask you for your preferred hosts.  
The defaults (`foo.redhat.com` & `prod.foo.redhat.com` will be used if configuration is not run)
