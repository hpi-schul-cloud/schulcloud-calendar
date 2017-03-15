const {
    allColumns,
    insertColumns,
    insertTemplate,
    updateColumns,
    updateTemplate
} = require('../utils/queryStrings');

const columns = ['id', 'ics_url', 'description', 'scope_id', 'subscription_id'];

module.exports = {
    allColumns: allColumns(columns),
    insertColumns: insertColumns(columns),
    insertTemplate: insertTemplate(columns),
    updateColumns: updateColumns(columns),
    updateTemplate: updateTemplate(columns)
};
