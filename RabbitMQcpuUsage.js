var amqp = require("amqplib/callback_api");
var fs = require("fs");

const os = require('os');
const NUMBER_OF_CPUS = os.cpus().length;
let startTime  = process.hrtime()
let startUsage = process.cpuUsage()

var loop_count = 0;
var lim_loop = 10000;

fs.stat(__dirname+"/RabbitmqCPUstats.txt", function (err, stats) {
  console.log("checking if the write file exists and status is : "+stats);
  if (err) {
      return console.log("file doesnt exists prior starting the program, thus creating it !!!");
  }
  fs.unlink(__dirname+"/RabbitmqCPUstats.txt",function(err){
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

          performCpuCalc();
        }

        function performCpuCalc(){
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

          fs.appendFile(__dirname+"/RabbitmqCPUstats.txt",new Buffer(cpuPercent.substr(0,cpuPercent.length-1)+","));
        }

        startQueuing();

        //clear interval if loop count is more
        loop_count+=1;
        if(loop_count>=lim_loop){
          console.log("clearing timer");
          clearInterval(timer);
        }
      });

    },10);
  });

  function hrtimeToMS (hrtime) {
    return hrtime[0] * 1000 + hrtime[1] / 1000000;
  }

},500);
