# Sonoff MQTT Manager - The Frontend App
<i>( English | <a href="./LEGGIMI.md">Italiano</a> )</i>
<br/><br/>

For the frontend, the Svelte framework was chosen. It's a new, lightweight alternative to classic frameworks such as React or Angular, which makes it very easy to come up with a working prototype for a full web app.

This folder is specifically powered by Sapper, for configuration with Rollup and routing support.

---

## Other packages

- `svelte-chartjs`: this is an adaptation of the famous `Graph.js` library in order to use Svelte components and component logic.
- `chartjs-adapter-moment`: this import is needed to adapt the format of Dates when rendering points to a graph.
- `sveltestrap`: this is an adaptation of the popular CSS+JS framework Bootstrap, to use its custom HTML tags and classes as Svelte components.

---

## Stores

The `auth.js` file implements two Svelte global stores, `isAuth` and `user`.

- `isAuth` ensures globally that the user is authenticated, and helps with redirects to Login/Register/Dashboard pages and hiding unauthorized components. The store retrieves a current user's data from the Local Storage and verifies that the token isn't expired. The logout function also erases the Local Storage, ensuring `isAuth` to be set to false and force a new login.

- `user` contains useful data on the user, to populate the dashboard on startup, such as their `nickname` and the list of owned `topics`.

---

## Routes and page structure

The `_layout.svelte` file defines the Layout for any other page, where inside the `<body>` tag a `<Nav>` component is always present, followed by a custom `<slot>`.

- In `login.svelte` and `register.svelte`, equal to the `/login` and `/register` routes, the `<FormMain>` is the `<main>` container, and inside either a `<Login>` or `<Register>` Bootstrap Form component.

- In `index.svelte`, equal to the `root, /` route, the content is rendered inside a `<DashboardMain>` component to be a tab Bootstrap Nav and a container for the Graph if the user is authenticated, and otherwise a placeholder message while waiting for the guest user to be redirected.

---

### Components

- `containers` folder: it contains two components, `DashboardMain` and `FormMain`, used to stylize a `<main>` HTML element differently dipending on the type of page content.
- `forms` folder: it contains two components, `Login` and `Register`, used to render a corresponding Bootstrap Form and execute a POST request on submit.
- `Nav`: a component representing the page's top nav, customized based on whether a user is authenticated or not
- `Graph`: the most complex component, it contains the logic to compute the points of the graph based on Observations in the database, convert Dates to data points' x's, and render everything inside a `<Graph>` component, to be updated at every response the Dashboard receives from the backend.