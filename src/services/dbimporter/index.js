const request = require('request-promise-native');
const getSubscriptions = require('../../queries/subscriptions/getSubscriptions');
//const xml2js = require('xml2js');
const icsToJson = require('../../parsers/event/icsToJsonPromise');
//const icsToJson2 = require('./parser/ics');
const logger = require('../../infrastructure/logger');
const TIMEOUT = 4000;
const insertEvents = require('../events/insertEvents');


/**
*	@description Stand alone service to load and update subscriptions.
*				 The service request the database and load all subscriptions.
*				 After this they start for each subscription url a request load ressource,
*				 parse it (only ics at the moment) and put the results with scope-ids into
*				 the calendar database to events.
**/

function subscriptionUrlDbImporter(){	
	getSubscriptions({},true).then(subscriptions=>{
		let requestList=subscriptions.map(subscription => {	
			return new Promise((resolve, reject) => {
				singleRequest(subscription,resolve,reject,icsToJson);
			})
			.then(events => add_dtend(events))
			.then(events => doInserts(events))
			.catch(err=>{
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
		timeout: TIMEOUT,
		headers:{
			"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			"Accept-Encoding":"gzip, deflate, br"
		}
	}
	//double adding 
	const relationships = { 'scope-ids':[subscription['scope_id']], 'separate-users':false };	
	
	request(options).then(data => {
		console.log('load',subscription.ics_url);
		resolve( parser(data,reject,relationships,false) );
	}).catch(err=>{
		console.log('error [Request] '+subscription.ics_url,err);  //err
		reject(err);
	});
}

function add_dtend(events){
	return events.map(event=>{
		if(event.dtend==undefined)
			event.dtend=new Date(new Date(event.dtstart).getTime() + (event.duration || 24*60*60*1000) ).toISOString();
		return event
	});			
}

function doInserts(events) {
	const user=undefined;
    return new Promise(function (resolve, reject) {
        insertEvents(events, user)
            .then(resolve)
            .catch(reject);
    }); 
}

module.exports = subscriptionUrlDbImporter;

/* @example alarm
			"included": [
				{
				  "type": "alarm",
				  "id": "24897696-ee2a-4dcc-ba14-6d8dc1107fb5",
				  "attributes": {
					"trigger": "-PT5M",
					"repeat": 2,
					"duration": "PT15M",
					"action": "DISPLAY",
					"attach": ";FMTTYPE=audio/basic:ftp://example.com/pub/sounds/bell-01.aud",
					"description": "Prepare for summer party // Email body",
					"attendee": "mailto:user@example.org",
					"summary": "Email subject"
				  }
				}
			] */