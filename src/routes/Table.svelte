<script>
	//@ts-nocheck
	import {
		schedule,
		fullweektoogle,
		get_lessons_for_insertion_point,
		insert_merged_lesson
	} from '$lib/Stores/ScheduleStore.js';
	import { changed, couting_signal } from '$lib/Stores/ChangedStore.js';
	import { mapping, languageStore, dictionary } from '$lib/Stores/LanguageStore';
	import { get } from 'svelte/store';
	import SveltyPicker from 'svelty-picker';
	import { usernameStore, buddyStore } from '$lib/Stores/UserStore.js';
	import { Routes, TimetableBackendApiService } from '$lib/TimetableBackendApiService';
	import { show_error } from '$lib/Stores/PopUpStore';
	import {lessonAttributeToggleStore} from "$lib/Stores/LessonAttributeToggleStore.js";

	/**
	 * @type {Styles}
	 */
	export let styles;

	$: updateCssVars(styles);

	let username = get(usernameStore);
	let buddy = get(buddyStore);
	let language = get(languageStore).language;

	languageStore.subscribe((value) => {
		language = value.language;
	});

	usernameStore.subscribe((value) => {
		username = value;
	});

	buddyStore.subscribe((value) => {
		buddy = value;
	});

	let selectobject = { row: 0, column: 0 };
	let selected = false;
	const five_day_ratio = 90 / 5;
	const seven_day_ratio = 90 / 7;
	let ratio = get(fullweektoogle) ? seven_day_ratio : five_day_ratio;
	let changed_loc = false;

	fullweektoogle.subscribe((value) => {
		ratio = value ? seven_day_ratio : five_day_ratio;
	});

	async function persist_on_exit(e) {
		if (!username) return;
		// Cancel the event as stated by the standard.
		e.preventDefault();
		// Chrome requires returnValue to be set.
		e.returnValue = '';
		let data = get(schedule);

		const { res, error } = await TimetableBackendApiService.post(Routes.UpdateSchedule, data);
		if (res?.status === 200) {
			changed_loc = false;
			changed.set(false);
		} else {
			show_error(error.message);
		}
	}

	async function persist() {
		if (!username) return;
		let data = get(schedule);

		const { res, error } = await TimetableBackendApiService.post(Routes.UpdateSchedule, data);
		if (res?.status === 200) {
			changed_loc = false;
			changed.set(false);
		} else {
			show_error(error.message);
		}
	}

	$: setStore(changed_loc);

	function setStore(value) {
		changed.set(value);
	}

	function updateBuddy() {
		const value = document.getElementById('buddyInput').value;

		buddyStore.set(value);
		TimetableBackendApiService.updateMetadata({ buddy: value });
	}

	function updateCssVars(styles) {
		const root = document.documentElement;
		root.style.setProperty('--primary-color', styles.primaryColor);
		root.style.setProperty('--secondary-color', styles.secondaryColor);
	}

	couting_signal.subscribe((value) => {
		if (value > 2) {
			changed_loc = true;
		}
	});

	function openAttributeInputManager() {
		selected = true;
		waiter(
				() => document.getElementById('editor').focus()
		);
	}

	function handleAttributeInputManagerEvents(event) {
		if (event.key === 'Escape' || event.key === 'Enter') {
			selected = false;
			changed_loc = true;
		}
	}

	function waiter(callback = () => {}) {
		setTimeout(() => {
			callback();
		}, 100);
	}

	setInterval(() => {
		if (!changed_loc && !get(changed)) return;
		persist();
	}, 10000);
</script>

<svelte:window on:beforeunload={persist_on_exit} />

