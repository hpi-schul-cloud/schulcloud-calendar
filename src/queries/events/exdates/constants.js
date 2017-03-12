const {
    allColumns,
    insertColumns,
    insertTemplate
} = require('../../utils/queryStrings');

const columns = ['id', 'event_id', 'date'];

module.exports = {
    allColumns: allColumns(columns),
    insertColumns: insertColumns(columns),
    insertTemplate: insertTemplate(columns)
};
