const { spawn } = require('child_process');
const delay=getRandomInt(60*1000);	//ms 
const QUERY_TIME = 2*60*60*1000; //ms = 2h
const QUERY_LIMIT = 10;

(function init(){
	setInterval(startProcess,QUERY_TIME+delay);	
})();

function startProcess(){
	const node = spawn('node',['./src/services/dbimporter/start','-time='+QUERY_TIME,'-limit='+QUERY_LIMIT]);
	node.stdout.on('data', (data) => {
	  console.log(`stdout: ${data}`);
	});

	node.stderr.on('data', (data) => {
	  console.log(`stderr: ${data}`);
	});

	node.on('close', (code) => {
	  console.log(`child process exited with code ${code}`);
	});
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}