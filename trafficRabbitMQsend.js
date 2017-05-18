var amqp = require("amqplib/callback_api");

var time = 0;

var timer = setInterval(function(){
  time+=1;
  if(time>=10){
    clearInterval(timer);
  }
  amqp.connect("amqp://localhost",function(err,conn){
    conn.createChannel(function(err,ch){
      var q = "queue_name";
      var msg = "this is the message string!!!";
      ch.assertQueue(q,{durable: false});
      ch.sendToQueue(q,new Buffer(msg));
      // console.log("time = "+time);
    });
  });
},1000);
