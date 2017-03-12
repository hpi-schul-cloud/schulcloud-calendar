function paramsTemplate(columnNames, withId = false) {
    columnNames = columnNames.split(', ');
    let template = columnNames.reduce((allParams, column, index) => {
        return index === 0
            ? allParams += `$${index + 1}`
            : allParams += `, $${index + 1}`;
    }, '(');
    return withId
        ? template += `, $${columnNames.length + 1})`
        : template += ')';
}

module.exports = paramsTemplate;
