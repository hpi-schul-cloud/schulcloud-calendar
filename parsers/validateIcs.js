function validateIcs(lines) {
    if (lines[0] != "BEGIN:VCALENDAR") {
        console.error("The begin of the given ics file does not match the expectation!");
        return false;
    }

    if (lines[lines.length-1] != "END:VCALENDAR") {
        console.error("The end of the given ics file does not match the expectation!");
        return false;
    }

    if (lines[1].indexOf("VERSION") != -1) {
        var versionSplit = lines[1].split(":");

        if (versionSplit.length != 2 || acceptecICalVersions.indexOf(versionSplit[1]) == -1) {
            console.error("The iCalendar version does not match any approved version!");
            return false;
        }

    } else {
        console.error("Invalid version format in ics file!");
        return false;
    }

    if (lines[2].indexOf("PRODID") == -1) {
        console.error("Missing PRODID in ics!");
        return false;
    }

    // TODO: check if ICS contains at least one event

    return true;
}

module.exports = validateIcs;
