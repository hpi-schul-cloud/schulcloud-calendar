const logger = require('../../infrastructure/logger');

const acceptedICalVersions = [
    '2.0'
];

function validateIcs(lines) {
    if (lines[0] != 'BEGIN:VCALENDAR') {
        logger.error('[validateIcs] The begin of the given ics file does not match the expectation!');
        return false;
    }

    // in case the last line is empty
    const lastLine = lines[lines.length - 1] === ''
        ? lines[lines.length - 2]
        : lines[lines.length - 1];

    if (lastLine !== 'END:VCALENDAR') {
        logger.error('[validateIcs] The end of the given ics file does not match the expectation!');
        return false;
    }

    if (lines[1].indexOf('VERSION') !== -1) {
        let versionSplit = lines[1].split(':');

        if (versionSplit.length !== 2 || acceptedICalVersions.indexOf(versionSplit[1]) === -1) {
            logger.error('[validateIcs] The iCalendar version does not match any approved version!');
            return false;
        }

    } else {
        logger.error('[validateIcs] Invalid version format in ics file!');
        return false;
    }

    if (lines[2].indexOf('PRODID') === -1) {
        logger.error('[validateIcs] Missing PRODID in ics!');
        return false;
    }

    return true;
}

module.exports = validateIcs;
