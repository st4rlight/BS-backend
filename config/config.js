// Server configurations
module.exports = {
    accessPort          : 8888,
    portWhenProxy       : 8889,
    frontendPort        : 8080,
    hostname            : 'localhost',
    // Session time limit in seconds, 900s = 15minute
    sessionTimeLimit    : 900,
    // Key for encrypting app token
    accessKey           : 'st4rlight_Bs_AccessKey',
    getStaticPath       : path => ('/#/' + path).replace('//', '/'),
    apiPathPattern      : /\/api/,
    getApiPath          : path => ('/api/' + path).replace('//', '/'),
};