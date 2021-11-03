<script>
	import { isAuth, user } from '../auth';
	import { onMount } from 'svelte';
	onMount(()=>{
		isAuth.useLocalStorage();
		user.useLocalStorage();
	});

	import Nav from '../components/Nav.svelte';
</script>

<Nav/>

<slot></slot>