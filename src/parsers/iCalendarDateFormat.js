function iCalendarDateFormat(date) {
    return date.toISOString().replace(/([:-]|(\..{3}))/g, '') + '\n';
}

module.exports = iCalendarDateFormat;