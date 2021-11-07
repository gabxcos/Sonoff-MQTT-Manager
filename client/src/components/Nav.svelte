<script>
	import {
	  Navbar,
	  NavbarBrand,
	  Nav,
	  NavItem,
	  NavLink
	} from 'sveltestrap/src';
  
	import { isAuth, user } from '../auth';

	function logout(){
		isAuth.logout();
		user.logout();

		setTimeout(() => { location = "/login" }, 1000);
	}
</script>

<style>
	.nav-item-custom {
		display: block;
    	padding: 0.5rem 1rem;
	}
</style>

<Navbar color="light" light expand="md">
	<NavbarBrand href="/">Sonoff MQTT Manager</NavbarBrand>
	<Nav class="ms-auto" navbar>
		<NavItem>
			<span class="nav-item-custom">
				{#if $isAuth && $user }
				{$user.nickname}
				{:else}
				(Guest)
				{/if}
			</span>
		</NavItem>
		<NavItem>
			<span class="nav-item-custom">
				|
			</span>
		</NavItem>
		{#if $isAuth}
		<NavItem>
			<NavLink on:click={logout}>Logout</NavLink>
		</NavItem>
		{:else}
			<NavItem>
				<NavLink sapper:prefetch href="/register">Register</NavLink>
			</NavItem>
			<NavItem>
				<NavLink sapper:prefetch href="/login">Login</NavLink>
			</NavItem>
		{/if}
	</Nav>
  </Navbar>