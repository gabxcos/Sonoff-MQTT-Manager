<script>
	import Login from '../components/forms/Login.svelte';
	import FormMain from '../components/containers/FormMain.svelte';

	import { isAuth } from '../auth';
    import { onMount } from 'svelte';

    onMount(()=>{
		isAuth.useLocalStorage();
        if($isAuth) location = "/";
    });
</script>

<style>

</style>

<svelte:head>
	<title>{SITE_TITLE} - Login</title>
</svelte:head>

<FormMain>
	<Login/>
</FormMain>
