var amqp = require("amqplib/callback_api");
var fs = require("fs");
var util = require("util");

var loop_count = 0;
var lim_loop = 10000;
var flag = 0;

fs.stat(__dirname+"/RabbitmqRAMstats.txt", function (err, stats) {
  console.log("checking if the write file exists and status is : "+stats);
  if (err) {
      return console.log("file doesnt exists prior starting the program, thus creating it !!!");
  }
  fs.unlink(__dirname+"/RabbitmqRAMstats.txt",function(err){
       if(err){
         return console.log(err);
       }
       console.log("file exists prior starting the program, so deleted");
  });
});

setTimeout(function(){

  amqp.connect("amqp://localhost",function(err,conn){
    if(err){
      console.log("error in creating conn object");
    }
    var timer = setInterval(function(){
      var now = Date.now();

      conn.createChannel(function(err,ch){
        if(err){
          console.log("error in createChannel method ----");
        }
        function startQueuing(){
          var q = "queue_name "+loop_count.toString();
          var msg = "Message";
          ch.assertQueue(q,{durable: false});
          ch.sendToQueue(q,new Buffer(msg),{persistent: false});

        }

        startQueuing();

        //clear interval if loop count is more
        loop_count+=1;
        if(loop_count>=lim_loop){
          console.log("clearing timer");
          flag = 1;
          clearInterval(timer);
        }
      });

    },10);
  });

},500);

var ramCheck = setInterval(function(){
  if(flag === 1){
    clearInterval(ramCheck);
  }
  var memUsed;
  function initializeMemUsed(){
    memUsed = util.inspect(process.memoryUsage()).split(" ");
    writeRssToFile();
  }
  function writeRssToFile(){
    fs.appendFile(__dirname+"/RabbitmqRAMstats.txt",new Buffer(memUsed[2].toString().substr(0,memUsed[2].length-2)+"\n"));
  }
  initializeMemUsed();
},2000);
