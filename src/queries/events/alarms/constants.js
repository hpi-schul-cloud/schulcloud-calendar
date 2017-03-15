const {
    allColumns,
    insertColumns,
    insertTemplate
} = require('../../utils/queryStrings');

const columns = [
    'id',
    'event_id',
    'trigger',
    'repeat',
    'duration',
    'action',
    'attach',
    'description',
    'attendee',
    'summary'
];

module.exports = {
    columns,
    allColumns: allColumns(columns),
    insertColumns: insertColumns(columns),
    insertTemplate: insertTemplate(columns)
};
