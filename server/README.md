# Sonoff MQTT Manager - The Backend App
<i>( English | <a href="./LEGGIMI.md">Italiano</a> )</i>
<br/><br/>

The backend side of the project is hosted as an `Express.js` API server, connected to `MongoDB` via the Mongoose package to store data, and to the Mosquitto `MQTT broker` using the MQTT.js package.

---

## Project structure

The project is loaded via the main file, `app.js`, which opens the Express.js server with its plugin to listen on port 3000 and loads the other services.

Said services live in the root folder as separate JavaScript files:
- `logger.js`: exposes a simple logging/debugging function, which takes a **service** and a **message** argument to output to Node's console logs in the form of:
    ```
    [MQTT] Connected to the Broker.
    ```

- `broker.js`: imports the **MQTT.js** package and exposes a `Broker` pseudoclass, with basic functionalities such as subscribing, publishing, and checking the connection.

    On import, this file also attempts to: connect to the Broker; retrieve all currently existing Sonoffs; subscribe to the corresponding topics.

    This Broker supposes a constant `QoS=2` and a username+password authentication.

- `db.js`: a simple service for connecting to the MongoDB database, checking the connection, and returning a `db` object to perform queries on.

- `config.js`: a simple service that provides a global environment using `dotenv` to retrieve each field from the `.env` file.

The other folders provide **Routes** and **Middlewares** in the sense of Express, **Models** in the sense of Mongoose, and **Controllers** to link everything together.

---

## Models

Three Mongoose models were created, each with - in addition to their personal fields - creation and update timestamps.

- ### User
    ```
    nickname: String,
    username: String, index,
    password: String,
    sonoffs: [{
        _id: ObjectId, ref: 'Sonoff',
        topic: String,
        name: String
    }]
    ```

- ### Sonoff
    ```
    owners: [{ 
        _id: ObjectId, ref: 'User',
        deviceName: String
    }],
    topic: String, index,
    history: [{
        _id: ObjectId, ref: 'Observation',
        value: Boolean,
        timestamp: Date, default: Date.now
    }]
    ```

- ### Observation
    ```
    sonoff: String,
    value: Boolean
    ```

---

## Routes

Each of this route has a controller method given as callback, for using Mongoose schemas accordingly and perform operations on the MQTT Broker.

- ### Health check

`GET: /` --> obtains a simple Health check message

- ### Sonoffs management

`POST: /sonoff/create` --> creates a Sonoff or add user to existing one, given a `topic` and a custom `name`

`POST: /sonoff/delete` --> remove a user from or delete a Sonoff, given its `topic`

`GET: /sonoff/collection` --> returns a collection of the user-owned Sonoffs

`GET: /sonoff/:id/observations` --> returns all the Observations for the Sonoff with `topic = id`

`POST: /sonoff/:id/toggle, /sonoff/:id/on, /sonoff/:id/off` --> modify the ON/OFF state of the Sonoff with `topic = id`

- ### User authentication

`POST: /user/register` --> creates a new user, given `nickname` to show publicly and a `username` and `password` pair

`POST: /user/login` --> logs in the user with the given `username` and `password`, and also returns a server-generated JWT

---

## Middleware

There is only one `auth.js` middleware, which has the function of validating the JWT token in the requests' header, find if it's past its expire date, and find a valid user connected to it.

It blocks the callback associated to a route, terminating it prematurely with a `401: Unauthorized` response.