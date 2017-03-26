# Future work

At this point, concepts will be discussed which could not be implemented due to time constraints.

## Cron Jobs

There are two applications where automated jobs are tendering:

- Change of an external calendar feeds
- Check for waiting notifications

The central Schulcloud-Service will be in charge to update external feeds. For this we offer routes that can be used to modify feeds. The Schulcloud-Service can forward feed changes (delete, edit, add) directly to the calendar service.
The general concept will look like the following: The Calendar-Service offers one route for each action that needs to be performed on a subscription (for details look at the API specification). These routes can be called periodically by the central Schulcloud-Service. This handling is advantageous for the architecture, because it is possible to run the Cron-Job in a separate docker container. So multiple instances of the Calender-Service can be started without having the problem of handling the according Cron-Jobs directly. Since the Schulcloud shall be used for whole Germany it is likely that there will be multiple instances of the services. With the help of a load balancer it is possible to handle all instances fairly and synchronously.

There is a Notifications-Services which notifies users about upcoming events as well as other information from the Schulcloud. To enable this in time, the Calendar-Service periodically checks the database for pending notifications. The time interval is set to five minutes. If a notification occurs during this period, it is forwarded accordingly. From our point of view it is not necessary to set the interval smaller (or even sent notifications in real time) since there are no urgent notifications about events.

## Route: Share

Since it shall not only be possible to subscribe to an external feed but also to offer own feeds, there is a set of `share` routes defined. To access such a feed, there is a share-token defined. This token is unique for one feed and allows a concrete access. The details about the single routes can be found in the [specification](https://schulcloud.github.io/schulcloud-calendar/#/default).

## Route: TODO

The iCalendar standard allows the addition of TODOs via a `VTODO` entry. To support this a set of routes is defined in the API. All CRUD operations shall be possible. When adding (`POST`) and changing (` PUT`) a TODO, an ICS file can be provided. The detailed documentation of the routes is defined in the [API specification](https://schulcloud.github.io/schulcloud-calendar/#/default).

## Transactions

To handle errors during processing events, transactions might be introduced. The advantages are on the one hand a consistent database (e. g. events are stored completely and correct or not at all) and on the other hand a better transparency for users or external services. Especially if multiple events have to be stored with one request, without such a technique it is not clear which events have been already stored. This could lead to further problems, e. g. if the request will be repeated and some events might exist multiple times afterwards.

## Further tasks

// Code TODOs (?)
