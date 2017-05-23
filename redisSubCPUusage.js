var redis = require("redis");
var fs = require("fs");
var util = require("util");

const os = require('os');
const NUMBER_OF_CPUS = os.cpus().length;
let startTime  = process.hrtime();
let startUsage = process.cpuUsage();

var time = 0;
var limit = 10000;
var flag = 0;

var sub = redis.createClient();

sub.on("subscribe",function(channel,count){
  // console.log("subscribed to the channel : "+channel);
});

sub.on("message",function(channel,message){
  // console.log("message recieved from the channel : "+channel +" is : "+message);
});

fs.stat(__dirname+"/redisSubCPU.txt", function (err, stats) {
  console.log("checking if the write file exists and status is : "+stats);
  if (err) {
      return console.log("file doesnt exists prior starting the program, thus creating it !!!");
  }
  fs.unlink(__dirname+"/redisSubCPU.txt",function(err){
       if(err){
         return console.log(err);
       }
       console.log("file exists prior starting the program, so deleted");
  });
});

setTimeout(function(){
  var timer = setInterval(function(){
    time+=1;
    if(time>=limit){
      flag=1;
      clearInterval(timer);
    }
    var now;
    function startReadings(){
      now = Date.now();
      var channelSubscribe = "channel "+time; //subscription
      sub.subscribe(channelSubscribe); //subscription

      CPUReadingsDiff();
    }

    function CPUReadingsDiff(){
      const newTime = process.hrtime();
      const newUsage = process.cpuUsage();
      const elapTime = process.hrtime(startTime);
      const elapUsage = process.cpuUsage(startUsage);
      startUsage = newUsage;
      startTime = newTime;


      const elapTimeMS = hrtimeToMS(elapTime);

      const elapUserMS = elapUsage.user / 1000; // microseconds to milliseconds
      const elapSystMS = elapUsage.system / 1000;
      const cpuPercent = (100 * (elapUserMS + elapSystMS) / elapTimeMS / NUMBER_OF_CPUS).toFixed(1) + '%';

      fs.appendFile(__dirname+"/redisSubCPU.txt",new Buffer(cpuPercent.substr(0,cpuPercent.length-1)+","));
    }
    startReadings();
  }, 10);
},500);

function hrtimeToMS (hrtime) {
  return hrtime[0] * 1000 + hrtime[1] / 1000000;
}
