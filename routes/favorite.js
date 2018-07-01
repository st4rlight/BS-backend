const express       = require('express');
const router        = express.Router();
const config        = require('../config/config');
const getTimestamp  = require('../util/getTimestamp');
const db            = require('../util/dbTools');
const moment        = require('moment')
const Axios         = require('axios');

router.get('/allwords/:user_id', (req, res) => {
    var sql = "select * from Favorite where user_id = ? ";
    db.query(sql, req.params['user_id'], function(results, fields){
        var responseJSON = JSON.stringify({
            tableData: results
        });
        res.header('Content-Type', 'application/json')
            .status(200)
            .send(responseJSON); 
    });
});

router.put('/delete', (req, res) => {
    var sql = "delete from Favorite where user_id = ? and word = ?";
    db.query(sql, [req.body['user_id'], req.body['word']], function(results, fields){
        if( results.affectedRows !== 0){
            res.sendStatus(200);
        } else{
            res.sendStatus(204);
        }
    });
});


router.post('/new_word/:user_id', (req, res) => {
    var user_id = req.params['user_id'];
    var word    = req.body['word'];
    var meaning = req.body['meaning'];

    var sql = "INSERT INTO Favorite VALUES (?, ?, ?)";
    db.query(sql, [ user_id, word, meaning ], function(results, fields){
        if(results.affectedRows !== 0)
            res.sendStatus(200);
        else
            res.sendStatus(204);    
    });
});

router.put('/edit_word/:user_id', (req, res) => {
    var user_id  = req.params['user_id'];
    var new_word = req.body['new_word'];
    var meaning  = req.body['meaning'];
    var old_word = req.body['old_word'];

    var sql = "UPDATE Favorite SET word = ?, meaning = ? where user_id = ? and word = ?";

    db.query(sql, [ new_word, meaning, user_id, old_word ], function(results, fields){
        if(results.affectedRows !== 0)
            res.sendStatus(200);
        else
            res.sendStatus(204);    
    });
});
module.exports = router;
