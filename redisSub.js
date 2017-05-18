var redis = require("redis");
var os = require("os");
var osUtils = require('os-utils');

var sub = redis.createClient();

sub.on("subscribe",function(channel,count){
  console.log("subscribed to the channel : "+channel);
});

sub.on("message",function(channel,message){
  console.log("message recieved from the channel : "+channel +" is : "+message);
});

var time = 0;
var limit = 10;

var timer = setInterval(function(){
  time+=1;
  if(time>=limit){
    clearInterval(timer);
  }
  var channelSubscribe = "channel"+time;
  sub.subscribe(channelSubscribe);
},100);

console.log("os.totalmem = "+os.totalmem());
console.log("os.freemem = "+os.freemem());

osUtils.cpuUsage(function(v){
    console.log( 'CPU Usage (%): ' + v );
});
