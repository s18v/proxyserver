let request = require('request')
let fs = require('fs')
let http = require('http')
let argv = require('yargs')
    .default('host', '127.0.0.1')
    .argv
let scheme = 'http://'
let port = argv.port || argv.host === '127.0.0.1' ? 8000 : 80
// destinationUrl is built using the --host and --port values
let destinationUrl = argv.url || scheme  + argv.host + ':' + port
// check if the --log argument is specified and proceed correspondingly
let outputStream = argv.log ? fs.createWriteStream(argv.log) : process.stdout

// Echo Server
http.createServer((req, res) => {
    console.log(`Request received at: ${req.url}`)
    req.pipe(res)
    for (let header in req.headers) {
        res.setHeader(header, req.headers[header])    
    }
}).listen(8000);

// Proxy Server
http.createServer((req, res) => {
    console.log(`Proxying request to: ${destinationUrl + req.url}`);
    //Logging the request headers in our server callback
    outputStream.write('\n\n\n' + JSON.stringify(req.headers))
    req.pipe(outputStream)
    
    let options = {
        headers: req.headers,
        url: `http://${destinationUrl}${req.url}`
    }
    request(options)
    request(options).pipe(res)
    options.method = req.method
    req.pipe(request(options)).pipe(res)
    
    //logging the proxy request headers and content
    let downstreamResponse = req.pipe(request(options))
    outputStream.write(JSON.stringify(downstreamResponse.headers))
    downstreamResponse.pipe(outputStream)
    downstreamResponse.pipe(res)
    
}).listen(8001);

