<script>
	// @ts-nocheck

	import Git from '$lib/github.svg';
	import Options from './Options.svelte';
	import Social from './Social.svelte';
	import { usernameStore } from '$lib/Stores/UserStore.js';
	import { languageStore, dictionary, mapping } from '$lib/Stores/LanguageStore';
	import { comparing } from '$lib/Stores/ComparingStore.js';
	import { get } from 'svelte/store';

	export let styles;

	let language = get(languageStore).language;
	let username = get(usernameStore);

	languageStore.subscribe((value) => {
		language = value.language;
	});

	usernameStore.subscribe((value) => {
		username = value;
	});
</script>

<nav style="color: {styles.secondaryColor}; background-color: {styles.primaryColor}; box-shadow: 0 0 15px 0 {styles.secondaryColor}70;">
	<h2>Stundenplan.me</h2>
	<h3>
		{dictionary.get(mapping.Greeting)[language]}, {username ?? 'Guest'}
	</h3>
	{#if !$comparing.is_comparing}
		<Options {styles} />
	{/if}
	<Social {styles} />
	<a href="https://github.com/Benedikt-Brunner/Timetable"
		><img src={Git} alt="Github Logo" width="40vw" style="margin: 4%;" /></a
	>
</nav>

<style>
	nav {
		display: flex;
		justify-content: end;
		align-items: start;
		padding: 0 1rem;
		height: 5rem;
		position: relative;
		top: 0;
		z-index: 12;
	}

	nav a {
		margin-left: 1%;
		margin-top: 1rem;
	}

	nav h2 {
		margin-right: auto;
	}

	nav h3 {
		position: absolute;
		left: 45%;
		margin-top: 1.5rem;
	}
</style>
