const db        = require('../util/dbTools');
const express   = require('express');
const router    = express.Router();
const config    = require('../config/config');
const mail      = require('../util/mail');

// const LoginAuth     = require('../modules/LoginAuth');

router.post('/validate',(req, res) => {
    var code = '';
    for(var i = 0; i < 6; i++)
        code += Math.floor(Math.random()*10);

    mail.sendmsg(req.body.mail, code, (result, info) => {
        if(result){
            var responseJSON = JSON.stringify({
                'validate_code':  code
            });
            res.header('Content-Type', 'application/json')
                .status(200)
                .send(responseJSON);
        }
        else
            res.sendStatus(204);
    });
});

router.post('/register', (req, res) => {
    var sql = 'INSERT INTO User(username, passwd, email) VALUE(?, PASSWORD(?), ?)';

    user = {account: null, passwd: null, email: null};
    var originalString = Buffer.from(req.body.userinfo, 'base64').toString();
    try {
        var tempObject = JSON.parse(originalString);
        for(prop in tempObject) {
            user[prop] = tempObject[prop];
        }
    } catch (e) {
        console.log(e);
        return;
    }

    db.query(sql, [user.account, user.passwd, user.email], (results, fields) =>{
        if( results.affectedRows ){
            res.sendStatus(200);

            var create_new = " CREATE TABLE IF NOT EXISTS `Record_" + user.account + "` ( \
                collect_id INT, \
                word VARCHAR(20), \
                memory_times INT,   \
                recite_times INT,   \
                recent_time DATE,   \
                is_finish BOOL, \
                PRIMARY KEY (collect_id, word)  \
                )ENGINE=InnoDB DEFAULT CHARSET=utf8; ";
            
                db.query(create_new,[], (results, fields) => {} );
        }
        else
            res.sendStatus(204);
    });
});

router.get('/userquery/:username', (req, res) => {
    res.redirect('/api/login/userquery/' + req.params['username']);
});

router.get('/mailquery/:mail', (req, res) =>{
    var email = req.params['mail'];
    var sql = 'select user_id from User where email = ?';
    db.query(sql, [email], function(results, fields){
        if(results.length !==0 )
            res.sendStatus(200);
        else
            res.sendStatus(204);
    });
});

module.exports = router;