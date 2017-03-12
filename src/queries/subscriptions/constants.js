const {
    allColumns,
    insertColumns,
    insertTemplate,
    updateTemplate,
    lastUpdateParam
} = require('../utils/queryStrings');

const columns = ['id', 'ics_url', 'description', 'scope_id'];

module.exports = {
    allColumns: allColumns(columns),
    insertColumns: insertColumns(columns),
    insertTemplate: insertTemplate(columns),
    updateTemplate: updateTemplate(columns),
    lastUpdateParam: lastUpdateParam(columns)
};
