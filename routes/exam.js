const express       = require('express');
const router        = express.Router();
const config        = require('../config/config');
const getTimestamp  = require('../util/getTimestamp');
const db            = require('../util/dbTools');
const moment        = require('moment')
const Axios         = require('axios');


router.post('/wordList', (req, res) => {
        var collect = req.body['collect'];
         var number = req.body['number'];
         
        var sql = "select * from " + collect + " order by rand() limit ?";
        db.query(sql, [number], function(results, fields){
            if( results.length !== 0){
                var responseJSON = JSON.stringify({
                    'wordList': results
                });
                res.header('Content-Type', 'application/json')
                    .status(200)
                    .send(responseJSON); 

            } else{
                res.sendStatus(204);
            }
        });
});


router.post('/wrongChoices', (req, res) => {
        var index   = req.body['index'];
        var collect = req.body['collect'];
        var number  = req.body['number'];

        var sql = "select * from " + collect + " where id <> ? order by rand() limit ?";

        db.query(sql, [index, number], function(results, fields){
            if( results.length !== 0){
                var responseJSON = JSON.stringify({
                    'choices': results
                });
                res.header('Content-Type', 'application/json')
                    .status(200)
                    .send(responseJSON); 

            } else{
                res.sendStatus(204);
            }
        });
});

router.post('/record_exam_trace', (req, res) => {
         var    user_id = req.body['user_id'];
         var collect_id = req.body['collect_id'];
         var  total_num = req.body['total_num'];
         var  right_num = req.body['right_num'];
         var  wrong_num = req.body['wrong_num'];

        var sql = "insert into ExamTrace values(null, ?, ?, ? ,? ,?, null)";
        db.query(sql, [user_id, collect_id, total_num, right_num, wrong_num], function(results, fields){
                if( results.affectedRows !== 0)
                    res.sendStatus(200);
                else
                    res.sendStatus(204);
        });
       
});
module.exports = router;
