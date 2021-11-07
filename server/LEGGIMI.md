# Sonoff MQTT Manager - L'App Backend
<i>( <a href="./">English</a> | Italiano )</i>
<br/><br/>

Il lato backend del progetto è costituito da un API server basato su `Express.js`, connesso a `MongoDB` tramite il package Mongoose per salvare dati, e all'`MQTT broker` Mosquitto tramite il package MQTT.js.

---

## Struttura del progetto

Il progetto è avviato tramite il file principale, `app.js`, che apre il server Express.js coi suoi plugin in ascolto sulla porta 3000 e avvia gli altri servizi.

Tali servizi sono presenti nella cartella di root del server come singoli file JavaScript:
- `logger.js`: espone una singola funzione di logging/debugging, che prende come parametri un **service** ed un **message** per effettuare logout sulla console di Node nel formato:
    ```
    [MQTT] Connesso al Broker.
    ```

- `broker.js`: importa il package **MQTT.js** ed espone una pseudoclasse `Broker`, con funzionalità di base per subscribe, publish, e verifica della connessione.

    Una volta importato, questo file tenta anche di: connettersi al Broker; trovare tutti i Sonoff registrati; effettuare subscribe ai topic corrispondenti.

    Questo broker suppone un settaggio fisso di `QoS=2` e un'autenticazione username+password.

- `db.js`: un semplice servizio per connettersi a MongoDB, verificare la connessione, e ritornare un oggetto `db` su cui effettuare le queries.

- `config.js`: un semplice servizio che fornisce un environment globale usando `dotenv` per recuperare ogni field di un file `.env`.

Le altre cartelle forniscono **Routes** e **Middlewares** nel senso di Express, **Models** nel senso di Mongoose, e **Controllers** per collegare il tutto assieme.

---

## Models

Sono stati creati tre modelli di Mongoose, ciascuno con - in aggiunta ai propri field personali - campi created e updated di timestamp.

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

Ciascuna di queste route possiede il metodo di un Controller come callback, per utilizzare gli schemas di Mongoose correttamente ed effettuare operazioni sul Broker MQTT.

- ### Health check

`GET: /` --> ottiene un semplice messaggio di Health check

- ### Sonoffs management

`POST: /sonoff/create` --> crea un nuovo Sonoff o aggiunge l'utente ad uno esistente, dati un `topic` ed un custom `name`

`POST: /sonoff/delete` --> rimuove un utente da o cancella un Sonoff, dato il suo `topic`

`GET: /sonoff/collection` --> ritorna una collezione di Sonoff posseduti dall'utente

`GET: /sonoff/:id/observations` --> ritorna tutte le Observations per il Sonoff con `topic = id`

`POST: /sonoff/:id/toggle, /sonoff/:id/on, /sonoff/:id/off` --> modifica lo stato ON/OFF del Sonoff con `topic = id`

- ### User authentication

`POST: /user/register` --> crea un nuovo utente, dato un `nickname` pubblico e una coppia di `username` e `password`

`POST: /user/login` --> logga l'utente con dati `username` e `password`, e ritorna una JWT generato dal server

---

## Middleware

È presente un solo middleware, `auth.js`, che ha la funzione di verificare il token JWT presente nell'intestazione delle richieste HTTP, scoprire se è scaduto, e trovare un utente valido ad esso collegato.

Blocca le callback legate alla route, terminandole prematuramente con una risposta `401: Unauthorized`.