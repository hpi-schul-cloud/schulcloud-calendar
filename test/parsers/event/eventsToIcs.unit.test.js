const { expect } = require("chai");
const rewire = require("rewire");
const eventToIcsImport = rewire("../../../src/parsers/event/eventsToIcs");

describe('eventsToIcs', () => {
    describe('iCalendarDateFormat', () => {
        let iCalendarDateFormat = null;
        before(() => {
            iCalendarDateFormat = eventToIcsImport.__get__("iCalendarDateFormat");
        });

        it('should format date', () => {
            const formattedDate = iCalendarDateFormat(new Date(2020, 5, 18, 13, 30, 55, 123));
            expect(formattedDate).to.be.equal("20200618T113055Z");
        });
    });

    describe('eventToIcs', () => {
        let eventToIcs = null;
        before(() => {
            eventToIcs = eventToIcsImport.__get__("eventToIcs");
        });
        it('should parse minimal example', () => {
            const event = {
                event_id: '123456789',
                dtstart: new Date(2020, 5, 18, 13, 30, 55, 123),
                dtend: new Date(2020, 5, 18, 14, 0, 55, 123),
                dtstamp: new Date(2020, 5, 18, 14, 1, 55, 123),
            };
            const expected = `BEGIN:VEVENT\nUID:123456789@schul-cloud.org
SUMMARY:undefined
DTSTART:20200618T113055Z
DTEND:20200618T120055Z
DTSTAMP:20200618T120155Z
END:VEVENT\n`;

            expect(eventToIcs(event)).to.be.equal(expected);
        });

        it('should parse example with more data', () => {
            const event = {
                event_id: '123456789',
                dtstart: new Date(2020, 5, 18, 13, 30, 55, 123),
                dtend: new Date(2020, 5, 18, 14, 0, 55, 123),
                dtstamp: new Date(2020, 5, 18, 14, 1, 55, 123),
                location: 'somewhere',
                summary: 'Short story of everything',
                description: 'Longer story of everything',
                'last-modified': new Date(2020, 5, 18, 14, 1, 55, 123),
            };
            const expected = `BEGIN:VEVENT
UID:123456789@schul-cloud.org
LOCATION:somewhere
SUMMARY:Short story of everything
DESCRIPTION:Longer story of everything
DTSTART:20200618T113055Z
DTEND:20200618T120055Z
DTSTAMP:20200618T120155Z
LAST-MODIFIED:20200618T120155Z
END:VEVENT\n`;

            expect(eventToIcs(event)).to.be.equal(expected);
        });

        it('should parse minimal repeat example', () => {
            const event = {
                event_id: '123456789',
                dtstart: new Date(2020, 5, 18, 13, 30, 55, 123),
                dtend: new Date(2020, 5, 18, 14, 0, 55, 123),
                dtstamp: new Date(2020, 5, 18, 14, 1, 55, 123),
                repeat_freq: 5,
            };
            const expected = `BEGIN:VEVENT\nUID:123456789@schul-cloud.org
SUMMARY:undefined
RRULE:FREQ=5
DTSTART:20200618T113055Z
DTEND:20200618T120055Z
DTSTAMP:20200618T120155Z
END:VEVENT\n`;

            expect(eventToIcs(event)).to.be.equal(expected);
        });

        it('should parse bigger repeat example', () => {
            const event = {
                event_id: '123456789',
                dtstart: new Date(2020, 5, 18, 13, 30, 55, 123),
                dtend: new Date(2020, 5, 18, 14, 0, 55, 123),
                dtstamp: new Date(2020, 5, 18, 14, 1, 55, 123),
                repeat_freq: 5,
                repeat_until: new Date(2025, 5, 18, 14, 1, 55, 123),
                repeat_count: 1234,
                repeat_interval: 500,
                repeat_bysecond: [0.5],
                repeat_byminute: [1],
                repeat_byhour: [2],
                repeat_byday: ['MONDAY'],
                repeat_bymonthday: [4],
                repeat_byyearday: [5],
                repeat_byweekno: [6],
                repeat_bysetpos: [7],
                repeat_wkst: 'TU'
            };
            const expected = `BEGIN:VEVENT\nUID:123456789@schul-cloud.org
SUMMARY:undefined
RRULE:FREQ=5;UNTIL=20250618T120155Z;COUNT=1234;INTERVAL=500;BYSECOND=0.5;BYMINUTE=1;BYHOUR=2;BYDAY=MONDAY;BYMONTHDAY=4;BYYEARDAY=5;BYWEEKNO=6;BYSETPOS=7;WKST=TU
DTSTART:20200618T113055Z
DTEND:20200618T120055Z
DTSTAMP:20200618T120155Z
END:VEVENT\n`;

            expect(eventToIcs(event)).to.be.equal(expected);
        });

        it('should parse example with exdates', () => {
            const event = {
                event_id: '123456789',
                dtstart: new Date(2020, 5, 18, 13, 30, 55, 123),
                dtend: new Date(2020, 5, 18, 14, 0, 55, 123),
                dtstamp: new Date(2020, 5, 18, 14, 1, 55, 123),
                exdates: [{ date: new Date(2021, 5, 18, 13, 30, 55, 123) }, { date: new Date(2022, 5, 18, 13, 30, 55, 123) }]
            };
            const expected = `BEGIN:VEVENT\nUID:123456789@schul-cloud.org
SUMMARY:undefined
DTSTART:20200618T113055Z
DTEND:20200618T120055Z
DTSTAMP:20200618T120155Z
EXDATE:20210618T113055Z
EXDATE:20220618T113055Z
END:VEVENT\n`;

            expect(eventToIcs(event)).to.be.equal(expected);
        });

        it('should parse example with alarms', () => {
            const event = {
                event_id: '123456789',
                dtstart: new Date(2020, 5, 18, 13, 30, 55, 123),
                dtend: new Date(2020, 5, 18, 14, 0, 55, 123),
                dtstamp: new Date(2020, 5, 18, 14, 1, 55, 123),
                alarms: [
                    {
                        trigger: ';asdf',
                        repeat: 'MINUTELY',
                    },
                    {
                        trigger: 'qwer',
                        repeat: 'MINUTELY',
                        duration: 5,
                        action: 'DISPLAY',
                        attach: 'Some Attachment',
                        description: 'This is a detailed description of this action',
                        attendee: 'klara.fall@schul-cloud.org',
                        summary: 'Short summary'
                    }
                ]
            };
            const expected = `BEGIN:VEVENT\nUID:123456789@schul-cloud.org
SUMMARY:undefined
DTSTART:20200618T113055Z
DTEND:20200618T120055Z
DTSTAMP:20200618T120155Z
BEGIN:VALARM
TRIGGER;asdf
ACTION:undefined
END:VALARM
BEGIN:VALARM
TRIGGER:qwer
REPEAT:MINUTELY
DURATION:5
ACTION:DISPLAY
ATTACH:Some Attachment
DESCRIPTION:This is a detailed description of this action
ATTENDEE:klara.fall@schul-cloud.org
SUMMARY:Short summary
END:VALARM
END:VEVENT\n`;

            expect(eventToIcs(event)).to.be.equal(expected);
        });

        it('should parse minimal example', () => {
            const xFields = { dtstart: '20200618T113055Z', dtend: 'something:else' };
            const event = {
                event_id: '123456789',
                dtstart: new Date(2020, 5, 18, 13, 30, 55, 123),
                dtend: new Date(2020, 5, 18, 14, 0, 55, 123),
                dtstamp: new Date(2020, 5, 18, 14, 1, 55, 123),
                x_fields: xFields
            };
            const expected = `BEGIN:VEVENT\nUID:123456789@schul-cloud.org
SUMMARY:undefined
DTSTART:20200618T113055Z
DTEND:20200618T120055Z
DTSTAMP:20200618T120155Z
DTSTART:20200618T113055Z
DTEND;something:else
END:VEVENT\n`;

            expect(eventToIcs(event)).to.be.equal(expected);
        });
    });
});
