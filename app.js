const bodyParser    = require('body-parser');
const fs            = require('fs');
const express       = require('express');
const config        = require('./config/config');
const createError   = require('http-errors');
const app           = express();

// Requiring routers
// The results are stored in var route:
// eg. ./routers/hello.js will be imported as:
//      route['hello']
// or simply:
//      route.hello
var router = {};
var routesPath  = './routes/';
var routerFiles = fs.readdirSync(routesPath);
routerFiles.map(filename => {
    if(filename.split('.').pop() === 'js') {
        filename = filename.split('.')[0];
        router[filename] = require(routesPath + filename);
    }
});

// Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// Static
app.use('', express.static('public'));
// Here to route modules
app.use(config.getApiPath('login'), router.login);
app.use(config.getApiPath('reg'), router.reg);
app.use(config.getApiPath('plan'), router.plan);
app.use(config.getApiPath('recite'), router.recite);
app.use(config.getApiPath('review'), router.review);
app.use(config.getApiPath('exam'), router.exam);
app.use(config.getApiPath('favorite'), router.favorite);
app.use(config.getApiPath('home'), router.home);

// app.use(config.getApiPath('plan'), router.plan);
// Error handling
// app.use((req, res, next) => {
//     next(createError(404));
// });


module.exports = app;