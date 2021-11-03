<script>
	import { isAuth } from '../auth';
	import { onMount } from 'svelte';

	import {
		Nav,
		NavItem,
		NavLink,
		FormGroup,
		Label,
		Input,
		Icon
	} from 'sveltestrap';
	import DashboardMain from '../components/containers/DashboardMain.svelte';
	import Graph from "../components/Graph.svelte";

	let currTopic, sonoffs;

	onMount(()=>{
		isAuth.useLocalStorage();
		if(!$isAuth) location = "/login";
		else{
			sonoffs = localStorage.getItem("topics");
			if(sonoffs!==null){
				sonoffs = JSON.parse(sonoffs);
				currTopic = sonoffs.length>0 ? sonoffs[0].topic : null;
			}

			updatePoints();
			updateTopics()

			setInterval(updatePoints, 2000);
			setInterval(updateTopics, 6000);
		}
	});

	let host = SERVER_HOST, port = SERVER_PORT;

	let updatePoints = () => {
		if(currTopic==null){
			pointData = [];
			power = false;
		}
		else fetch(`http://${host}:${port}/sonoff/${currTopic}/observations`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer '+localStorage.getItem("jwt")
			}
		})
		.then(res => {
			if(res.ok) return res.json();         

			throw new Error('Something went wrong.');
		})
		.then(data => {
			if(data.success){
				let points = data.payload.observations;
				if(points.length>0){
					points = points.map(ob => {return { x: Date.parse(ob.date), y: ob.value ? 'ON' : 'OFF' } });
					points = [ ...points, {x: Date.now(), y: points.at(-1).y }]
				}

				pointData = points;
				elapsedOnTime = calculateElapsedOnTime();
				power = pointData.length > 0 ? (pointData.at(-1).y == 'ON' ? true : false) : false;
			}else{
				console.log(err);
			}
		})
		.catch(err => {
			console.log(err);
		});
	}

	let updateTopics = () => {
		fetch(`http://${host}:${port}/sonoff/collection`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer '+localStorage.getItem("jwt")
			}
		})
		.then(res => {
			if(res.ok) return res.json();         

			throw new Error('Something went wrong.');
		})
		.then(data => {
			if(data.success){
				let newSonoffs = data.payload.sonoffs;

				if(newSonoffs.length == sonoffs.length){
					for (var i = 0; i < newSonoffs.length; i++) {
						if(newSonoffs[i].topic!==sonoffs[i].topic && newSonoffs[i].name !== newSonoffs[i].name){
							sonoffs = newSonoffs;
							currTopic = newSonoffs.length>0 ? newSonoffs[0].topic : null;
							break;
						}
					}
				}else{
					sonoffs = newSonoffs;
					currTopic = newSonoffs.length>0 ? newSonoffs[0].topic : null;
				}
			}else{
				console.log(err);
			}
		})
		.catch(err => {
			console.log(err);
		});
	}

	let toggleSonoff = () => {
		fetch(`http://${host}:${port}/sonoff/${currTopic}/toggle`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer '+localStorage.getItem("jwt")
			}
		})
		.then(res => {
			if(res.ok) return res.text();         

			throw new Error('Something went wrong.');
		})
		.then(data => {
			console.log(data);
		})
		.catch(err => {
			console.log(err);
		});
	}

	let createSonoff = () => {
		fetch(`http://${host}:${port}/sonoff/create`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer '+localStorage.getItem("jwt")
			},
            body: JSON.stringify({
                topic: newTopic,
                name: newName
            })

		})
		.then(res => {
			if(res.ok) return res.json();         

			throw new Error('Something went wrong.');
		})
		.then(data => {
			console.log(data.message);
			updateTopics();
			setTimeout(()=>{ currTopic = sonoffs.at(-1).topic; }, 1000);
		})
		.catch(err => {
			console.log(err);
		});
	}

	let deleteSonoff = (t) => {
		fetch(`http://${host}:${port}/sonoff/delete`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer '+localStorage.getItem("jwt")
			},
            body: JSON.stringify({
                topic: t
            })

		})
		.then(res => {
			if(res.ok) return res.json();         

			throw new Error('Something went wrong.');
		})
		.then(data => {
			console.log(data.message);
			updateTopics();
			setTimeout(()=>{ currTopic = sonoffs != null ? sonoffs[0].topic : null; }, 1000);
		})
		.catch(err => {
			console.log(err);
		});
	}

	let calculateElapsedOnTime = () => {
		if(pointData.length<1) return 0;
		let tmpTime = 0;
		for(var i = 0; i < (pointData.length - 1); i+=2){
			if(pointData[i].y == 'ON' && pointData[i].x >= Date.now() - timeSpan) tmpTime += (pointData[i+1].x - pointData[i].x);
			else i++;
		}
		return tmpTime;
	}

	$: if(currTopic){
		updateTopics();
		updatePoints();
	}

    let pointData = [];
	let timeSpan = 3600*1000;
	let elapsedOnTime = 1000;

	let inConsumption = 0, outConsumption;
	$: outConsumption = inConsumption * elapsedOnTime / (3600 * 1000);

	let power;
	$: power = pointData.length > 0 ? (pointData.at(-1).y == 'ON' ? true : false) : false;

	let newTopic, newName;

