# Future work

At this point, concepts will be discussed which could not be implemented due to time constraints.

## Cron Jobs

There are two applications where automated jobs are tendering:

- Update of an external calendar feeds
- Check for waiting notifications

The central Schul-Cloud-Service will be in charge to update external feeds. For this we offer routes that can be used to modify feeds. The Schul-Cloud-Service can forward feed changes (delete, edit, add) directly to the calendar service.

The general concept will look like the following: The Calendar-Service offers one route for updates that need to be performed on a subscription. This route can be called periodically by the central Schul-Cloud-Service. This handling is advantageous for the architecture, because it is possible to run the Cron-Job in a separate docker container. So multiple instances of the Calender-Service can be started without having the problem of handling the according Cron-Jobs directly. Since the Schul-Cloud shall be used for whole Germany it is likely that there will be multiple instances of the services. With the help of a load balancer it is possible to handle all instances fairly and synchronously.

Events of external feeds will be saved within the Calendar-Service. Therefore the external calendar needs to be retrieved. The belogning events can then be parsed and inserted with the existing functions.

There is a Notifications-Service which notifies users about upcoming events as well as other information from the Schul-Cloud. To enable this in time, the Schul-Cloud-Service periodically checks the database for pending notifications. The time interval is thereby flexible and can for example be set by a URL parameter. If a notification occurs during the given period, it is forwarded accordingly.

## Route: Share

Since it shall not only be possible to subscribe to an external feed but also to offer own feeds, there is a set of `share` routes defined. To access such a feed, there is a share-token defined. This token is unique for one feed and allows a concrete access. The details about the single routes can be found in the [specification](https://schulcloud.github.io/schulcloud-calendar/#/default).

## Route: TODO

The iCalendar standard allows the addition of TODOs via a `VTODO` entry. To support this a set of routes is defined in the API. All CRUD operations shall be possible. When adding (`POST`) and changing (` PUT`) a TODO, an ICS file can be provided. The detailed documentation of the routes is defined in the [API specification](https://schulcloud.github.io/schulcloud-calendar/#/default).

## Transactions

To handle errors during processing events, transactions might be introduced. The advantages are on the one hand a consistent database (e. g. events are stored completely and correct or not at all) and on the other hand a better transparency for users or external services. Especially if multiple events have to be stored with one request, without such a technique it is not clear which events have been already stored. This could lead to further problems, e. g. if the request will be repeated and some events might exist multiple times afterwards.

## Original Scope IDs

While creating a new event, the scope ids for the event can be separated. If this option has been chosen, we store the 'original' ids anyway. With this option, some additional features are conceivable. The most important feature from our point of view is the automated modification of events for new users belonging to the original, separated scope. In those cases, the original scope id can be separated again and such changes can be performed.

// ## Further tasks

// Code TODOs (?)
