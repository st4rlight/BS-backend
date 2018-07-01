const express       = require('express');
const router        = express.Router();
const config        = require('../config/config');
const getTimestamp  = require('../util/getTimestamp');
const db            = require('../util/dbTools');
const moment        = require('moment')
const Axios         = require('axios');

router.get('/random/:nums',(req, res) => {
    var sql = "SELECT * FROM Collections";
    var num = parseInt(req.params['nums']);

    db.query( sql, [], function( results, fields) {
        var total = results.length;
        var random = parseInt(Math.random() * total );
        
        var sql2 = "SELECT * FROM "+ results[random].collect + " ORDER BY RAND() LIMIT ?";

        db.query(sql2, [ num ], function(results2, fields2) {
            if( results2.length !== 0){
                var responseJSON = JSON.stringify({
                    wordList: results2
                });
                res.header('Content-Type', 'application/json')
                    .status(200)
                    .send(responseJSON);
            } else{
                res.sendStatus(204);
            }
        });

    });

});

router.post('/recite_plan', (req, res) => {
    var progress = req.body['progress'];
    var num = parseInt(req.body['num']);
    var collect = req.body['collect'];

    var sql = "select * from " + collect + " where id > ? limit ?"; 
    
    
    db.query(sql, [progress, num], function( results, fields ){
        if( results.length !== 0){
            var responseJSON = JSON.stringify({
                wordList: results
            });
            res.header('Content-Type', 'application/json')
                .status(200)
                .send(responseJSON);
        
        } else {
            res.sendStatus(204);
        } 
    });
});

router.post('/word_recite_record', (req, res) => {
    var collect_id = req.body['collect_id'];
    var word = req.body['word'];
    var recent_time = req.body['recent_time'];
    var is_finish = req.body['is_finish'];
    var account = req.body['account'];

    var sql = "select * from Record_" + account + " where collect_id = ? and word = ?";

    db.query(sql, [collect_id, word], function( results, fields ){
        if( results.length !== 0){
            var update = " update Record_" + account + " set recite_times = recite_times + 1, " +
                "recent_time = ?, is_finish = ? where collect_id = ? and word = ?";
                db.query(update, [recent_time, is_finish, collect_id, word], function(results2, fields2){
                    if( results2.affectedRows !== 0)
                        res.sendStatus(200);
                    else
                        res.sendStatus(204);
                });
        
        } else {
            var insert = " insert into Record_" + account + " values(?, ?, 1, 0, ? ,?)";
            db.query(insert, [collect_id, word, recent_time, is_finish], function( results3, fields3){
                if( results3.affectedRows !== 0)
                    res.sendStatus(200);
                else
                    res.sendStatus(204);    
            });
        } 
    });
});

router.get('/getPh/:word', (req, res) => {
    var word = req.params['word'] + '';
    word = word.toLowerCase();
    word = word.replace(/(^\s*)|(\s*$)/g, "");
    
    Axios.get("http://dict-co.iciba.com/api/dictionary.php?w=" + word + 
    "&type=json&key=7F945E6804D0C96706C3967161CA6001")
        .then( (resp) => {
            var responseJSON = JSON.stringify({
                ph_en: resp.data['symbols'][0].ph_en,
                ph_am: resp.data['symbols'][0].ph_am,
                ph_en_mp3: resp.data['symbols'][0].ph_en_mp3,
                ph_am_mp3: resp.data['symbols'][0].ph_am_mp3

            });
            res.header('Content-Type', 'application/json')
                .status(200)
                .send(responseJSON); 
        })
        .catch( (err) => {
            res.sendStatus(204);
        })
});

