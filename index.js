let request = require('request');
let http = require('http')
let destinationUrl = '127.0.0.1:8000'

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
    console.log(`Proxying request to: ${destinationUrl}`);
    //Logging the request headers in our server callback
    process.stdout.write('\n\n\n' + JSON.stringify(req.headers))
    req.pipe(process.stdout)
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
    process.stdout.write(JSON.stringify(downstreamResponse.headers))
    downstreamResponse.pipe(process.stdout)
    downstreamResponse.pipe(res)
}).listen(8001);

