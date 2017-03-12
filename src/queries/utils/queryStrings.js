// Returns column1, column 2, ...
function allColumns(columns) {
    return columns.join(', ');
}

// Returns (column1, column 2, ...) without id
function insertColumns(columns) {
    return `(${columns.filter((column) => column !== 'id')})`;
}

// Returns ($1, $2, ...)
function insertTemplate(columns) {
    let paramCount = 0;
    return columns.reduce((params, column) => {
        if (column === 'id') return params;
        paramCount += 1;
        return paramCount === 1
            ? params += `$${paramCount}`
            : params += `, $${paramCount}`;
    }, '(') + ')';
}

// Returns column1 = $1, column2 = $2, ...
function updateTemplate(columns) {
    let paramCount = 0;
    return columns.reduce((params, column) => {
        if (column === 'id' || column === 'scope_id') return params;
        paramCount += 1;
        return paramCount === 1
            ? params += `${column} = $${paramCount}`
            : params += `, ${column} = $${paramCount}`;
    }, '');
}

function lastUpdateParam(columns) {
    return columns
        .filter((column) => column !== 'id' && column !== 'scope_id')
        .length + 1;
}

module.exports = {
    allColumns,
    insertColumns,
    insertTemplate,
    updateTemplate,
    lastUpdateParam
};
