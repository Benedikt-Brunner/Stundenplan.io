<script>
	//@ts-nocheck
	import { Language_Store, dictionary, mapping } from '$lib/Stores/LanguageStore';
	import { get } from 'svelte/store';

	let language = get(Language_Store).language;

	Language_Store.subscribe((value) => {
		language = value.language;
	});
	export let group;
    export let friends_with_no_group;
	export let styles;
	
	let search_string = '';

	$: filtered_friends = friends_with_no_group.filter((friend) => {
		return friend.username.toLowerCase().includes(search_string.toLowerCase());
	});

	function remove(friend){
		if(confirm(dictionary.get(mapping.Are_you_sure)[language])){
			group.friends = group.friends.filter((f) => {
				return f.username !== friend.username;
			});
			friends_with_no_group = [...friends_with_no_group, friend];
		}
	}

	function add(friend){
		group.friends = [...group.friends, friend];
		friends_with_no_group = friends_with_no_group.filter((f) => {
			return f.username !== friend.username;
		});
	}


</script>

<table style="border: 1px solid {group.color};">
	<tr>
		<th>
			<input
				type="text"
				bind:value={group.name}
				placeholder={dictionary.get(mapping.New_group)[language]}
				style="color: {group.color};"
				id="group_name"
			/>
		</th>
	</tr>
	{#each group.friends as friend}
		<tr>
			<td>
				<button on:click={remove(friend)}>
					{friend.username}
				</button>
			</td>
		</tr>
	{/each}
	{#if friends_with_no_group.length != 0}
	<tr>
		<td>
			<input type="text"
			id="searcher"
			placeholder={dictionary.get(mapping.Search)[language]}
			bind:value={search_string}
			>
			{#each filtered_friends as friend}
				<div>
					<button
						on:click={add(friend)}
					>
					{friend.username}
					</button>
				</div>
			{/each}
		</td>
	</tr>
	{/if}
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
		text-align: center;
		padding: 8px;
	}


	#group_name {
		width: fit-content;
		border: none;
		background-color: transparent;
		font-size: 1rem;
		font-weight: 600;
		width: 100%;
		text-align: center;
		text-decoration: underline;
	}

	#group_name::placeholder {
		color: inherit;
	}

	#searcher {
		width: 50%;
		border: none;
		background-color: transparent;
		font-size: 1rem;
		font-weight: 600;
		text-align: center;
	}

	#searcher::placeholder {
		color: inherit;
	}

	button {
		background-color: transparent;
		border: none;
		font-size: 1rem;
		font-weight: 400;
		text-align: center;
		width: 100%;
	}

	button:hover {
		cursor: pointer;
	}

</style>
