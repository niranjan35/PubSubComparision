var amqp = require("amqplib/callback_api");
const os = require('os');
const NUMBER_OF_CPUS = os.cpus().length;
let startTime  = process.hrtime()
let startUsage = process.cpuUsage()

var time = 0;
var limit = 10;

var timer = setInterval(() => {
  time+=1;
  if(time>=limit){
    clearInterval(timer);
  }
  var now = Date.now()
  amqp.connect("amqp://localhost",function(err,conn){
    conn.createChannel(function(err,ch){
      var q = "queue_name";
      var msg = "this is the message string!!!";
      ch.assertQueue(q,{durable: false});
      ch.sendToQueue(q,new Buffer(msg),{persistent: false});
      // console.log("time = "+time);
    });
  });

  const newTime = process.hrtime();
  const newUsage = process.cpuUsage();
  const elapTime = process.hrtime(startTime)
  const elapUsage = process.cpuUsage(startUsage)
  startUsage = newUsage;
  startTime = newTime;


  const elapTimeMS = hrtimeToMS(elapTime)

  const elapUserMS = elapUsage.user / 1000; // microseconds to milliseconds
  const elapSystMS = elapUsage.system / 1000;
  const cpuPercent = (100 * (elapUserMS + elapSystMS) / elapTimeMS / NUMBER_OF_CPUS).toFixed(1) + '%'

  console.log('elapsed time ms:  ', elapTimeMS)
  console.log('elapsed user ms:  ', elapUserMS)
  console.log('elapsed system ms:', elapSystMS)
  console.log('cpu percent:      ', cpuPercent, '\n')

}, 1000);

function hrtimeToMS (hrtime) {
  return hrtime[0] * 1000 + hrtime[1] / 1000000
}
