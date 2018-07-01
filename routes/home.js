const express       = require('express');
const router        = express.Router();
const config        = require('../config/config');
const getTimestamp  = require('../util/getTimestamp');
const db            = require('../util/dbTools');
const moment        = require('moment')
const Axios         = require('axios');


router.get('/everyday', (req, res) => {
    Axios.get('http://open.iciba.com/dsapi')
        .then( (myres) => {
            var responseJSON = JSON.stringify({
                info: myres.data
            });
            res.header('Content-Type', 'application/json')
                .status(200)
                .send(responseJSON); 
        })
        .catch( (err) =>　{
            throw err;
        })
});

module.exports = router;

