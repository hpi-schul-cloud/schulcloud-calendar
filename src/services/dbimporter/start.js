const subscriptionUrlDbImporter = require('./');

const reducer = (options,arg) =>{
	if(arg.charAt(0)=='-'){
		arg=arg.substring(1).split('=');
		options[arg[0]]=arg[1];
	}
	return options
}

subscriptionUrlDbImporter( process.argv.slice(2).reduce(reducer,{}) );