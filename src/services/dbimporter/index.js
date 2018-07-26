const request = require('request-promise-native');
const getSubscriptions = require('../../queries/subscriptions/getSubscriptions');
//const xml2js = require('xml2js');
const icsToJson = require('../../parsers/event/icsToJsonPromise');
//const icsToJson2 = require('./parser/ics');
const logger = require('../../infrastructure/logger');
const insertEvents = require('../events/insertEvents');
const querySQL = require('../../queries/subscriptions/querySQL');

const REQUEST_TIMEOUT = 4000;
const LAST_UPDATE_FAIL_STATUS = 500;
const LAST_UPDATE_SUCCESS_STATUS = 200;

const queryStatus = 'UPDATE subscriptions SET last_updated_status = $1 WHERE '+
					'subscription_id = $2 AND scope_id = $3 RETURNING id, last_updated_status;'
					
const updateDate = 	"UPDATE subscriptions SET last_updated = (TO_TIMESTAMP_TZ( CURRENT_TIMESTAMP ,'YYYY-MM-DD HH24:MI:SSXFF')) WHERE "+
					'subscription_id = $1 AND scope_id = $2 RETURNING id, last_updated;'

/**	'YYYY-MM-DD HH24:MI:SS'
*	@description 
*		Stand alone service to load and update subscriptions.
*		The service request the database and load all subscriptions.
*		After this they start for each subscription url a request load ressource,
*		parse it (only ics at the moment) and put the results with scope-ids into
*		the calendar database to events.
**/
function subscriptionUrlDbImporter(){
	const queryOptions={
		limit:10,
		time: 2*60*60*1000
	};
	getSubscriptions({},queryOptions)
	.then(subscription=>updateTimeStamp(subscription))
	.then(subscriptions=>{
		let requestList=subscriptions.map(subscription => {	
			return new Promise((resolve, reject) => {
				singleRequest(subscription,resolve,reject,icsToJson);
			})
			.then(events => add_dtend(events))
			.then(events => doInserts(events,subscription))
			.catch(err=>{
				querySQL(queryStatus,[LAST_UPDATE_FAIL_STATUS,subscription.subscription_id,subscription.scope_id]);
				console.log('error [Task]',subscriptions.ics_url,err);
			});
		});
		
		Promise.all(requestList).then( values => {		
			console.log('ready!');
			return true
		});
	});
}

function updateTimeStamp(subscription){
	console.log(subscription);
	querySQL(updateDate,[subscription.subscription_id,subscription.scope_id]);
	return subscription
}

function singleRequest(subscription,resolve,reject,parser=icsToJson){
	console.log('start',subscription.ics_url);
	const options = {
		uri : subscription.ics_url,
		method: 'GET',
		timeout: REQUEST_TIMEOUT,
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
		reject('error [Request] '+subscription.ics_url);
	});
}

function add_dtend(events){
	return events.map(event=>{
		if(event.dtend==undefined)
			event.dtend=new Date(new Date(event.dtstart).getTime() + (event.duration || 24*60*60*1000) ).toISOString();
		return event
	});			
}

function doInserts(events,subscription) {	
	const user=undefined;
    return new Promise(function (resolve, reject) {
        insertEvents(events, user)
            .then(()=>{
				querySQL(queryStatus,[LAST_UPDATE_SUCCESS_STATUS,subscription.subscription_id,subscription.scope_id]);
				resolve();
			})
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