const request = require('request-promise-native');
const getSubscriptions = require('../../queries/subscriptions/getSubscriptions');
//const xml2js = require('xml2js');
const icsToJson = require('../../parsers/event/icsToJsonPromise');
//const icsToJson2 = require('./parser/ics');
const logger = require('../../infrastructure/logger');
const TIMEOUT = 4000;



/**
*	@description 	bla
**/

function subscriptionUrlDbImporter(){	
	getSubscriptions({},true).then(subscriptions=>{
		let requestList=subscriptions.map(subscription => {	
			return new Promise((resolve, reject) => {
				singleRequest(subscription,resolve,reject,icsToJson);
			}).catch(err=>{
				console.log('error [Task]', err);
			});
		});
		
		Promise.all(requestList).then( values => {
			
			//set all reject to 500 and all resolved
			console.log('ready!');
			return true
		});
	});
}

function singleRequest(subscription,resolve,reject,parser=icsToJson){
	console.log('start',subscription.ics_url);
	const options = {
		uri : subscription.ics_url,
		method: 'GET',
		timeout: TIMEOUT
	}
	
	const relationships = { 'scope-ids':[subscription['scope_id']], 'separate-users':false };	
	
	request(options).then(data => {
		console.log('load',subscription.ics_url);
		data=parser(data,reject,relationships,false);
		//console.log('loading Events',data);
		resolve(data);
	}).catch(err=>{
		console.log('error [Request] '+subscription.ics_url);  //err
		//reject(err);
	});
}


module.exports = subscriptionUrlDbImporter;