function iCalendarDateFormat(date) {
    return date.toISOString().replace(/([:-]|(\..{3}))/g, '');
}

module.exports = iCalendarDateFormat;