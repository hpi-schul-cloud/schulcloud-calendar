## Schul-Cloud API Requirements

### Endpoints

#### Map from usertoken to related UUIDs
As the calendar service we need to get all scopes belonging to a user (represented by UUIDs) to find all his appointments.

_Request_: Usertoken
_Response_: Verification and UUIDs of related scopes including a tag for the respective scope and possibly further tags. The scope tag could be of type Integer or String or whatever you want, this only should be documented.

#### Map from names (or something comparable) to scope UUID
As the creator of appointments I need the UUID for a scope in my school (e.g. class 8b of school A) to make the apoointment identifiable later.

_Request_: Designator of school and scope
_Response_: UUID of scope

#### Map from usertoken to related user UUID
(For the notification service.)

_Request_: Usertoken
_Response_: Verification and UUID of related user

#### Map from UUID to related user UUID(s)
(For the notification service in order to notify all users belonging to an event.)

_Request_: UUID
_Response_: If the UUID is a user UUID only the UUID itself, else all user UUIDs belonging to the regarding scope.

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
  <img src="https://github.com/NHoff95/schulcloud-calendar/blob/master/scopes.png" alt="scopes"/>
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
  <img src="https://github.com/NHoff95/schulcloud-calendar/blob/master/appointment-table.png" alt="appointment table"/>
  <b>Figure 2</b> Example appointment table
</p>
