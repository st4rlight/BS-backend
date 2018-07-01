// This module should be able to drive the database
const db = require('../util/dbTools');

var userModel = {
    // Return true or false
    isUser(account, callback) {
        if(typeof account !== 'string')
            return false;

        var sql = 'select user_id from User where username = ?'
        return db.query(sql, [account], callback);
    },  
    isAuthorized(account, password, callback) {
        if(!this.isUser(account, function(results){
            if(results.length !== 0)
                return false;
        }));    
        if(typeof account !== 'string')
            return false;

        var sql = 'select user_id from User where username = ? and passwd = PASSWORD(?)';
        return db.query(sql, [account, password], callback);
    }
};

module.exports = userModel;