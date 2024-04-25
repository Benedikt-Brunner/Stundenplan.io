<script>
	//@ts-nocheck
	import LoadingSpinner from '$lib/loader.gif';
	import Header from './header.svelte';
	import Table from './Table.svelte';
	import ComparisonTable from './comparison_Table.svelte';
	import SavedStatus from './saved_status.svelte';
	import PopUp from './PopUp.svelte';
	import LanguagePicker from './LanguagePicker.svelte';
	import {show_error} from '$lib/Stores/PopUpStore.js';
	import { load } from './loadPageData';
	import { theme } from '$lib/Stores/ThemeStore';
	import { comparing } from '$lib/Stores/comparingStore';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { TimetableBackendApiService } from '$lib/TimetableBackendApiService';

	let loading = true;
	let styles = {};

	onMount(async () => {
		await load();

		let {res, err} = await TimetableBackendApiService.getStyle(get(theme));

		// TODO: Add error translation
		if (err) {
			show_error(`There was an error fetching your theme: ${err.msg}`)
		}

		styles = res ?? {};

		theme.subscribe(async (value) => {
			let {res, err} = await TimetableBackendApiService.getStyle(value);

			// TODO: Add error translation
			if (err) {
				show_error(`There was an error fetching your theme: ${err.msg}`)
			}

			styles = res ?? {};
		});

		loading = false;
	});
</script>

{#if loading}
	<div class="loading">
		<img src={LoadingSpinner} alt="loading spinner" />
	</div>
{:else}
	<Header {styles} />
	<PopUp />
	{#if $comparing.is_comparing}
		<ComparisonTable {styles} />
	{:else}
		<Table {styles} />
	{/if}

	{#if !$comparing.is_comparing}
		<SavedStatus />
	{/if}
	<LanguagePicker />
{/if}

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
</style>
