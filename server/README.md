# Sonoff MQTT Manager
<i>( English | <a href="./LEGGIMI.md">Italiano</a> )</i>
<br/><br/>

This project is the result of a final assignment for the 2020/21 class of **Internet of Things Based Smart Systems** at **Unict - University of Catania**.

The main objective of this assignment is that of demonstrating the student's comprehension of a specific course topic, namely the MQTT protocol.

---

## Summary

This app provides a full-stack environment for the management of **Sonoff Wi-Fi Switches**, assuming they've already been configured using the **Tasmota** firmware and setup to connect with the MQTT broker on the local network.

The **backend** provides an authentication JWT-based system for users, which can add or remove a Sonoff to their collection simply knowing their respective Tasmota IDs.

There are API routes for toggling on & off a Sonoff, adding or deleting them from a user's list, and getting the whole list of owned Sonoffs.

Each time a Sonoff is toggled, the backend listens to its MQTT topic and creates a new Observation in the database, in order to properly update the state of the frontend view.

The **frontend** has forms for registering a new user and signing in at first launch, with sessions during (by default) maximum 1 hour and then asking again for a sign-in.

Once a user is logged in, they can navigate through tabs of their owned Sonoffs, or add a new one.

For each selected Sonoff, the user can toggle it via a ON/OFF button, delete it from their collection, and choose a timespan of observations to consider (last 1 hour, last 24 hour, last 7 days).

For a given timespan, a **Chart.js** graph is rendered of each ON/OFF event, and the whole period of "ON state" is computed, allowing the user to compute the esteemed energy consumption once an average power consumption is provided.

---

## Reproducing my environment and starting the project

This repo has been tested with a local installation of the **Eclipse Mosquitto** MQTT broker, and a local installation of **MongoDB**, both on the same machine that has the two Node.js apps running.

Once both apps have been installed, the following steps were also taken in order to get everything in working order.

1. ### Configuring a **password list**, an **access list**, and other parameters for Mosquitto.

    Namely, a `node_server` user with `password` as its password, for authenticating the backend app, and a `tasmota` user for authenticating the Sonoffs.

    The default `mosquitto_passwd` was used to generate the password list file.
    ```
    # To create the file
    mosquitto_passwd -c <password file> <username>

    # To add users to the file
    mosquitto_passwd <password file> <username>

    # Both instructions ask via prompt for the password to be associated with <username>
    ```

    The access list may be needed in order to ensure that the `node_server` is correctly subscribed to topics and correctly publishing to others.

    A simple configuration to let everyone access any topic in read & write (unsafe!) would be:
    ```
    topic readwrite $SYS/#

    pattern readwrite $SYS/#
    ```

    Finally, a `.conf` file is needed to communicate this changes to Mosquitto, either by modifying its default config file or by specifying a new file when executing it:
    ```
    mosquitto -c ./mosquitto.conf
    ```

    The parameters changed in my environment include:

    ### Defining the password file
    ```
    password_file ./password_file
    ```

    ### Allowing anonymous access (unsafe, optional)
    ```
    allow_anonymous true
    ```

    ### Defining the access list
    ```
    acl_file ./acl_file.acl
    ```

    ### Allowing access on the local network and setting port
    ```
    listener 1883 0.0.0.0
    ```

2. ### Configuring Tasmota to use MQTT correctly.

    Each Sonoff must be configured on the web-app panel accessible using the device's local IP, and the following must be ensured:
    ```
    Host: <the local IP of the computer running Mosquitto>
    Port: 1883
    Client: any
    User: <a valid user in the Mosquitto password file>
    Password: <password>
    Topic: tasmota_%06X
    Full Topic: %prefix%/%topic%/
    ```

    In particular:
    - the `topic` and `full topic` fields must be exactly that, because the backend expects that formatting when adding new Sonoffs
    - the IP can be the router's local IP if the 1883 port is forwarded correctly
    ```
    192.168.1.1:1883 <-----> 192.168.1.x:1883
    ```

3. ### Creating a MongoDB database for the backend

4. ### Configuring the app's `.env`, for example:

    ```
    # MQTT
    HOST=localhost
    PORT=1883
    CLIENT_ID=node_server
    USERNAME=node_server
    PASSWORD=password

    # MONGODB
    DB_HOST=127.0.0.1
    DB_NAME=SonoffDB

    # EXPRESS
    SERVER_HOST=localhost
    SERVER_PORT=3000
    JWT_SECRET=secret
    ```
5. ### Starting both Mosquitto and MongoDB, and then starting the two Node.js apps:

    Backend:

    ```
    cd server
    npm run dev
    ```

    Frontend

    ```
    cd client
    npm run dev
    ```
