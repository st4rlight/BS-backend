// The Auth module handles the userinfo and generates a JWT
const jwt           = require('jsonwebtoken');
const config        = require('../config/config');
const getTimestamp  = require('../util/getTimestamp');
const userDataModel = require('../dataModels/user');

var LoginAuth = function(userinfo, callback) {
    this.userinfo = userinfo;
    this.isValidUser = false;
    this.isAuthorized = false;

    // Return an empty string if we cannot get a valid token
    this.getAccessToken = function (callback) {
        if(!this.isAuthorized) return '';
        var payload = {
            account:   userinfoObject.account,
            iat:        getTimestamp()
        };
        if(callback) return jwt.sign(payload, config.accessKey, callback)
        else return jwt.sign(payload, config.accessKey);
    };

    if(typeof userinfo !== 'string')
        return;
    
    var userinfoObject = this.userinfoObject
        = {account: null, password: null, timestamp: null};
    var originalString = Buffer.from(userinfo, 'base64').toString();
    try {
        var tempObject = JSON.parse(originalString);
        this.userinfo = tempObject;
        
        for(prop in tempObject) {
            userinfoObject[prop] = tempObject[prop];
        }
    } catch (e) {
        console.log(e);
        return;
    }
    
    
    var _this = this;
    userDataModel.isUser(userinfoObject.account, function(results, fields){
        _this.isValidUser = results.length !==0;
        if(!_this.isValidUser){
            callback(_this);
            return;
        }
        if(getTimestamp() - userinfoObject.timestamp < config.sessionTimeLimit) {
            userDataModel.isAuthorized(userinfoObject.account, userinfoObject.passwd, function(results, fields){
                _this.isAuthorized = results.length !== 0;
                callback(_this);
            });
        }
    });
}


LoginAuth.isVerifiedAccessToken = (token) => {
    if(typeof token !== 'string') return false;
    try {
        var decoded = jwt.verify(token, config.accessKey);
        if(getTimestamp() - decoded.iat > config.sessionTimeLimit) return false;
        return true;
    } catch(e) {
        return false;
    }
}

LoginAuth.updateAccessToken = (token) => {
    try {
        var decoded = jwt.verify(token, config.accessKey);
        var payload = {
            'account':  decoded.account,
                'iat':  getTimestamp()
        };
        
        return jwt.sign(payload, config.accessKey);
    } catch(e) {
        return false;
    }
}

LoginAuth.getUsername = (token) => {
    try {
        var decoded = JSON.parse(jwt.verify(token, config.accessKey));
        return decoded.account;
    } catch(e) {
        return '';
    }
}

module.exports = LoginAuth;