<div class="center">
	<table>
		<tr>
			<th><input id="buddyInput" type="text" value={buddy} on:input={updateBuddy} /></th>
			<th
				style="color: {styles.tableHeaderMondayFontColor}; background-color: {styles.tableHeaderMondayBackgroundColor}; width: {ratio}%;"
				>{dictionary.get(mapping.Day_1)[language]}</th
			>
			<th
				style="color: {styles.tableHeaderTuesdayFontColor}; background-color: {styles.tableHeaderTuesdayBackgroundColor}; width: {ratio}%;"
				>{dictionary.get(mapping.Day_2)[language]}</th
			>
			<th
				style="color: {styles.tableHeaderWednesdayFontColor}; background-color: {styles.tableHeaderWednesdayBackgroundColor}; width: {ratio}%;"
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
				<td
					style="text-align: center;"
					on:click={() => {
						if (!selected) {
							selectobject.row = i;
							selectobject.column = 0;
							openAttributeInputManager();
						}
					}}>{hour.Hours ?? '?'}</td
				>
				<td
					on:click={() => {
						if (!selected) {
							selectobject.row = i;
							selectobject.column = 1;
							openAttributeInputManager();
						}
					}}
				>
					{#if $lessonAttributeToggleStore.show_room}
						<p>{dictionary.get(mapping.Room)[language]}: {hour.Day1.Room}</p>
					{/if}
					{#if $lessonAttributeToggleStore.show_subject}
						<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day1.Subject}</p>
					{/if}
					{#if $lessonAttributeToggleStore.show_teacher}
						<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day1.Teacher}</p>
					{/if}
				</td>
				<td
					on:click={() => {
						if (!selected) {
							selectobject.row = i;
							selectobject.column = 2;
							openAttributeInputManager();
						}
					}}
				>
					{#if $lessonAttributeToggleStore.show_room}
						<p>{dictionary.get(mapping.Room)[language]}: {hour.Day2.Room}</p>
					{/if}
					{#if $lessonAttributeToggleStore.show_subject}
						<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day2.Subject}</p>
					{/if}
					{#if $lessonAttributeToggleStore.show_teacher}
						<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day2.Teacher}</p>
					{/if}
				</td>
				<td
					on:click={() => {
						if (!selected) {
							selectobject.row = i;
							selectobject.column = 3;
							openAttributeInputManager();
						}
					}}
				>
					{#if $lessonAttributeToggleStore.show_room}
						<p>{dictionary.get(mapping.Room)[language]}: {hour.Day3.Room}</p>
					{/if}
					{#if $lessonAttributeToggleStore.show_subject}
						<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day3.Subject}</p>
					{/if}
					{#if $lessonAttributeToggleStore.show_teacher}
						<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day3.Teacher}</p>
					{/if}
				</td>
				<td
					on:click={() => {
						if (!selected) {
							selectobject.row = i;
							selectobject.column = 4;
							openAttributeInputManager();
						}
					}}
				>
					{#if $lessonAttributeToggleStore.show_room}
						<p>{dictionary.get(mapping.Room)[language]}: {hour.Day4.Room}</p>
					{/if}
					{#if $lessonAttributeToggleStore.show_subject}
						<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day4.Subject}</p>
					{/if}
					{#if $lessonAttributeToggleStore.show_teacher}
						<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day4.Teacher}</p>
					{/if}
				</td>
				<td
					on:click={() => {
						if (!selected) {
							selectobject.row = i;
							selectobject.column = 5;
							openAttributeInputManager();
						}
					}}
				>
					{#if $lessonAttributeToggleStore.show_room}
						<p>{dictionary.get(mapping.Room)[language]}: {hour.Day5.Room}</p>
					{/if}
					{#if $lessonAttributeToggleStore.show_subject}
						<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day5.Subject}</p>
					{/if}
					{#if $lessonAttributeToggleStore.show_teacher}
						<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day5.Teacher}</p>
					{/if}
				</td>
				{#if $fullweektoogle}
					<td
						on:click={() => {
							if (!selected) {
								selectobject.row = i;
								selectobject.column = 6;
								openAttributeInputManager();
							}
						}}
					>
						{#if $lessonAttributeToggleStore.show_room}
							<p>{dictionary.get(mapping.Room)[language]}: {hour.Day6.Room}</p>
						{/if}
						{#if $lessonAttributeToggleStore.show_subject}
							<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day6.Subject}</p>
						{/if}
						{#if $lessonAttributeToggleStore.show_teacher}
							<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day6.Teacher}</p>
						{/if}
					</td>
					<td
						on:click={() => {
							if (!selected) {
								selectobject.row = i;
								selectobject.column = 7;
								openAttributeInputManager();
							}
						}}
					>
						{#if $lessonAttributeToggleStore.show_room}
							<p>{dictionary.get(mapping.Room)[language]}: {hour.Day7.Room}</p>
						{/if}
						{#if $lessonAttributeToggleStore.show_subject}
							<p>{dictionary.get(mapping.Subject)[language]}: {hour.Day7.Subject}</p>
						{/if}
						{#if $lessonAttributeToggleStore.show_teacher}
							<p>{dictionary.get(mapping.Teacher)[language]}: {hour.Day7.Teacher}</p>
						{/if}
					</td>
				{/if}
			</tr>
		{/each}
	</table>
	{#if selected}
		<div id="editor" role="button" on:keydown={handleAttributeInputManagerEvents} tabindex="-1" >
			{#if get_lessons_for_insertion_point('Day' + selectobject.column, selectobject.row).length !== 0}
				<div class="lessons">
					{#each get_lessons_for_insertion_point('Day' + selectobject.column, selectobject.row) as lesson}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div
							class="lesson tooltip"
							on:click={(e) => {
								if (e.ctrlKey) {
									insert_merged_lesson(lesson);
									selected = false;
									changed_loc = true;
									return;
								}
								$schedule[selectobject.row]['Day' + selectobject.column].Room = lesson.room[0];
								$schedule[selectobject.row]['Day' + selectobject.column].Subject = lesson.subject;
								$schedule[selectobject.row]['Day' + selectobject.column].Teacher = lesson.teacher;
								selected = false;
								changed_loc = true;
							}}
						>
							<span class="tooltiptext">{dictionary.get(mapping.Tooltip)[language]}</span>
							<h3>
								{dictionary.get(mapping.Course_Of)[language] + lesson.friends[0].split('#')[0]}
							</h3>
							<p>{dictionary.get(mapping.Subject)[language] + ': ' + lesson.subject}</p>
							<p>{dictionary.get(mapping.Room)[language] + ': ' + lesson.room}</p>
						</div>
					{/each}
				</div>
			{/if}
			{#if selectobject.column === 0}
				<SveltyPicker
					mode={'time'}
					placeholder="Zeit"
					bind:value={$schedule[selectobject.row].Hours}
					format={'hh:ii'}
					isRange={true}
					on:keydown={handleAttributeInputManagerEvents}
				/>
			{:else}
				{#if $lessonAttributeToggleStore.show_room}
					<input
						type="text"
						placeholder={dictionary.get(mapping.Room)[language]}
						bind:value={$schedule[selectobject.row]['Day' + selectobject.column].Room}
						on:keydown={handleAttributeInputManagerEvents}
					/>
				{/if}
				{#if $lessonAttributeToggleStore.show_subject}
					<input
						type="text"
						placeholder={dictionary.get(mapping.Subject)[language]}
						bind:value={$schedule[selectobject.row]['Day' + selectobject.column].Subject}
						on:keydown={handleAttributeInputManagerEvents}
					/>
				{/if}
				{#if $lessonAttributeToggleStore.show_teacher}
					<input
						type="text"
						placeholder={dictionary.get(mapping.Teacher)[language]}
						bind:value={$schedule[selectobject.row]['Day' + selectobject.column].Teacher}
						on:keydown={handleAttributeInputManagerEvents}
					/>
				{/if}
			{/if}
			<button
				on:click={() => {
					selected = false;
					changed_loc = true;
				}}>{dictionary.get(mapping.Save)[language]}</button
			>
		</div>
	{/if}
</div>

<style>
	.tooltip {
		position: relative;
	}

	.tooltip .tooltiptext {
		visibility: hidden;
		width: 120px;
		background-color: black;
		color: #fff;
		text-align: center;
		padding: 5px 0;
		border-radius: 6px;
		left: 105%;
		top: 30%;
		position: absolute;
		z-index: 1;
	}

	.tooltip:hover .tooltiptext {
		visibility: visible;
	}

	.tooltip .tooltiptext::after {
		content: ' ';
		position: absolute;
		top: 50%;
		right: 100%;
		margin-top: -5px;
		border-width: 5px;
		border-style: solid;
		border-color: transparent black transparent transparent;
	}

	.lessons {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		width: 90%;
		height: 16%;
		background-color: rgba(180, 184, 189, 0.932);
		border-radius: 0.5rem;
		overflow-x: auto;
		overflow-y: hidden;
	}

	.lesson {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		height: 80%;
		width: 10%;
		margin: 1rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		background-color: aliceblue;
		color: black;
		cursor: pointer;
		overflow-wrap: break-word;
	}

	.lesson h3 {
		font-size: 1rem;
		margin-block-end: 0.5em;
	}

	#editor {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1;
	}

	#editor input {
		margin: 1rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		border: none;
		outline: none;
	}

	#editor button {
		margin: 1rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		border: none;
		outline: none;
		cursor: pointer;
	}

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
		border: 1px solid var(--secondary-color);
	}
	th {
		font-size: 2rem;
		text-align: center;
	}

	th input {
		all: unset;
		width: 100%;
		height: 100%;
		font-size: 2rem;
		text-align: center;
	}
	td {
		font-size: 0.9rem;
		text-align: start;
		cursor: pointer;
	}
</style>