router.get('/getHtml/:word', (req,res) => {
    var word = req.params['word'] + '';
    word = word.toLowerCase();
    word = word.replace(/(^\s*)|(\s*$)/g, "");

    Axios.get("http://dict.youdao.com/m/search?keyfrom=dict.mindex&q=" + word)
        .then( (resp) => {
            var endIndex = resp.data.indexOf('<a href="/m/' + word + '/example.html');
            if( endIndex === -1)
                endIndex = resp.data.indexOf('<form action="/m/search" method="get"><div>');
            if( endIndex === -1)
                endIndex = resp.data.length;

            var rawHtml = resp.data.substring(0, endIndex);
            rawHtml += '</div><div class="content">&copy;2018 网易公司<br/></div></body></html>';    

            var responseJSON = JSON.stringify({
                rawHtml: rawHtml
            });
            res.header('Content-Type', 'application/json')
                .status(200)
                .send(responseJSON); 
        })
        .catch( (err) => {
            res.sendStatus(204);
        });
});

router.post('/is_favorited', (req, res) => {
    var word = req.body['word'] + '';
    word = word.toLowerCase();
    word = word.replace(/(^\s*)|(\s*$)/g, "");

    var user_id = req.body['user_id'];

    var sql = " SELECT * FROM Favorite WHERE user_id = ? and word = ?";
    db.query(sql, [user_id, word], function(results, fields){
        if( results.length !== 0)
            res.sendStatus(200);
        else
            res.sendStatus(204);    
    });
});

router.post('/favorite', (req,res) => {
    var word = req.body['word'] + '';
    word = word.toLowerCase();
    word = word.replace(/(^\s*)|(\s*$)/g, "");

    var user_id = req.body['user_id'];
    var meaning = req.body['meaning'];

    var sql = " INSERT INTO Favorite VALUES (?, ?, ?)";
    db.query(sql, [user_id, word, meaning], function(results, fields){
        if( results.affectedRows !== 0)
            res.sendStatus(200);
        else
            res.sendStatus(204);    
    });
});

// 保存背诵记录
router.post('/record_random_trace', (req, res) =>　{
    var info = req.body;
    var sql = 'select * from RandomNum where user_id = ? and date = ?';

    db.query(sql, [info.user_id, info.date], function(results, fields){
        if(results.length !== 0){
            var update = 'update RandomNum set random_num = random_num + ?, date = ? where user_id = ? and date = ?';
            db.query(update, [info.random_num, info.date, info.user_id, info.date],function(results2, fields2){
                if( results2.affectedRows !== 0)
                    res.sendStatus(200);
                else  
                    res.sendStatus(204);
            });

        } else{
            var insert = 'insert into RandomNum VALUES( ?, ?, ?)' ;
            db.query(insert, [info.user_id, info.date, info.random_num ], function(results3, fields3){
                if(  results3.affectedRows !== 0 )
                    res.sendStatus(200);
                else
                    res.sendStatus(204);    
            });

        }
    });

});
router.post('/record_plan_trace', (req, res) =>　{
    var info = req.body;
    var sql = 'select * from DayTrace where user_id = ? and plan_id = ? and date = ?';

    db.query(sql, [info.user_id, info.plan_id, info.date], function(results, fields){
        if(results.length !== 0){
            var update = 'update DayTrace set number = number + ?, date = ? where user_id = ? and plan_id = ? and date = ?';
            db.query(update, [info.number, info.date, info.user_id, info.plan_id, info.date],function(results2, fields2){
                if( results2.affectedRows !== 0)
                    res.sendStatus(200);
                else  
                    res.sendStatus(204);
            });

        } else{
            var insert = 'insert into DayTrace VALUES( ?, ?, ?, ?)' ;
            db.query(insert, [info.user_id, info.plan_id, info.date, info.number ], function(results3, fields3){
                if(  results3.affectedRows !== 0 )
                    res.sendStatus(200);
                else
                    res.sendStatus(204);    
            });

        }
    });

});

router.post('/plan_recite_num', (req, res) => {
    var sql = "select * from DayTrace where plan_id = ? and date = ?";
    db.query(sql, [ req.body['plan_id'], req.body['date'] ], function( results, fields){
         if( results.length !== 0){
            var responseJSON = JSON.stringify({
                count: results[0].number
            });
            res.header('Content-Type', 'application/json')
                .status(200)
                .send(responseJSON); 
         }
         else
            res.sendStatus(204);
    });
});


module.exports = router;
