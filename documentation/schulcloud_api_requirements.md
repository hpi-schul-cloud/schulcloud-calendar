## Schul-Cloud API Requirements

### Endpoints

#### Map from usertoken to related UUIDs
As the calendar service we need to get all scopes belonging to a user (represented by UUIDs) to find all his appointments. In order to work for the notification service, a service token should be accepted as well and return the related service with its authorities.

_Request_: Usertoken / Servicetoken

_Response_: UUIDs with tags (after basic verification). The format of the JSON API conform respone could be as follows.

_Example_: https://schulcloud-api-mock.herokuapp.com/api/all_scopes/:token

`token ∈ {student[1|2]\_[1|2], teacher[1|2]\_[1|2], service[1|2]}`


```
{
  "links": {
    "self": "https://schulcloud-api-mock.herokuapp.com/api/all_scopes/teacher1_1",
    "first": "",
    "last": "",
    "next": "",
    "prev": ""
  },
  "data": [
    {
      "type": "user",
      "id": "373fd11a-4c42-48ac-b245-0aa922bc1cc9",
      "attributes": {
        "name": "Lehrerin 1.1",
        "authorities": [
          "can-read",
          "can-write",
          "can-send-notifications"
        ]
      }
    },
    {
      "type": "scope",
      "id": "d46b16ce-6d98-44b7-bcbc-a36c50098144",
      "attributes": {
        "name": "Kurs Deutsch 1a",
        "authorities": [
          "can-read",
          "can-write",
          "can-send-notifications"
        ]
      }
    },
    {
      "type": "scope",
      "id": "316866a2-41c3-444b-b82c-274697c546a0",
      "attributes": {
        "name": "Kurs Mathe 1a",
        "authorities": [
          "can-write",
          "can-send-notifications"
        ]
      }
    },
    {
      "type": "scope",
      "id": "8b0753ab-6fa8-4f42-80bd-700fe8f7d66d",
      "attributes": {
        "name": "Klasse 1a",
        "authorities": [
          "can-read"
        ]
      }
    },
    {
      "type": "scope",
      "id": "145f4a21-1d55-438f-8a6b-599558f1aa47",
      "attributes": {
        "name": "Stufe 1",
        "authorities": [
          "can-read"
        ]
      }
    },
    {
      "type": "scope",
      "id": "e22753f6-4cb5-4009-a9e0-dbcc3ac0993b",
      "attributes": {
        "name": "Schule 1",
        "authorities": [
          "can-read"
        ]
      }
    },
    {
      "type": "scope",
      "id": "663ad332-3cd6-4e75-90bd-a2dfd9132f84",
      "attributes": {
        "name": "Bundesland 1",
        "authorities": [
          "can-read"
        ]
      }
    }
  ]
}
```

Response with Service token:

```
{
  "links": {
    "self": "https://schulcloud-api-mock.herokuapp.com/api/all_scopes/service1",
    "first": "",
    "last": "",
    "next": "",
    "prev": ""
  },
  "data": [
    {
      "type": "service",
      "id": "139e903c-a786-44f9-97ff-2850d3a91a16",
      "attributes": {
        "name": "Service 1",
        "authorities": [
          "can-send-notifications"
        ]
      }
    }
  ]
}
```

#### Map from usertoken to related user UUID
(For the notification service.)

_Request_: Usertoken

_Response_: Verification and UUID of related user

_Example_: https://schulcloud-api-mock.herokuapp.com/api/user/:token

`token ∈ {student[1|2]\_[1|2], teacher[1|2]\_[1|2]}`

```
{
  "links": {
    "self": "https://schulcloud-api-mock.herokuapp.com/api/user/student1_1",
    "first": "",
    "last": "",
    "next": "",
    "prev": ""
  },
  "data": [
    {
      "type": "user",
      "id": "874a9be4-ea6a-4364-852d-1a46b0d155f3",
      "attributes": {
        "name": "Schüler 1.1",
        "authorities": [
          "can-read",
          "can-write"
        ]
      }
    }
  ]
}
```

#### Map from UUID to related user UUID(s)
As the calendar service we need to get all users belonging to a UUID in order to bulk create events (e.g. when accessed through our REST API by a submission system) individually for each user. In addition, the notification service requires this endpoint to notify all users belonging to an event.

_Request_: UUID

_Response_: If the UUID is a user UUID only the UUID itself, else all user UUIDs belonging to the regarding scope.

_Example_: https://schulcloud-api-mock.herokuapp.com/api/all_users/:uuid

`uuid ∈ {id value form one of the queries above}`

```
{
  "links": {
    "self": "https://schulcloud-api-mock.herokuapp.com/api/all_users/663ad332-3cd6-4e75-90bd-a2dfd9132f84",
    "first": "",
    "last": "",
    "next": "",
    "prev": ""
  },
  "data": [
    {
      "type": "user",
      "id": "874a9be4-ea6a-4364-852d-1a46b0d155f3",
      "attributes": {
        "name": "Schüler 1.1",
        "authorities": [
          "can-read"
        ]
      }
    },
    {
      "type": "user",
      "id": "c6334438-f75b-46b3-8d0a-7f2588596e2e",
      "attributes": {
        "name": "Schülerin 1.2",
        "authorities": [
          "can-read"
        ]
      }
    },
    {
      "type": "user",
      "id": "373fd11a-4c42-48ac-b245-0aa922bc1cc9",
      "attributes": {
        "name": "Lehrerin 1.1",
        "authorities": [
          "can-read"
        ]
      }
    },
    {
      "type": "user",
      "id": "bd2df8b5-6253-4340-b6c2-dd0d6e13da37",
      "attributes": {
        "name": "Lehrer 1.2",
        "authorities": [
          "can-read"
        ]
      }
    }
  ]
}
```

### UUIDs
UUIDs should be globally unique for each instance in the whole Schul-Cloud. An instance is for example a school, a class or a user (see [Scopes](#Scopes)).

### Scopes
Scopes are defined for
* federal states
* schools
* grades
* classes
* courses
* users

<p align="center">
  <img src="https://github.com/schulcloud/schulcloud-calendar/blob/master/documentation/scopes.png" alt="scopes"/>
  <b>Figure 1</b> Possible scopes in the Schul-Cloud with their relations
</p>

The relations between the elements allow to conclude from a user to the according grade without having to store it separately.

Courses take a special role since they are user specific and belong thus to the smallest possible scope. An example could be an advanced course, an elective subject or a project group.

### Permissions
It should be possible to distinguish between different user groups, for example students and parents. The API should only return UUIDs from elements the user has the permission to see.

### Use Cases

#### Usertoken to related UUIDs
Imagine, Paul logs into his Schul-Cloud account and requests his calendar. Our service sends his usertoken to the API described above. In the response all UUIDs which belong to Paul's scopes are included: UUIDs for his federal state, his school, his grade, his class, his courses, and the UUID belonging to his user account.

With these our service can look up the regarding entries in the appointment database. The associated table consists of events which are stored in the iCalendar format with an UUID of the corresponding scope (see figure 2). Thus we can get all appointments which belong to Paul's school, grade, and so on. In the end, we can provide Paul an iCalendar download.

<p align="center">
  <img src="https://github.com/schulcloud/schulcloud-calendar/blob/master/documentation/appointment-table.png" alt="appointment table"/>
  <b>Figure 2</b> Example appointment table
</p>
