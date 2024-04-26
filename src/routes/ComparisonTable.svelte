<script>
	//@ts-nocheck
	import { schedule, fullweektoogle } from '$lib/Stores/ScheduleStore.js';
	import { get_table_pattern } from '$lib/Stores/comparingStore';
	import { comparing } from '$lib/Stores/comparingStore';
	import { mapping, languageStore, dictionary } from '$lib/Stores/LanguageStore';
	import { buddyStore } from '$lib/Stores/userStore';
	import { get } from 'svelte/store';
	import Legend from './Legend.svelte';

	export let styles;

	let buddy = get(buddyStore);
	let language = get(languageStore).language;

	languageStore.subscribe((value) => {
		language = value.language;
	});

	buddyStore.subscribe((value) => {
		buddy = value;
	});

	let coloring = get_table_pattern();
	const five_day_ratio = 90 / 5;
	const seven_day_ratio = 90 / 7;
	let ratio = get(fullweektoogle) ? seven_day_ratio : five_day_ratio;

	fullweektoogle.subscribe((value) => {
		ratio = value ? seven_day_ratio : five_day_ratio;
	});

	comparing.subscribe((value) => {
		if (!value.is_comparing) return;
		coloring = get_table_pattern();
	});
</script>

<div class="center">
	<Legend {styles} />
	<table>
		<tr>
			<th>{buddy}</th>
			<th>{dictionary.get(mapping.Day_1)[language]}</th>
			<th
				style="color: {styles.tableHeaderTuesdayFontColor}; background-color: {styles.tableHeaderTuesdayBackgroundColor}; width: {ratio}%;"
				>{dictionary.get(mapping.Day_2)[language]}</th
			>
			<th
				style="color: {styles.tableHeaderWednesdayFontColor}; background-color: {styles.tableHeaderWednesdayBackgroundColor} width: {ratio}%;"
				>{dictionary.get(mapping.Day_3)[language]}</th
			>
			<th
				style="color: {styles.tableHeaderThursdayFontColor}; background-color: {styles.tableHeaderThursdayBackgroundColor}; width: {ratio}%;"
				>{dictionary.get(mapping.Day_4)[language]}</th
			>
			<th
				style="color: {styles.tableHeaderFridayFontColor}; background-color: {styles.tableHeaderFridayBackgroundColor}; width: {ratio}%;"
				>{dictionary.get(mapping.Day_5)[language]}</th
			>
			{#if $fullweektoogle}
				<th
					style="color: {styles.tableHeaderSaturdayFontColor}; background-color: {styles.tableHeaderSaturdayBackgroundColor}; width: {ratio}%;"
					>{dictionary.get(mapping.Day_6)[language]}</th
				>
				<th
					style="color: {styles.tableHeaderSundayFontColor}; background-color: {styles.tableHeaderSundayBackgroundColor}; width: {ratio}%;"
					>{dictionary.get(mapping.Day_7)[language]}</th
				>
			{/if}
		</tr>
		{#each $schedule as hour, i}
			<tr>
				<td style="text-align: center;">{hour.Hours}</td>
				<td style="background-color: {coloring[i][0]};">
					<p>{dictionary.get(mapping.Room)[language]}: {hour.Day1.Room}</p>
					<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day1.Subject}</p>
					<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day1.Teacher}</p>
				</td>
				<td style="background-color: {coloring[i][1]};">
					<p>{dictionary.get(mapping.Room)[language]}: {hour.Day2.Room}</p>
					<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day2.Subject}</p>
					<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day2.Teacher}</p>
				</td>
				<td style="background-color: {coloring[i][2]};">
					<p>{dictionary.get(mapping.Room)[language]}: {hour.Day3.Room}</p>
					<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day3.Subject}</p>
					<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day3.Teacher}</p>
				</td>
				<td style="background-color: {coloring[i][3]};">
					<p>{dictionary.get(mapping.Room)[language]}: {hour.Day4.Room}</p>
					<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day4.Subject}</p>
					<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day4.Teacher}</p>
				</td>
				<td style="background-color: {coloring[i][4]};">
					<p>{dictionary.get(mapping.Room)[language]}: {hour.Day5.Room}</p>
					<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day5.Subject}</p>
					<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day5.Teacher}</p>
				</td>
				{#if $fullweektoogle}
					<td style="background-color: {coloring[i][5]};">
						<p>{dictionary.get(mapping.Room)[language]}: {hour.Day6.Room}</p>
						<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day6.Subject}</p>
						<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day6.Teacher}</p>
					</td>
					<td style="background-color: {coloring[i][6]};">
						<p>{dictionary.get(mapping.Room)[language]}: {hour.Day7.Room}</p>
						<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day7.Subject}</p>
						<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day7.Teacher}</p>
					</td>
				{/if}
			</tr>
		{/each}
	</table>
</div>

<style>
	.center {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		height: 100vh;
		margin-top: 5%;
		z-index: 0;
	}
	table {
		width: 70%;
		height: 50%;
		border-collapse: collapse;
		margin-bottom: 5%;
	}

	th,
	td {
		border: 1px solid black;
	}
	th {
		font-size: 2rem;
		text-align: center;
	}
	td {
		font-size: 0.8rem;
		text-align: start;
	}
</style>
