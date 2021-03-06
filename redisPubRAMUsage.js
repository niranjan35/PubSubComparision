var redis = require("redis");
var fs = require("fs");
var util = require("util");

const os = require('os');
const NUMBER_OF_CPUS = os.cpus().length;
let startTime  = process.hrtime();
let startUsage = process.cpuUsage();

var time = 0;
var limit = 100000;
var flag = 0;

var pub = redis.createClient();

fs.stat(__dirname+"/redisPubRAMUsage.txt", function (err, stats) {
  console.log("checking if the write file exists and status is : "+stats);
  if (err) {
      return console.log("file doesnt exists prior starting the program, thus creating it !!!");
  }
  fs.unlink(__dirname+"/redisPubRAMUsage.txt",function(err){
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
    var channel = "channel "+time; //publish
    var message = "message "+time; //publish
    pub.publish(channel,message); //publish
  }, 10);
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
    fs.appendFile(__dirname+"/redisPubRAMUsage.txt",new Buffer(memUsed[2].toString().substr(0,memUsed[2].length-2)+"\n"));
  }
  initializeMemUsed();
},2000);
