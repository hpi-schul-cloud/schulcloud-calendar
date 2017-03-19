# Future work

At this point, concepts will be discussed which could not be implemented due to time constraints.

## Cron Jobs

There are two applications where automated jobs are tendering:

- Update of external calendar feeds
- Check for waiting notifications

The central Schulcloud-Service will be in charge to update external feeds. For this we offer routes that can be used to modify feeds. The Schulcloud-Service can forward feed changes (delete, edit, add) directly to the calendar service.

To send notifications to the Notification-Service in time, the Calendar-Service periodically checks the database for pending notifications. The time interval is set to five minutes. If a notification occurs during this period, it is forwarded accordingly.

## Route: Share

Since it shall not only be possible to subscribe to an external feed but also to offer own feeds, there is a set of `share` routes defined. To access such a feed, there is a share-token defined. This token is unique for one feed and allows a concrete access. The detailes about the single routes can be found in the [Specification](https://schulcloud.github.io/schulcloud-calendar/#/default).

## Route: TODO

The iCalendar standard allows the addition of TODOs via a `VTODO` entry. To support this a set of routes is defined in the API. All CRUD operations shall be possible. When adding (`POST`) and changing (` PUT`) a TODO, an ICS file can be provided. The detailed documentation of the routes is defined in the [API specification](https://schulcloud.github.io/schulcloud-calendar/#/default).

## Transactions

To handle errors during processing events, transactions might be introduced. The advantages are on the one hand a consistent database (e. g. events are stored completely and correct or not at all) and on the other hand a better transparency for users or external services. Especially if multiple events have to be stored with one request, without such a technique it is not clear which events have been already stored. This could lead to further problems, e. g. if the request will be repeated and some events might exist multiple times afterwards.

## Further tasks

// Code TODOs (?)
