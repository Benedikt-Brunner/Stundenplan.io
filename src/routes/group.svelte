<script>
	//@ts-nocheck
	import { Language_Store, dictionary, mapping } from '$lib/LanguageStore';
    import { get } from 'svelte/store';

	let language = get(Language_Store).language;

	Language_Store.subscribe((value) => {
		language = value.language;
	});

	export let group;
    //TODO: add a way to add / remove friends from a group, delete a group and persist changes
</script>

<table style="border: 1px dotted {group.color};">
	<tr>
		<th>
			<input
				type="text"
				bind:value={group.name}
				placeholder={dictionary.get(mapping.New_group)[language]}
				style="color: {group.color};"
			/>
		</th>
	</tr>
	{#each group.friends as user}
		<tr>
			<td>
				<span>{user.name}</span>
			</td>
		</tr>
	{/each}
</table>

<style>
	table {
		border-collapse: collapse;
		margin-top: 5%;
		margin-left: 5%;
		width: 20%;
	}

	th,
	td {
		text-align: left;
		padding: 8px;
	}

	tr:nth-child(even) {
		background-color: #f2f2f2;
	}

	input {
		width: fit-content;
		border: none;
		background-color: transparent;
		font-size: 1rem;
		font-weight: 600;
		width: 100%;
		text-align: center;
	}

	input::placeholder {
		color: inherit;
	}
</style>
