var redis = require("redis");
var os = require("os");
var osUtils = require('os-utils');

var pub = redis.createClient();

var time = 0;
var limit = 50;

var timer = setInterval(function(){
  time+=1;
  if(time>=limit){
    clearInterval(timer);
  }
  var channel = "channel"+time;
  var message = "message"+time;
  pub.publish(channel,message);
},1000);

console.log("os.totalmem = "+os.totalmem());
console.log("os.freemem = "+os.freemem());

osUtils.cpuUsage(function(v){
    console.log( 'CPU Usage (%): ' + v );
});
