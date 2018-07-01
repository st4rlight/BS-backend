const app           = require('../app');
const config        = require('./config');
const http          = require('http');

// Port to run the backend app
var backPort = config.accessPort;

// If a full test is needed, run proxy server
var proxyOn  =  false;
if(process.argv.indexOf('proxy') + 1) {
    proxyOn = true;
    backPort = config.portWhenProxy;
}

const server = app.listen(backPort, () => {
    console.log('Back-end API server deploy:');
    console.log('Server running at ' + config.hostname + ':' + backPort + '\n');
});


// create another server to do proxy
if(proxyOn) {
    http.createServer((req, res) => {
        var port = (config.apiPathPattern.test(req.url)) ? backPort : config.frontendPort;
        var request  = http.request(
            {port, path:req.url, headers:req.headers, method:req.method},
            (response) => {
                res.writeHead(response.statusCode, response.headers);
                response.pipe(res);
            }
        );
        request.on('error', (e) => {
            console.error('Proxy request failed: ' + e.message);
            res.writeHead(500);
            res.end();
        });
        req.pipe(request);
    }).listen(config.accessPort, () => {
        console.log('Proxy server deploy:');
        console.log('Server running at ' + config.hostname + ':' + config.accessPort);
    })
}