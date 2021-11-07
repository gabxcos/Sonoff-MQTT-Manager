# Sonoff MQTT Manager - L'App Frontend
<i>( <a href="./">English</a> | Italiano )</i>
<br/><br/>

Per il frontend, è stato scelto il framework Svelte. È un'alternativa nuova e leggera a framework classici come React o Angular, rendendo semplice una rapida prototipazione di una web-app completa.

Questa cartella nello specifico utilizza anche Sapper, per la configurazione tramite Rollup e il supporto al routing.

---

## Altri packages

- `svelte-chartjs`: un adattamento della famosa libreria `Graph.js` in modo tale da sfruttare componenti Svelte e logica a componenti.
- `chartjs-adapter-moment`: import necessario per adattare le Date durante il computo dei punti da renderizzare nel grafico.
- `sveltestrap`: un adattamento della famosissima libreria CSS+JS Bootstrap, per utilizzare i suoi tag HTML e le sue classi tramite componenti Svelte.

---

## Stores

Il file `auth.js` implementa due store globali, `isAuth` e `user`.

- `isAuth` assicura globalmente l'autenticazione dell'utente, e aiuta con i redirect automatici alle pagine di Login/Register/Dashboard e a nascondere componenti non autorizzati. Lo store recupera i dati dell'utente corrente dal Local Storage e verifica che il token JWT non sia scaduto. La funzione di logout svuota il Local Storage, assicurando che `isAuth` diventi False e richiedendo un nuovo login.

- `user` contiene dati utili sull'utente, per popolare la dashboard all'avvio, come il loro `nickname` e una lista di `topics` posseduti.

---

## Routes e struttura delle pagine

Il file `_layout.svelte` definisce il Layout per tutte le altre pagine, dove dentro il tag `<body>` è sempre presente un componente `<Nav>`, seguito da uno `<slot>` custom.

- In `login.svelte` e `register.svelte`, corrispondenti alle routes `/login` e `/register`, `<FormMain>` è il container `<main>`, e al suo interno un componente Bootstrap Form `<Login>` o `<Register>`.

- In `index.svelte`, corrispondente alla route `root, /`, il contenuto è renderizzato all'interno di un componente `<DashboardMain>` per comprendere un tab Bootstrap Nav ed un container per il Graph se l'utente è autenticato, e altrimenti un messaggio placeholder in attesa che l'utente venga reindirizzato.

---

### Components

- cartella `containers`: contiene due componenti, `DashboardMain` e `FormMain`, utilizzati per stilizzare diversamente un tag HTML `<main>` in base alla tipologia di contenuto della pagina.
- cartella `forms`: contiene due componenti, `Login` e `Register`, utilizzati per renderizzare dei componenti Bootstrap Form corrispondenti ed eseguire una richiesta POST al backend al loro submit.
- `Nav`: un componente che rappresenta il top nav delle pagine, riempito diversamente in base che l'utente sia autenticato o meno.
- `Graph`: il componente più complicato, contiene la logica per calcolare i punti del grafico sulla base delle Observations prelevate dal database, converte le date in ascisse dei punti, e renderizza il tutto all'interno di un componente`<Graph>`, aggiornato ad ogni response che la Dashboard riceve dal backend.