/**
 * @author Niklas Hoffmann
 */

var acceptecICalVersions = [
    "2.0"
];

module.exports = {
    icsToJson: function (ics) {

        var lines = ics.split("\n");
        if (validateIcs(lines)) {
            var result = [];
            var json = {};
            var eventProcessingStartet = false;
            for (var i = 0; i < lines.length; i++) {
                switch (lines[i]) {
                    case "BEGIN:VEVENT":
                        eventProcessingStartet = true;
                        break;
                    case "END:VCALENDAR":
                        eventProcessingStartet = false;
                        if (validateJson(json)) {
                            result.add(json);
                        } else {
                            console.error("Created invalid JSON, are all required fields present?")
                        }
                        json = {};
                        break;
                    default:
                        //TODO: refactor splitting at first ':'
                        var splittedLine = lines[i].split(":");
                        if (splittedLine.length > 2) {
                            var key = splittedLine[0];
                            var value = "";
                            for (var i = 1; i < splittedLine.length; i++) {
                                value += splittedLine[i];
                            }
                            switch (key) {
                                case "UID":
                                    var splittedUid = value.split("@");
                                    if (splittedUid.length == 2) {
                                        json["id"] = splittedUid[0];
                                    } else {
                                        console.error("Received invalid UID.")
                                    }
                                    break;
                                case "LOCATION":
                                    json["location"] = value;
                                    break;
                                case "SUMMARY":
                                    json["summary"] = value;
                                    break;
                                case "DESCRIPTION":
                                    json["description"] = value;
                                    break;
                                case "DTSTART":
                                    break;
                                case "DTEND":
                                    break;
                                case "DTSTAMP":
                                    break;
                                case "LAST-MODIFIED":
                                    break;
                                default:
                                    console.error("Got unknown ICS field Implement \'" + key + "\'!");
                                    break;
                            }
                        } else {
                            console.error("Invalid line");
                        }

                }

            }
        } else {
            console.error("Got an invalid ICS file!");
        }
        return result;
    },
    jsonToIcs: function (jsonArray) {
        var ics = "";

        return ics;
    }
};

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

    //TODO: check if ICS contains at least one event

    return true;
}

function validateJson(json) {
    //TODO
    return true;
}
