var amqp = require("amqplib/callback_api");
var fs = require("fs");

const os = require('os');
const NUMBER_OF_CPUS = os.cpus().length;
let startTime  = process.hrtime()
let startUsage = process.cpuUsage()

var loop_count = 0;
var lim_loop = 10000;
var cycle_count = 1;

fs.stat(__dirname+"/comsumeCpuStats.txt", function (err, stats) {
  console.log("checking if the write file exists and status is : "+stats);
  if (err) {
      return console.log("file doesnt exists prior starting the program, thus creating it !!!");
  }
  fs.unlink(__dirname+"/comsumeCpuStats.txt",function(err){
       if(err){
         return console.log(err);
       }
       console.log("file exists prior starting the program, so deleted");
  });
});

setTimeout(function(){

  amqp.connect("amqp://localhost",function(err,conn){
    if(err){
      console.log("error in creatin conn object");
    }
    var timer = setInterval(function(){
      var now = Date.now();

      conn.createChannel(function(err,ch){
        if(err){
          console.log("error in createChannel method ----");
        }

        var q = "queue_name "+loop_count.toString();
        ch.assertQueue(q, {durable: true});
        ch.consume(q, function(msg) {
          // do nothing on consuming message
        }, {noAck: true});

        //cpu calculations
        const newTime = process.hrtime();
        const newUsage = process.cpuUsage();
        const elapTime = process.hrtime(startTime)
        const elapUsage = process.cpuUsage(startUsage)
        startUsage = newUsage;
        startTime = newTime;


        const elapTimeMS = hrtimeToMS(elapTime)

        const elapUserMS = elapUsage.user / 1000; // microseconds to milliseconds
        const elapSystMS = elapUsage.system / 1000;
        const cpuPercent = (100 * (elapUserMS + elapSystMS) / elapTimeMS / NUMBER_OF_CPUS).toFixed(1) + '%';

        fs.appendFile(__dirname+"/comsumeCpuStats.txt",new Buffer(cpuPercent.substr(0,cpuPercent.length-1)+","));

        //clear interval if loop count is more
        loop_count+=1;
        if(loop_count>=lim_loop){
          console.log("clearing , loop_count = "+loop_count);
          setTimeout(function(){clearInterval(timer)},500);
        }
      });

    },10);
  });

  function hrtimeToMS (hrtime) {
    return hrtime[0] * 1000 + hrtime[1] / 1000000;
  }

},500);
