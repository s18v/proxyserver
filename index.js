let http = require('http')
let fs = require('fs')
let request = require('request')
let scheme = 'http://'
let argv = require('yargs')
    .default('host', '127.0.0.1')
    .argv
let port = argv.port || argv.host === '127.0.0.1' ? 8000 : 80
// destinationUrl is built using the --host and --port values
let destinationUrl = argv.url || scheme  + argv.host + ':' + port
//let destinationUrl = '127.0.0.1:8000'
// check if the --log argument is specified and proceed correspondingly
let outputStream = argv.log ? fs.createWriteStream(argv.log) : process.stdout

// Echo Server
http.createServer((req, res) => {
    outputStream.write(`Request received at: ${req.url}`)
    req.pipe(res)
    for (let header in req.headers) {
        res.setHeader(header, req.headers[header])    
    }
}).listen(8000);

// Proxy Server
http.createServer((req, res) => {
    outputStream.write(`Proxying request to: ${destinationUrl + req.url}`);
    
    let options = {
        headers: req.headers,
        url: `${destinationUrl + req.url}`
    }
    
    request(options).pipe(res)
    options.method = req.method
    req.pipe(request(options)).pipe(res)
    
    //Logging the request headers in our server callback
    outputStream.write('\n\n\n' + JSON.stringify(req.headers))
    req.pipe(outputStream)
    
    //logging the proxy request headers and content
    let downstreamResponse = req.pipe(request(options))
    downstreamResponse.pipe(outputStream)
    downstreamResponse.pipe(res)
}).listen(8001);