</script>

<style>
	.mainArea {
		width: 100%;
		height: 100%;
	}

	.graphOptions {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		margin: 20px 0;
	}

	#powerButton, #trashButton {
		font-size: 60px;
	}

	#trashButton:hover {
		text-shadow: 0 0 10px #3e3e3e;
	}

	#powerButton:hover {
		text-shadow: 0 0 10px #3e3e3e;
	}

	#powerButton.isOn {
		color: #3777de;
		text-shadow: 0 0 20px #6f9adf;
	}

	#powerButton.isOn:hover {
		text-shadow: 0 0 30px #3777de;
	}

	.form-create {
		max-width: 500px;
		margin: 50px auto;
	}

	.form-create > * {
		margin: 10px 0;
	}
</style>

<svelte:head>
	<title>{SITE_TITLE} - Dashboard</title>
</svelte:head>

<DashboardMain>
	{#if $isAuth}
	<Nav tabs>
		{#if sonoffs}
			{#each sonoffs as sonoff}
			<NavItem>
				<NavLink href="#" active={currTopic==sonoff.topic} on:click={()=>currTopic=sonoff.topic}>
					{sonoff.name} [{sonoff.topic}]
				</NavLink>
			</NavItem>
			{/each}
		{/if}
		<NavItem>
			<NavLink href="#" active={currTopic===null} on:click={()=>currTopic=null}>+</NavLink>
		</NavItem>
	</Nav>

	<section class="mainArea">
		{#if currTopic!=null}
		<div class="graphOptions">
			<FormGroup class="gOption">
				<Label for="timespanSelect">Select a timespan</Label>
				<Input type="select" name="timespan" bind:value={timeSpan} id="timespanSelect">
				  <option value={3600*1000}>1h</option>
				  <option value={24*3600*1000}>24h</option>
				  <option value={7*24*3600*1000}>7d</option>
				</Input>
			</FormGroup>

			<FormGroup>
				<Label for="inputConsumption">Device Consumption (kW)</Label>
				<Input type="number" name="inputCons" bind:value={inConsumption} placeholder={0} id="inputConsumption"/>
			</FormGroup>

			<FormGroup>
				<Label for="outputConsumption">Total Consumption (kWh)</Label>
				<Input type="text" name="outputCons" value={outConsumption.toFixed(4)} placeholder={0} id="outputConsumption"/>
			</FormGroup>

			<div id="powerButton" class:isOn={power} on:click={toggleSonoff}>
				<Icon name="power" />
			</div>

			<div id="trashButton" on:click={()=>deleteSonoff(currTopic)}>
				<Icon name="trash"/>
			</div>
		</div>
			<Graph {pointData} {timeSpan} {elapsedOnTime}/>
		{:else}
			<form class="form-create" on:submit|preventDefault={createSonoff}>
				<h1 class="h3 mb-3 font-weight-normal">Create new Sonoff</h1>
				<label for="inputTopic" class="sr-only">Tasmota Topic</label>
				<input type="text" id="inputTopic" class="form-control" bind:value={newTopic} placeholder="ABC345" required="true">
				<label for="inputName" class="sr-only">Custom Name</label>
				<input type="text" id="inputName" class="form-control" bind:value={newName} placeholder="My Cool Sonoff" required="true">
				<button class="btn btn-lg btn-primary btn-block" type="submit">Create</button>
			</form>
		{/if}
	</section>
	{:else}
		Redirecting to register page...
	{/if}
</DashboardMain>