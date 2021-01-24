const express = require('express');
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');

const PORT = 8080;

const APP_ID = 'paste your app id';
const APP_CERTIFICATE = "paste your certificate";

const app = express();
var crypto = require("crypto");

// create random channel name
function getChannelName(){ 
  var id = crypto.randomBytes(6).toString('hex');
  return "channel-"+id;
}


const nocache = (req, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
}

const generateAccessToken = (req, resp) => {
  // set response header
  resp.header('Acess-Control-Allow-Origin', '*');

  // get uid 
  let uid = req.query.uid;
  if(!uid || uid == '') {
    uid = 0;
  }
  // get role
  let role = RtcRole.SUBSCRIBER;
  if (req.query.role == 'publisher') {
    role = RtcRole.PUBLISHER;
  }
  // get the expire time
  let expireTime = req.query.expireTime;
  if (!expireTime || expireTime == '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  // create random channel name
  var channelName = getChannelName();

  // build the token
  const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
  // return the token
  return resp.json({ 'channelName' : channelName,'token': token });
}

app.get('/agora-token', nocache, generateAccessToken);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

