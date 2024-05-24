<script>
	//@ts-nocheck
	import LoadingSpinner from '$lib/loader.gif';
	import Header from './Header.svelte';
	import Table from './Table.svelte';
	import ComparisonTable from './ComparisonTable.svelte';
	import SavedStatus from './SavedStatus.svelte';
	import PopUp from './PopUp.svelte';
	import LanguagePicker from './LanguagePicker.svelte';
	import { show_error } from '$lib/Stores/PopUpStore.js';
	import { load } from './loadPageData';
	import { theme } from '$lib/Stores/ThemeStore';
	import { comparing } from '$lib/Stores/comparingStore';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { TimetableBackendApiService } from '$lib/TimetableBackendApiService';
	import StyleClass from '$lib/StyleClass';
	import { dictionary, mapping } from '$lib/Stores/LanguageStore.js';

	let loading = true;
	let styles = {};

	onMount(async () => {
		await load();

		let { res, err } = await TimetableBackendApiService.getStyle(get(theme));

		if (err) {
			show_error(`${dictionary.get(mapping.Fetching_Theme_Failed)}${err.msg}`);
		}

		const data = await res.json();

		styles = new StyleClass(data) ?? {};

		theme.subscribe(async (value) => {
			let { res, err } = await TimetableBackendApiService.getStyle(value);

			if (err) {
				show_error(`${dictionary.get(mapping.Fetching_Theme_Failed)}${err.msg}`);
			}

			const data = await res.json();

			styles = new StyleClass(data) ?? {};

			applyMetaStyles(styles);
		});

		loading = false;
	});

	function applyMetaStyles(styles) {
		const body = document.querySelector('body');

		body.style.setProperty('background-color', styles.primaryColor);
		body.style.setProperty('color', styles.secondaryColor);
	}
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
