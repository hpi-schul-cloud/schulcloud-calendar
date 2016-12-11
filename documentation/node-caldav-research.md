# CalDAV server libraries in node - research results

## [Fennel](https://github.com/LordEidi/fennel)

Fennel is a pure CalDAV and CardDAV server without support for WebDAV. Even though it is described as fully working and ready for a public release, we had some trouble getting it to work. Take care of the following if you wish to test it by yourself (using the source code on GitHub):

- Change the server address in `config.js` from `127.0.0.1` to `0.0.0.0` to allow any access
- Use advanced settings in your calendar app to connect (tested on macOS):
  - Username: `fennel` or `demo`
  - Password: `fennel` or `demo`
  - Server address: `localhost`
  - Server path: `/p/<username>` (and replace `<username>` with `fennel` or `demo`)
  - Port: `8888` (or any other value set in `config.js`)
  - Use SSL: `false`
  - Use Kerberos v5: `false`

We could connect to Fennel with this configuration. Unfortunately, we couldn't add own calendars without manipulation the database directly. Use the test cases to create a new calendar: `node test/cal/mkcalendar.js` (this will create an empty calendar for user `demo`. Change it in the SQLite database if required, table `CALs`). With this change, we could successfully add new events with our calendar app but unable to get a list of events on another device or after removing and setting up the CalDAV connection again. Events are stored in the table `ICs` and there might be a problem with the start and end date (in our test, it was many, many years ago in 1999, even though we created events in the current week). 

Nevertheless, Fennel seems to be the best starting point to add CalDAV support in a node application at the time of writing. In addition, the development is still ongoing and chances are high to get in contact with the developers. In addition, the console output might be very helpful to debug problems.
 
## [jsDAV](https://github.com/mikedeboer/jsDAV)

jsDAV is the second node module we tested for a server-side CalDAV implementation. The project itself aims to create a WebDAV server and the CalDAV part is an extension to it (as well as their CardDAV implementation). We had major problems to set up the system and to get as far as we did with testing Fennel. To test the software, ensure:

- to have a running Redis server
- to copy `lib/CardDAV/property/supportedAddressData.js` to `lib/CalDAV/property/supportedAddressData.js`
- to execute `node example/calendarserver.js`
- Use advanced settings in your calendar app to connect (tested on macOS):
  - Username: `admin`
  - Password: `admin`
  - Server address: `localhost`
  - Server path: `/calendars/<username>` (and replace `<username>` with `admin`)
  - Port: `8000` (or any other value set in `example/calendarserver.js`)
  - Use SSL: `false`
  - Use Kerberos v5: `false`
  
If you want to debug jsDAV, consider to connect via WebDAV to the server and explore the paths there. With the setup described above, you might create a new calendar now in your calendar app (even though we weren't successful in doing so). Unfortunately, the source code for CalDAV is very mixed with terms only applicable to CardDAV so that it's hard to understand and debug. In addition, the development doesn't seem to be active any longer and we do not recommend to use jsDAV as a starting point for an own CalDAV server implementation.

# Syncing with Microsoft Exchange using ActiveSync

Many servers support calendar access using the CalDAV standard, the most prominent server software which doesn't support CalDAV is Microsoft Exchange. Therefore, Microsoft implements an own protocol replacing IMAP, CardDAV and CalDAV. Technically, a calendar might be published through OWA or Outlook to get a public iCalendar feed, but this might be disabled by some administrators.

## [asclient](https://github.com/clncln1/node-asclient)

The asclient is a node client to sync emails, contacts and calendar items with an ActiveSync enabled endpoint (usually a Microsoft Exchange Server). It is easy to setup and to make a proof-of-concept. During our tests, we used the example available at the projects ReadMe file. Just two side notes to get the system running:

- Ensure to use your OWAs URL, e.g. `https://owa.<domain>.<tld>/Microsoft-Server-ActiveSync`
- Your username might be specified in the format `<username>@<domain>`
- Change the device ID and model if you encounter problems during sign in, e.g. model = `iPhone`, id = `<1 char><25 alpha numeric chars>`
- If you wish to sync calendar items, change `myMailClient.enableEmailSync` to `myMailClient.enableCalendarSync`.

In our test, asclient worked very well and the output was properly formatted including all relevant details (event name, location, attendees, ...). asclient supports authentication via NTLMv2, NTLM and HTTP basic auth, which requires to have a password (see next chapter for more details).

## Authentication

There are three authentication methods when connecting to Active Sync:
- using a HTTP basic auth
- using certificates or
- a token-based authentication which is two factor login method requiring a password _and_ a short life token.
 
The first and third method requires the user to enter a password to configure the ActiveSync client. In our use case scenario, our calendar service would be the client so that a user must enter his organization credentials on a third-party website (which is not optimal). The second method using a certificate might be more secure and advanced but is more difficult to set up. 

Unfortunately, the asclient mentioned above doesn't support authentication via certificates.

Find more details at the [Microsoft Documentation about "Configuring Authentication for Exchange ActiveSync"](https://technet.microsoft.com/en-us/library/bb430770(v=exchg.141).aspx).
