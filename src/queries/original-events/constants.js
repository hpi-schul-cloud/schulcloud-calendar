const {
    allColumns,
    insertColumns,
    insertTemplate
} = require('../utils/queryStrings');

const columns = [
    'id',
    'event_id',
    'scope_id',
    'original_event',
    'person_responsible'
];

module.exports = {
    allColumns: allColumns(columns),
    insertColumns: insertColumns(columns),
    insertTemplate: insertTemplate(columns)
};
