const express       = require('express');
const router        = express.Router();
const config        = require('../config/config');
const getTimestamp  = require('../util/getTimestamp');
const db            = require('../util/dbTools');
const moment        = require('moment')
const Axios         = require('axios');


router.post('/wordList', (req, res) => {
    var progress = req.body['progress'];
       var num   = req.body['num'];
     var collect = req.body['collect'];
     var account = req.body['account'];
     var collect_id = req.body['collect_id'];
     
     var someDelete = "( select word from Record_" + account + " where collect_id = ? and is_finish = ? )"; 

     var sql = "select * from " + collect + " where id <= ? and word not in " +
            someDelete + " order by rand() limit ?";
     
     db.query(sql, [progress, collect_id, true,  num], function(results, fields){
        var responseJSON = JSON.stringify({
            'wordList': results
        });
        res.header('Content-Type', 'application/json')
            .status(200)
            .send(responseJSON); 
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
            var update = " update Record_" + account + " set review_times = review_times + 1, " +
                "recent_time = ?, is_finish = ? where collect_id = ? and word = ?";
                db.query(update, [recent_time, is_finish, collect_id, word], function(results2, fields2){
                    if( results2.affectedRows !== 0)
                        res.sendStatus(200);
                    else
                        res.sendStatus(204);
                });
        
        } else {
            var insert = " insert into Record_" + account + " values(?, ?, 0, 1, ? ,?)";
            db.query(insert, [collect_id, word, recent_time, is_finish], function( results3, fields3){
                if( results3.affectedRows !== 0)
                    res.sendStatus(200);
                else
                    res.sendStatus(204);    
            });
        } 
    });
});

router.post('/record_plan_trace', (req, res) =>　{
    var info = req.body;
    var sql = 'select * from ReviewTrace where user_id = ? and plan_id = ? and date = ?';

    db.query(sql, [info.user_id, info.plan_id, info.date], function(results, fields){
        if(results.length !== 0){
            var update = 'update ReviewTrace set number = number + ?, date = ? where user_id = ? and plan_id = ? and date = ?';
            
            db.query(update, [info.number, info.date, info.user_id, info.plan_id, info.date],function(results2, fields2){
                if( results2.affectedRows !== 0)
                    res.sendStatus(200);
                else  
                    res.sendStatus(204);
            });

        } else{
            var insert = 'insert into ReviewTrace VALUES( ?, ?, ?, ?)' ;
            db.query(insert, [info.user_id, info.plan_id, info.date, info.number ], function(results3, fields3){
                if(  results3.affectedRows !== 0 )
                    res.sendStatus(200);
                else
                    res.sendStatus(204);    
            });

        }
    });

});

router.post('/need_review_num', (req, res) => {
    var progress = req.body['progress'];
    var collect = req.body['collect'];
    var account = req.body['account'];
    var collect_id = req.body['collect_id'];
    var date = req.body['recent_date'];
  
    var some = "( select word from Record_" + account + " where collect_id = ? and ( " +
        "is_finish = ? or recent_time < ? ))"; 

    var sql = "select * from " + collect + " where id <= ? and word not in " + some;
    
    db.query(sql, [progress, collect_id, true,  date], function(results, fields){
     var responseJSON = JSON.stringify({
         'num': results.length
     });
     res.header('Content-Type', 'application/json')
         .status(200)
         .send(responseJSON); 
  });
});

router.post('/review_today', (req, res) => {
    var user_id = req.body['user_id'];
    var plan_id = req.body['plan_id'];
       var date = req.body['date'];

    var sql = "select number from ReviewTrace where user_id = ? and plan_id = ? and date = ?";
    
    db.query(sql, [user_id, plan_id, date], function(results, fields){
        if( results.length !==0 ){
            var responseJSON = JSON.stringify({
                'num': results[0]['number']
            });
            res.header('Content-Type', 'application/json')
                .status(200)
                .send(responseJSON); 
        
        } else {
            res.sendStatus(204);
        } 
  });
});


module.exports = router;
