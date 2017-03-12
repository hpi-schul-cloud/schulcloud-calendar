const {
    allColumns,
    insertColumns,
    insertTemplate,
    // updateTemplate
} = require('../utils/queryStrings');

const columns = [
    'id',
    'summary',
    'location',
    'description',
    'dtstart',
    'dtend',
    'scope_id',
    'dtstamp',
    'repeat_freq',
    'repeat_until',
    'repeat_count',
    'repeat_interval',
    'repeat_bysecond',
    'repeat_byminute',
    'repeat_byhour',
    'repeat_byday',
    'repeat_bymonthday',
    'repeat_byyearday',
    'repeat_byweekno',
    'repeat_bymonth',
    'repeat_bysetpos',
    'repeat_wkst',
    'event_id'
];

module.exports = {
    allColumns: allColumns(columns),
    insertColumns: insertColumns(columns),
    insertTemplate: insertTemplate(columns),
    // updateTemplate: updateTemplate(columns)
};
