var redis = require("redis");
var fs = require("fs");

const os = require('os');
const NUMBER_OF_CPUS = os.cpus().length;
let startTime  = process.hrtime()
let startUsage = process.cpuUsage()

var time = 0;
var limit = 100000;

var pub = redis.createClient();

fs.stat(__dirname+"/redisPubStats.txt", function (err, stats) {
  console.log("checking if the write file exists and status is : "+stats);
  if (err) {
      return console.log("file doesnt exists prior starting the program, thus creating it !!!");
  }
  fs.unlink(__dirname+"/redisPubStats.txt",function(err){
       if(err){
         return console.log(err);
       }
       console.log("file exists prior starting the program, so deleted");
  });
});

var timer = setInterval(() => {
  time+=1;
  if(time>=limit){
    clearInterval(timer);
  }
  var now = Date.now()
  var channel = "channel"+time; //publish
  var message = "message"+time; //publish
  pub.publish(channel,message); //publish

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

  // console.log('elapsed time ms:  ', elapTimeMS);
  // console.log('elapsed user ms:  ', elapUserMS);
  // console.log('elapsed system ms:', elapSystMS);
  // console.log('cpu percent:      ', cpuPercent, '\n');

  fs.appendFile(__dirname+"/redisPubStats.txt",new Buffer(cpuPercent+"\n"));
}, 50);

function hrtimeToMS (hrtime) {
  return hrtime[0] * 1000 + hrtime[1] / 1000000;
}
