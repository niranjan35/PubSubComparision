var amqp = require("amqplib/callback_api");
var os = require("os");
var osUtils = require('os-utils');

var time = 0;
var limit = 10;

var timer = setInterval(function(){
  time+=1;
  if(time>=limit){
    clearInterval(timer);
  }
  amqp.connect("amqp://localhost",function(err,conn){
    conn.createChannel(function(err,ch){
      var q = "queue_name";
      var msg = "this is the message string!!!";
      ch.assertQueue(q,{durable: false});
      ch.sendToQueue(q,new Buffer(msg),{persistent: false});
      // console.log("time = "+time);
    });
  });
},1000);

console.log("os.totalmem = "+os.totalmem());
console.log("os.freemem = "+os.freemem());

osUtils.cpuUsage(function(v){
    console.log( 'CPU Usage (%): ' + v );
});
