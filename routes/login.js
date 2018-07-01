const express       = require('express');
const router        = express.Router();
const config        = require('../config/config');
const LoginAuth     = require('../modules/LoginAuth');
const userDataModel = require('../dataModels/user');
const getTimestamp  = require('../util/getTimestamp');
const db            = require('../util/dbTools');


router.post('/userinfo', (req, res) => {
    LoginAuth(req.body.userinfo, function(loginAuth){
        if(!loginAuth.isAuthorized)
            res.sendStatus(204);
        else {
            var account = loginAuth.userinfo.account;

            var sql = 'select user_id, username, phone_num, email from User where username = ?';
            db.query(sql, [account], function(results, fields){
                var responseJSON = JSON.stringify({
                    accessToken:    loginAuth.getAccessToken(),
                      timestamp:    getTimestamp(),
                       userinfo:    results[0]
                });
                res.header('Content-Type', 'application/json')
                    .status(200)
                    .send(responseJSON); 
            });
        }
    });
});

router.get('/auth', (req, res) => {
    var verified = LoginAuth.isVerifiedAccessToken(req.headers['authorization']);
    if(verified){
        var responseJSON = JSON.stringify({
            accessToken:    LoginAuth.updateAccessToken(req.headers['authorization']),
              timestamp:    getTimestamp()
        });
        res.header('Content-Type', 'application/json')
            .status(200)
            .send(responseJSON);
    }
    else
        res.sendStatus(204);
});

// This stuff checks if username is valid
router.get('/userquery/:username', (req, res) => {
    var username = req.params['username'];
    userDataModel.isUser(username,function(results, fields){
        if(results.length !==0 )
            res.sendStatus(200);
        else
            res.sendStatus(204);
    });
});

router.get('/collections', (req, res) => {
    var sql = 'select * from Collections';

    db.query(sql, [], function(results, fields){
        var responseJSON = JSON.stringify({
            collections: results
        });
        res.header('Content-Type', 'application/json')
            .status(200)
            .send(responseJSON); 
    });
});

module.exports = router;
