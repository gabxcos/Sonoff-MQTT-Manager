<script>
	import Register from '../components/forms/Register.svelte';
	import FormMain from '../components/containers/FormMain.svelte';

	import { isAuth } from '../auth';
    import { onMount } from 'svelte';

    onMount(()=>{
		isAuth.useLocalStorage();
        if($isAuth) location = "/";
    });
</script>

<svelte:head>
	<title>{SITE_TITLE} - Register</title>
</svelte:head>

<FormMain>
	<Register/>
</FormMain>