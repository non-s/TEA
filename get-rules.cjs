const fs = require('fs');
const https = require('https');

const configPath = process.env.HOME + '/.config/configstore/firebase-tools.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const refreshToken = config.tokens.refresh_token;

const data = JSON.stringify({
  client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
  client_secret: 'NotSecret', 
  refresh_token: refreshToken,
  grant_type: 'refresh_token'
});

const req = https.request({
  hostname: 'oauth2.googleapis.com',
  path: '/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const token = JSON.parse(body).access_token;
    
    https.request({
      hostname: 'firebaserules.googleapis.com',
      path: '/v1/projects/non-s-firebase-20260621/rulesets',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, (res2) => {
      let body2 = '';
      res2.on('data', d => body2 += d);
      res2.on('end', () => {
        console.log("RULES API RESPONSE:", body2);
      });
    }).end();
  });
});

req.write(data);
req.end();
