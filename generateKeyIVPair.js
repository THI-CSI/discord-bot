const crypto = require('crypto');

let key = crypto.randomBytes(32).toString('hex');
let iv = crypto.randomBytes(16).toString('hex');

console.log(`Key: ${key}\nIV: ${iv}`);