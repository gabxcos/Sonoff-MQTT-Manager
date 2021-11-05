# Sonoff MQTT Manager
<i>( <a href="./">English</a> | Italiano )</i>
<br/><br/>

Questo progetto è stato utilizzato come elaborato di fine corso in **Internet of Things Based Smart Systems** presso **Unict - Università degli Studi di Catania**.

L'obiettivo principale di questo elaborato consiste nel dimostrare la comprensione da parte dello studente di uno specifico argomento del corso, in questo caso il protocollo MQTT.

---

## In breve

Quest'app fornisce un ambiente full-stack per la gestione dei **Sonoff Wi-Fi Switches**, presupponendo che siano già stati flashati con il **Tasmota** firmware e configurati per connettersi al broker MQTT su rete locale.

Il **backend** fornisce un sistema di autenticazione JWT-based per gli utenti, che permette loro di aggiungere o rimuovere Sonoff alla loro collezione usando gli ID autogenerati da Tasmota.

Sono presenti route API per accendere e spegnere i Sonoff, aggiungerli o eliminarli dalla lista di un utente, o ottenere l'intera collezione.

Ogni volta che un Sonoff cambia di stato, il backend ascolta il suo topic MQTT e crea una nuova Observation nel database, in modo tale da aggiornare di conseguenza ed in tempo reale lo stato sul frontend.

Il **frontend** presenta form per la registrazione ed il login dell'utente al primo avvio, con sessioni di durata massima di 1 ora (valore di default) a seguito della quale si richiede all'utente di effettuare il login.

Una volta loggato, l'utente può navigare fra diverse tab con i Sonoff che possiede, o aggiungerne di nuovi.

Per ogni Sonoff che si seleziona, l'utente può cambiarne lo stato usando un bottone GUI di ON/OFF, eliminarlo dalla sua collezione, e scegliere un intervallo di tempo da considerare (ultima 1 ora, ultime 24 ore, ultimi 7 giorni).

Per un dato intervallo, in **Chart.js** sono graficati a schermo gli eventi di ON e OFF, e viene calcolato il periodo in cui il Sonoff è rimasto acceso, permettendo all'utente di calcolare il consumo energetico atteso inserendo la potenza del dispositivo.

---

## Come riprodurre il mio ambiente locale ed avviare il progetto

Questa repo è stata testata con un'installazione locale del broker MQTT **Eclipse Mosquitto**, ed un'installazione locale di **MongoDB**, entrambi in run sulla stessa macchina che esegue le due app Node.js.

Una volta installati entrambi gli eseguibili, sono stati effettuati i seguenti step per permettere il corretto funzionamento del progetto.

1. ### Configurare una **password list**, una **access list**, e altri parametri per Mosquitto.

    Ad esempio, un utente `node_server` con `password` come sua password, per autenticare l'app di backend, e un utente `tasmota` per autenticare i Sonoff.

    L'eseguibile di default `mosquitto_passwd` è stato utilizzato per creare il file con la password list.
    ```
    # Per creare il file
    mosquitto_passwd -c <password file> <username>

    # Per aggiungere utenti al file
    mosquitto_passwd <password file> <username>

    # Entrambe le istruzioni richiedono poi la password da associare all'utente <username>
    ```

    La access list potrebbe essere necessaria per far sì che il `node_server` sia correttamente "subscribed" ai topic e effettui correttamente "publish".

    Una semplice configurazione per permettere a qualunque utente di accedere tutti i topic in read e write (non è sicuro!) sarebbe:
    ```
    topic readwrite $SYS/#

    pattern readwrite $SYS/#
    ```

    Infine, è richiesto un file `.conf` per comunicare le nuove impostazioni a Mosquitto, modificando il suo config file di default o specificando un nuovo file in fase di esecuzione:
    ```
    mosquitto -c ./mosquitto.conf
    ```

    I parametri da me modificati in configurazione includono:

    ### Definire il password file
    ```
    password_file ./password_file
    ```

    ### Permettere accessi anonimi (non sicuro, opzionale)
    ```
    allow_anonymous true
    ```

    ### Definire la access list
    ```
    acl_file ./acl_file.acl
    ```

    ### Permettere l'accesso sulla rete locale e settare la porta
    ```
    listener 1883 0.0.0.0
    ```

2. ### Configurare Tasmota per usare MQTT correttamente.

    Ogni Sonoff dev'essere configurato sul pannello della web-app accessibile usando l'IP locale del dispositivo, e bisogna assicurare questi settaggi:
    ```
    Host: <l'IP locale del computer che usa Mosquitto>
    Port: 1883
    Client: qualunque
    User: <un username valido nel password file di Mosquitto>
    Password: <password>
    Topic: tasmota_%06X
    Full Topic: %prefix%/%topic%/
    ```

    In particolare:
    - il `topic` ed il `full topic` devono essere esattamente tali, poiché il backend si aspetta tale formattazione per i topic
    - l'IP può essere l'IP locale del router se la porta 1883 è stata configurata correttamente per il forwarding
    ```
    192.168.1.1:1883 <-----> 192.168.1.x:1883
    ```

3. ### Creare un database MongoDB per il backend

4. ### Configurare il file `.env`, ad esempio:

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
5. ### Avviare sia Mosquitto che MongoDB, e poi avviare le due app Node.js:

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
