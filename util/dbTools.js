var mysql = require('mysql');
var db = {};

// create a mysql connection pool
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '114092',
    database: 'BS',
    timezone: "+08:00"
});

db.query = function(sql, inserts, callback){
    return pool.query(sql, inserts, function(error, results, fields){
        if(error)
            throw error;
        else
            return callback(results, fields);
    });
};

db.exists = function(sql, inserts){
    return db.query(sql, inserts, function(results, fields){
        if(results.length !== 0)
            return true;
        else
            return false;
    });
}



db.stop = function(){
    pool.end(function(error){
        if(error){
            console.log('Close conn pool failed');
            throw error;
        }
    });
}


db.transaction = function(sql1, sql2, arg1, arg2, callback){
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(function(err) {
            if (err) { throw err; }
        
            connection.query(sql1, arg1, function (error, results1, fields1) {
              if (error) {
                return connection.rollback(function() {
                  throw error;
                });
              }
    
              connection.query(sql2, arg2, function (error, results2, fields2) {
                if (error) {
                  return connection.rollback(function() {
                    throw error;
                  });
                }
                connection.commit(function(err) {
                  if (err) {
                    return connection.rollback(function() {
                      throw err;
                    });
                  }

                  callback(results1, results2, fields1, fields2);
                  connection.release();
                });
              });
            });
          });        
      });
}

db.pool = pool;

module.exports = db;