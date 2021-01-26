const express = require('express');
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');

const PORT = 8080;

const app = express();
var crypto = require("crypto");


const homeResponse = (req, res) => {
  return res.status(500).json({ 'instructions': "The only available end-point is '/agora-token" });
}

// create random channel name
function getChannelName(){ 
  var id = crypto.randomBytes(3).toString('hex');
  return "vc_channel_"+id;
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

  const appId = req.query.appId;
  if (!appId) {
    return resp.status(500).json({ 'error': 'agora app id is required' });
  }

  const appCertificate = req.query.appCertificate;
  if (!appCertificate) {
    return resp.status(500).json({ 'error': 'agora app certificate is required' });
  }

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
  const token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpireTime);
  // return the token
  return resp.json({ 'channelName' : channelName,'token': token });
}

app.get('/', homeResponse);
app.get('/agora-token', nocache, generateAccessToken);


app.set( 'port', ( process.env.PORT || PORT ));

// Start node server
app.listen( app.get( 'port' ), function() {
  console.log( 'Node server is running on port ' + app.get( 'port' ));
  });
