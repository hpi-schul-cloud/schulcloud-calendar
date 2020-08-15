const getDate = (minOffset) => new Date(new Date().getTime() + (minOffset * 1000 * 60)).toISOString();

module.exports = getDate;