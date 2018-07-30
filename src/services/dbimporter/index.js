const request = require('request-promise-native');
//const xml2js = require('xml2js');
const getSubscriptions = require('../../queries/subscriptions/getSubscriptions');
const icsToJson = require('../../parsers/event/icsToJsonPromise');
const insertEvents = require('../events/insertEvents');
const querySQL = require('../../queries/subscriptions/querySQL');

//config
const REQUEST_TIMEOUT = 4000;
const LAST_UPDATE_FAIL_STATUS = 500;
const LAST_UPDATE_SUCCESS_STATUS = 200;
const QUERY_LIMIT = 10;
const QUERY_TIME = 2*60*60*1000; //in ms = 2h

const queryStatus = 'UPDATE subscriptions SET last_updated_status = $1 WHERE '+
					'subscription_id = $2 AND scope_id = $3 RETURNING id, last_updated_status;'
					
const updateDate = 	"UPDATE subscriptions SET last_updated = (CURRENT_TIMESTAMP) WHERE "+
					'subscription_id = $1 AND scope_id = $2 RETURNING id, last_updated;'

/**	
*	@description 
*		Stand alone service to load and update subscriptions.
*		The service request the database and load all subscriptions.
*		After this they start for each subscription url a request load ressource,
*		parse it (only ics at the moment) and put the results with scope-ids into
*		the calendar database to events.
*	@todo	
*		Service can not interpret ics.xml files 
**/
function subscriptionUrlDbImporter(opt){
	const queryOptions=opt||{
		limit:QUERY_LIMIT,
		time: QUERY_TIME 
	};
	getSubscriptions({},queryOptions)
	.then(subscriptions=>updateTimeStamp(subscriptions))
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
			let miss=0, success=0;
			values.forEach(arr=>{
				if(arr==undefined)	miss++; 	//maybe logic must be replace later
				else 				success++;
			});
			console.log('ready! [total='+values.length+' / Query.limit='+queryOptions.limit+' | miss='+miss+' | success='+success+']');
			return true
		});
	});
}

function updateTimeStamp(subscriptions){
	subscriptions.forEach(subscription=>{	
		querySQL(updateDate,[subscription.subscription_id,subscription.scope_id]).then(()=>{
			console.log('execute',subscription.ics_url);
		});
	});
	return subscriptions
}

function singleRequest(subscription,resolve,reject,parser=icsToJson){
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
            .then(data=>{
				querySQL(queryStatus,[LAST_UPDATE_SUCCESS_STATUS,subscription.subscription_id,subscription.scope_id]);
				console.log(subscription.ics_url,' insert '+data.length+' Events');
				resolve(data.length);
			})
            .catch(reject);
    }); 
}
module.exports = subscriptionUrlDbImporter;