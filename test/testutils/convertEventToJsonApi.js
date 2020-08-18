/**
 * Converts the Server-Request-Body to JsonApi-Body
 * @param body
 * @returns {object} - valid json-api body for calendar-service
 */
const convertEventToJsonApi = ({
	summary,
	location,
	description,
	startDate,
	endDate,
	duration,
	frequency,
	weekday,
	repeat_until,
	courseId,
	teamId,
	courseTimeId,
	scopeId,
} = {}) => ({
    data: [{
        type: 'event',
        attributes: {
            summary: summary,
            location: location,
            description: description,
            dtstart: startDate || '2017-07-28T15:00:00Z',
            dtend: endDate || new Date(new Date(startDate || '2017-07-28T23:00:00Z').getTime() + duration || 1000).toISOString(),
            dtstamp: new Date(),
            transp: 'OPAQUE',
            sequence: 0,
            repeat_freq: frequency,
            repeat_wkst: weekday,
            repeat_until: repeat_until,
            'x-sc-courseId': courseId,
            'x-sc-teamId': teamId,
            'x-sc-courseTimeId': courseTimeId,
        },
        relationships: {
            'scope-ids': [
                scopeId,
            ],
            'separate-users': false,
        },
    }],
});

module.exports = convertEventToJsonApi;
