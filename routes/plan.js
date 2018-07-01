const express       = require('express');
const router        = express.Router();
const config        = require('../config/config');
const getTimestamp  = require('../util/getTimestamp');
const db            = require('../util/dbTools');
const moment        = require('moment');

router.get('/allPlans/:user_id', (req, res) => {
    var user_id = req.params['user_id'];
    var sql = 'select * from Plans as A, Collections as B where A.collect_id = B.collect_id and user_id = ?';
    db.query(sql, [user_id], function(results, fields){
        var responseJSON = JSON.stringify({
            'tableData': results
        });

        res.header('Content-Type', 'application/json')
            .status(200)
            .send(responseJSON);
    });
});

router.post('/new_plan/:user_id', (req, res) => {
    var user_id= req.params['user_id'];
    var plan = req.body;
    var collect_id = plan.collect_id;
    var start_date = moment(plan.start_date).format('YYYY-MM-DD HH:mm:ss');
    var end_date = moment(plan.end_date).format('YYYY-MM-DD HH:mm:ss');

    var sql = "INSERT INTO Plans VALUES (null, ?, ?, ? ,?, 0 )";
    db.query(sql, [user_id, collect_id, start_date, end_date ], function(results, fields){
        var responseJSON = JSON.stringify({
            'plan_id': results.insertId
        });

        if(results.affectedRows !== 0)
            res.header('Content-Type', 'application/json')
            .status(200)
            .send(responseJSON);
        else
            res.sendStatus(204);    
    });
});

router.put('/edit_plan/:plan_id', (req, res) => {
    var plan_id= req.params['plan_id'];
    var plan = req.body;
    var plan_id = plan.plan_id;
    var collect_id = plan.collect_id;
    var start_date = moment(plan.start_date).format('YYYY-MM-DD HH:mm:ss');
    var end_date = moment(plan.end_date).format('YYYY-MM-DD HH:mm:ss');

    var sql = "UPDATE Plans SET collect_id = ?, start_date = ? , end_date = ? where plan_id = ?";
    db.query(sql, [collect_id, start_date, end_date, plan_id ], function(results, fields){
        if(results.affectedRows !== 0)
            res.sendStatus(200);
        else
            res.sendStatus(204);    
    });
});

router.put('/delete/:plan_id',(req,res) => {
    var plan_id = req.params['plan_id'];
    var account = req.body['account'];
    var collect_id = req.body['collect_id'];
    var sql1 = "DELETE FROM Plans WHERE plan_id = ? ";
    var sql2 = "DELETE FROM Record_" + account + " WHERE collect_id = ?";

    try{
        db.transaction(sql1, sql2, [plan_id], [collect_id], function(results1, results2){
            if(results1.affectedRows !== 0)
                res.sendStatus(200);
            else
                res.sendStatus(204);    
        });
    } catch (err){
        res.sendStatus(204);
    }
});

router.put('/reset/:plan_id',(req,res) => {
    var plan_id = req.params['plan_id'];
    var account = req.body['account'];
    var collect_id = req.body['collect_id'];
    var sql1 = "Update Plans set progress = ? WHERE plan_id = ? ";
    var sql2 = "DELETE FROM Record_" + account + " WHERE collect_id = ?";

    try{
        db.transaction(sql1, sql2, [0, plan_id], [collect_id], function(results1, results2){
            if(results1.affectedRows !== 0)
                res.sendStatus(200);
            else
                res.sendStatus(204);    
        });
    } catch (err) {
        res.sendStatus(204);
    }
});


module.exports = router;
