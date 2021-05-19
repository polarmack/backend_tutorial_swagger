const Scrypt = require('scrypt-nonce-wrapper');
const scrypt = new Scrypt({ salt: 'qweasd1as2xzcdsasw' });

module.exports = scrypt;
