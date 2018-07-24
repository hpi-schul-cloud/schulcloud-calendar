function textToJson( eventText ){
	let json = {};

	eventText=eventText.replace('END:VEVENT',''); //'END:VALARM'
	const arr = eventText.split(/(\r\n|\n|:)/g);

	let key=undefined;
	for(var i=0; i<arr.length; i++){	
		if(arr[i] != '\r\n' && arr[i] != ':' && arr[i] != ''){		
			if(key){
				json[key]=arr[i];
				key=undefined
			}else{
				key=arr[i].toLowerCase();
			}	
		}
	} 
	return json;
}


function icsParser(text){
	//https://www.npmjs.com/package/cozy-ical
	//muss pass plain text AND xml formated iCalendar
	let events = [];
	
	if( /BEGIN:VEVENT/.test(text) ){ //plain text	
		let eventsRowData=text.split('BEGIN:VEVENT');		//BEGIN:VALARM
		eventsRowData.shift();
		eventsRowData.pop();
		events=eventsRowData.map( textToJson );	
	}else if ( /<vevent>/.test(text) ){ 		//xml
		let eventsRowData=text.split('<vevent>');
	}else{
		//error
		return []
	}
	console.log(events);

	return events
}

module.exports = icsParser;