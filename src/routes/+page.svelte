<script>
	//@ts-nocheck
	import LoadingSpinner from '$lib/loader.gif';
	import Header from './Header.svelte';
	import Table from './Table.svelte';
	import ComparisonTable from './ComparisonTable.svelte';
	import SavedStatus from './SavedStatus.svelte';
	import PopUp from './PopUp.svelte';
	import LanguagePicker from './LanguagePicker.svelte';
	import { load } from './loadPageData';
	import { theme } from '$lib/Stores/ThemeStore';
	import { comparing } from '$lib/Stores/comparingStore';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { Routes, TimetableBackendApiService } from '$lib/TimetableBackendApiService';

	let loading = true;
	let styles = {};

	onMount(async () => {
		await load();
		styles = await TimetableBackendApiService.post(Routes.GetStyle, get(theme));

		theme.subscribe(async (value) => {
			styles = await TimetableBackendApiService.post(Routes.GetStyle, value);
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
