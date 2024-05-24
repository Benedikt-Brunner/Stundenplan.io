<script>
	// @ts-nocheck
	import Group from './Group.svelte';
	import Social from '$lib/social.svg';
	import Add_Friend from '$lib/add-friend.svg';
	import Delete_Friend from '$lib/delete-friend.svg';
	import Manage_Friends from '$lib/friends-managment.svg';
	import Comparison from '$lib/comparison.svg';
	import Manager from '$lib/manager.svg';
	import Plus from '$lib/Plus.svg';
	import {
		filterList,
		friends,
		get_friends_with_no_group,
		get_groups
	} from '$lib/Stores/FriendsStore';
	import { comparing } from '$lib/Stores/comparingStore';
	import { show_error, show_success } from '$lib/Stores/PopUpStore';
	import { dictionary, languageStore, mapping } from '$lib/Stores/LanguageStore';
	import { get } from 'svelte/store';
	import { Routes, TimetableBackendApiService } from '$lib/TimetableBackendApiService';
	import { usernameStore } from '$lib/Stores/userStore';

	export let styles;

	let friend_manager_states = {
		not_decided: 0,
		add_friend: 1,
		delete_friend: 2
	};
	let friend_manager_state = friend_manager_states.not_decided;
	let focus = false;
	let wait = false;
	let friend_manager_selected = false;
	let group_manager_selected = false;
	let friend_name = '';
	let friendsdyn = get(friends).friends;
	let requestdyn = get(friends).pending;
	let username = get(usernameStore);
	let groups = get_groups();
	let friends_with_no_group = get_friends_with_no_group();
	let language = get(languageStore).language;
	let group_collapse_arr = groups.map(() => false);

	languageStore.subscribe((value) => {
		language = value.language;
	});

	usernameStore.subscribe((value) => {
		username = value;
	});

	friends.subscribe((value) => {
		Promise.resolve(value).then((value) => {
			friendsdyn = Array.isArray(value.friends) ? value.friends : [];
			requestdyn = Array.isArray(value.pending) ? value.pending : [];
		});

		groups = get_groups();
		group_collapse_arr = groups.map((_, i) =>
			i < group_collapse_arr.length ? group_collapse_arr[i] : false
		);
		friends_with_no_group = get_friends_with_no_group();
	});

	function persist() {
		groups = groups.filter((group) => group.friends.length !== 0);
		let counter = 1;
		for (let group in groups) {
			if (group.name === '') {
				group.name = `Group ${counter}`;
				counter++;
			}
		}
		groups.forEach((group) => {
			persist_group(group);
		});
		friends_with_no_group.forEach((friend) => {
			persist_non_group_members(friend);
		});
	}

	function persist_group(group) {
		group.friends.forEach(async (friend) => {
			if (group.name !== get_from_friends(friend).group) {
				// eslint-disable-next-line no-unused-vars
				const { _, error } = await TimetableBackendApiService.post(Routes.AddGroup, {
					friend: friend.username,
					personal_grouping: group.name
				});

				if (error) {
					show_error(error.message);
				}
			}
		});
	}

	async function persist_non_group_members(friend) {
		if (get_from_friends(friend).group !== null) {
			// eslint-disable-next-line no-unused-vars
			const { _, error } = await TimetableBackendApiService.post(Routes.RemoveGroup, {
				friend_name: friend.username
			});

			if (error) {
				show_error(error.message);
			}
		}
	}

	function get_from_friends(friend) {
		let res = friendsdyn.filter((f) => {
			return f.username === friend.username;
		});
		return res[0];
	}

	const handleSignUp = async () => {
		TimetableBackendApiService.redirect(Routes.SignUp);
	};

	const handleSignIn = async () => {
		TimetableBackendApiService.redirect(Routes.SignIn);
	};

	const handleSignOut = async () => {
		TimetableBackendApiService.redirect(Routes.SignOut);
	};

	const handleAddFriend = async (friend_name) => {
		if (friend_name === username) {
			show_error(dictionary.get(mapping.You_Cant_Add_Yourself)[language]);
			friend_manager_state = friend_manager_states.not_decided;
			friend_manager_selected = false;
			focus = true;
			return;
		}

		if (
			get(friends)
				.friends.map((friend) => friend.username)
				.includes(friend_name)
		) {
			show_error(`${friend_name} ${dictionary.get(mapping.Is_Already_Your_Friend)[language]}`);
			friend_manager_state = friend_manager_states.not_decided;
			friend_manager_selected = false;
			focus = true;
			return;
		}
		friend_manager_state = friend_manager_states.not_decided;
		friend_manager_selected = false;
		focus = true;

		const { res, error } = await TimetableBackendApiService.post(Routes.OpenFriendRequest, {
			friend_name
		});

		if (error) {
			show_error(error.message);
		} else {
			if (res.status !== 200) {
				show_error(
					`${friend_name === '' ? dictionary.get(mapping.Nobody)[language] : friend_name} ${
						dictionary.get(mapping.Doesnt_Exist)[language]
					}`
				);
			} else {
				friends.set(await TimetableBackendApiService.retrieveFriendsData());
				show_success(
					`${friend_name} ${dictionary.get(mapping.Has_Received_Your_Request)[language]}`
				);
			}
		}
	};

	const handleRemoveFriend = async (friend_name) => {
		if (friend_name === username) {
			show_error(dictionary.get(mapping.You_Cant_Delete_Yourself)[language]);
			return;
		}

		// eslint-disable-next-line no-unused-vars
		const { _, error } = await TimetableBackendApiService.post(Routes.RemoveFriend, {
			friend_name
		});

		if (error) {
			show_error(error.message);
		} else {
			friends.set(await TimetableBackendApiService.retrieveFriendsData());
			show_success(`${friend_name} ${dictionary.get(mapping.Was_Deleted)[language]}`);
		}
	};

	const handleFriendRequestDeny = async (friend_name) => {
		// eslint-disable-next-line no-unused-vars
		const { _, error } = await TimetableBackendApiService.post(Routes.DenyFriendRequest, {
			friend_name
		});

		if (error) {
			show_error(error.message);
		} else {
			friends.set(await TimetableBackendApiService.retrieveFriendsData());
		}
	};

	const handleFriendRequestAccept = async (friend_name) => {
		// eslint-disable-next-line no-unused-vars
		const { _, error } = await TimetableBackendApiService.post(Routes.AcceptFriendRequest, {
			friend_name
		});

		if (error) {
			show_error(error.message);
		} else {
			friends.set(await TimetableBackendApiService.retrieveFriendsData());
		}
	};

	function waiter() {
		wait = true;
		setTimeout(() => {
			wait = false;
		}, 100);
	}

	function toogle_friend(friend) {
		if (get(filterList).includes(friend.username)) {
			filterList.update((value) => {
				return value.filter((item) => item !== friend.username);
			});
		} else {
			filterList.update((value) => {
				value.push(friend.username);
				return value;
			});
		}
	}

	/**
	 * check if list1 is a sublist of list2
	 * @param list1 potentially sublist
	 * @param list2 potentially superlist
	 */
	function isSublist(list1, list2) {
		let res = true;
		list1.forEach((item) => {
			if (!list2.includes(item)) {
				res = false;
			}
		});
		return res;
	}

	function show_comparison(friend) {
		if (get(comparing).friend.username && friend.username === get(comparing).friend.username) {
			comparing.set({
				is_comparing: false,
				friend: {}
			});
			return;
		}
		comparing.set({
			is_comparing: true,
			friend: friend
		});
	}

	function show_group_comparison(group) {
		if (Array.isArray(get(comparing).friend) && isSublist(group.friends, get(comparing).friend)) {
			comparing.set({
				is_comparing: false,
				friend: {}
			});
			return;
		}
		comparing.set({
			is_comparing: true,
			friend: group.friends
		});
	}

	function add_group() {
		let colors = [
			'#1446A0',
			'#DB3069',
			'#312509',
			'#16324F',
			'#6EEB83',
			'#1BE7FF',
			'#E8AA14',
			'#BA7BA1',
			'#B4ADEA',
			'#621B00'
		];
		let newobj = {
			name: '',
			color: colors[groups.length % colors.length],
			friends: []
		};
		groups = [...groups, newobj];
	}

	function toogle_group(i) {
		return () => {
			group_collapse_arr[i] = !group_collapse_arr[i];
		};
	}
</script>

<svelte:window on:beforeunload={persist} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={focus ? 'social' : 'socialcollapse'}
	on:click={() => {
		if (!focus && !wait) {
			focus = true;
		}
	}}
>
	{#if focus}
		<div class="top-row">
			{#if username}
				<button id="sOut" on:click={handleSignOut}
					>{dictionary.get(mapping.Sign_Out)[language]}</button
				>
			{:else}
				<div />
			{/if}
			<button
				id="exit"
				on:click={() => {
					waiter();
					focus = false;
				}}
				style="--color: 0,0,0; border-radius: 50rem;">❌</button
			>
		</div>
		<div class="center">
			{#if !username}
				<div class="deciders">
					<button on:click={handleSignIn}>{dictionary.get(mapping.Sign_In)[language]}</button>
					<button on:click={handleSignUp}>{dictionary.get(mapping.Sign_Up)[language]}</button>
				</div>
			{/if}
		</div>
		{#if username}
			<div class="center">
				<div class="wrap">
					<button
						on:click={() => {
							if (!friend_manager_selected) {
								group_manager_selected = true;
								focus = false;
								waiter();
							}
						}}
					>
						<img src={Manager} alt="Manage your friend groupings" />
					</button>
					<h3>{dictionary.get(mapping.Friends)[language]}</h3>
					<button
						on:click={() => {
							if (!group_manager_selected) {
								(friend_manager_selected = true), (focus = false);
								waiter();
							}
						}}><img src={Manage_Friends} alt="Add a friend" /></button
					>
				</div>
				<div class="list">
					{#if groups}
						{#each groups as group, i}
							<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
							<div class="group_button_wrapper">
								{#if !group_collapse_arr[i]}
									<div
										class="comparison-box"
										style="background-color: {group.color};"
										on:click={() => {
											show_group_comparison(group);
										}}
									>
										<img src={Comparison} alt="compare the players" />
									</div>
								{/if}
								<button
									class="deez_buttons"
									style="color: {group.color};"
									on:click={toogle_group(i)}
								>
									{group_collapse_arr[i] ? `${group.name}` : `------${group.name}------`}
								</button>
								{#if !group_collapse_arr[i]}
									<div id="filler" />
								{/if}
							</div>
							{#if !group_collapse_arr[i]}
								{#each group.friends as friend}
									<div class="item">
										<!-- svelte-ignore a11y-click-events-have-key-events -->
										<!-- svelte-ignore a11y-no-static-element-interactions -->
										<div
											class="comparison-box"
											on:click={() => {
												show_comparison(friend);
											}}
										>
											<img src={Comparison} alt="compare the players" />
										</div>
										<p>{friend.username}</p>
										<input
											type="checkbox"
											checked={!get(filterList).includes(friend.username)}
											on:click={() => {
												toogle_friend(friend);
											}}
										/>
									</div>
								{/each}
							{/if}
						{/each}
					{/if}
					{#if friends_with_no_group.length !== 0 && groups.length !== 0}
						<h4 id="request_title">{dictionary.get(mapping.Friends_Without_Group)[language]}:</h4>
					{/if}
					{#each friends_with_no_group as friend}
						<div class="item">
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<div
								class="comparison-box"
								on:click={() => {
									show_comparison(friend);
								}}
							>
								<img src={Comparison} alt="compare the players" />
							</div>
							<p>{friend.username}</p>
							<input
								type="checkbox"
								checked={!$filterList.includes(friend.username)}
								on:click={() => {
									toogle_friend(friend);
								}}
							/>
						</div>
					{/each}
					{#if requestdyn.length !== 0}
						<h4 id="request_title">{dictionary.get(mapping.Requests)[language]}:</h4>
					{/if}
					{#each requestdyn as request}
						<div class="request">
							<button class="accept" on:click={handleFriendRequestAccept(request)}>✔</button>
							<button class="deny" on:click={handleFriendRequestDeny(request)}>❌</button>
							<p>{request}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<img src={Social} alt="Social" />
	{/if}
</div>

{#if friend_manager_selected}
	{#if friend_manager_state === friend_manager_states.not_decided}
		<div class="add_or_remove">
			<button
				class="tooltip"
				on:click={() => {
					friend_manager_state = friend_manager_states.add_friend;
				}}
			>
				<img src={Add_Friend} alt="Add Friend" />
				<span class="tooltiptext">{dictionary.get(mapping.Add_Friend)[language]}</span>
			</button>
			<button
				class="tooltip"
				on:click={() => {
					friend_manager_state = friend_manager_states.delete_friend;
				}}
			>
				<img src={Delete_Friend} alt="Delete Friend" />
				<span class="tooltiptext">{dictionary.get(mapping.Delete_Friend)[language]}</span>
			</button>
		</div>
	{:else if friend_manager_state === friend_manager_states.add_friend}
		<div class="editor">
			<input
				type="text"
				placeholder={dictionary.get(mapping.Name)[language]}
				bind:value={friend_name}
			/>
			<button on:click={handleAddFriend(friend_name)}
				>{dictionary.get(mapping.Add)[language]}</button
			>
		</div>
	{:else if friend_manager_state === friend_manager_states.delete_friend}
		<div class="editor">
			<div class="manager">
				<div class="manager_header">
					<div />
					<div />
					<button
						on:click={() => {
							friend_manager_state = friend_manager_states.not_decided;
							friend_manager_selected = false;
							focus = true;
						}}
						style="--color: 0,0,0; border-radius: 50rem;"
					>
						❌
					</button>
				</div>
				<div class="group_display">
					{#each friendsdyn as friend}
						<div class="item" id="friend_to_be_removed">
							<p>{friend.username}</p>
							<button on:click={handleRemoveFriend(friend.username)}
								>{dictionary.get(mapping.Delete)[language]}</button
							>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
{/if}

{#if group_manager_selected}
	<div class="editor">
		<div class="manager">
			<div class="manager_header">
				<div />
				<h3>{dictionary.get(mapping.Groups)[language]}</h3>
				<button
					on:click={() => {
						persist();
						group_manager_selected = false;
						focus = true;
					}}
					style="--color: 0,0,0; border-radius: 50rem;">❌</button
				>
			</div>
			<div class="group_display">
				{#each groups as group}
					<Group bind:group bind:friends_with_no_group {styles} />
				{/each}
				<button id="new_group" on:click={add_group}>
					<img src={Plus} alt="Add a new group" />
				</button>
			</div>
			<span>{dictionary.get(mapping.Empty_Groups_Will_Be_Removed)[language]}</span>
		</div>
	</div>
{/if}

<style>
	.deciders {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.deciders button {
		border: none;
		border-radius: 50px;
		padding: 0.2rem;
		cursor: pointer;
		transition: 0.5s;
		margin-top: 1%;
		margin-inline: 7%;
	}
	#new_group {
		width: 8%;
		border-radius: 10vw;
		cursor: pointer;
		border: 1px solid black;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 5%;
		margin-left: 5%;
	}

	#new_group > img {
		width: 100%;
		height: 100%;
	}
	.group_display {
		padding: 2%;
		width: 80%;
		height: 70%;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: flex-start;
		flex-wrap: wrap;
		background-color: rgba(135, 138, 141);
		border-radius: 50px;
		overflow-y: scroll;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.group_display::-webkit-scrollbar {
		display: none;
	}

	.manager {
		width: 60%;
		height: 60%;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 10px;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-direction: column;
	}

	.manager span {
		color: white;
		margin: 0;
		margin-top: 2%;
	}

	.manager_header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.manager_header h3 {
		margin: 0;
		color: white;
		margin-left: 10%;
		text-decoration: underline;
		font-size: 1.5rem;
	}
	.comparison-box {
		width: 8%;
		padding: 1%;
		border-radius: 10vw;
		background-color: bisque;
		cursor: pointer;
		border: 1px solid black;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.comparison-box > img {
		width: 100%;
		height: 100%;
	}
	.item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 90%;
		margin-left: 5%;
	}

	.request {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 90%;
		padding-inline: 5%;
	}

	.request p {
		margin: 0;
		margin-left: 4%;
	}

	.request button {
		border: none;
		border-radius: 50px;
		padding: 0.2rem;
		cursor: pointer;
		transition: 0.5s;
		margin-top: 1%;
		aspect-ratio: 1/1;
		width: 2rem;
		margin-inline: 1%;
	}

	.deny {
		border: none;
		border-radius: 50px;
		padding: 0.2rem;
		cursor: pointer;
		transition: 0.5s;
		margin-top: 1%;
		background-color: rgba(209, 30, 30, 0.733);
		font-weight: bold;
	}

	.accept {
		border: none;
		border-radius: 50px;
		padding: 0.2rem;
		cursor: pointer;
		transition: 0.5s;
		margin-top: 1%;
		background-color: rgba(30, 209, 30, 0.733);
		font-weight: bold;
	}

	.editor {
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

	.editor input {
		margin: 1rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		border: none;
		outline: none;
	}

	.editor button {
		margin: 1rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		border: none;
		outline: none;
		cursor: pointer;
	}

	.socialcollapse {
		height: 2.5rem;
		aspect-ratio: 1/1;
		cursor: pointer;
		border: 1px solid black;
		background-image: radial-gradient(
			circle,
			rgb(194, 236, 78) 0%,
			rgb(231, 83, 83) 50%,
			rgb(150, 130, 42) 100%
		);
		border-radius: 50%;
		padding: 2px;
		margin-left: 1%;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 1rem;
	}

	.socialcollapse img {
		height: 80%;
		aspect-ratio: 1/1;
	}

	.social {
		width: 15rem;
		height: fit-content;
		background-color: rgb(214, 212, 212);
		border-radius: 1rem;
		margin-left: 1%;
		padding-bottom: 1%;
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: space-between;
	}

	#exit {
		background-color: rgba(var(--color));
		border: none;
		border-radius: 5px;
		padding: 0.5rem;
		cursor: pointer;
		transition: 0.5s;
		margin-top: 1%;
		z-index: 14;
		align-self: flex-end;
	}

	.top-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2%;
	}

	.center {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	#sOut {
		border: none;
		border-radius: 5px;
		padding: 0.3rem;
		cursor: pointer;
		transition: 0.5s;
		background-color: rgba(209, 30, 30, 0.733);
		font-style: italic;
		font-weight: bold;
	}

	.wrap {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 95%;
		margin-bottom: 3%;
	}

	.wrap h3 {
		margin: 0;
	}

	.wrap button {
		border: none;
		border-radius: 50px;
		padding-inline: 0.3rem;
		padding-block: 0.2rem;
		cursor: pointer;
		transition: 0.5s;
		margin-top: 1%;
	}

	.wrap button img {
		height: 1.5rem;
		aspect-ratio: 1/1;
	}

	.group_button_wrapper {
		display: flex;
		justify-content: space-between;
	}
	.deez_buttons {
		all: unset;
		margin: 0;
		width: 100%;
		text-align: center;
		font-weight: bold;
		cursor: pointer;
	}

	#filler {
		width: 20%;
	}

	.group_button_wrapper .comparison-box {
		width: 9%;
		padding: 1%;
		border-radius: 10vw;
		cursor: pointer;
		border: 1px solid black;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: 12%;
	}

	.add_or_remove {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: row;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1;
	}

	.add_or_remove button {
		margin: 5rem;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border: none;
		outline: none;
		cursor: pointer;
		font-size: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.add_or_remove button img {
		height: 3rem;
		aspect-ratio: 1/1;
		margin: 5%;
	}

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

	#friend_to_be_removed {
		justify-content: center;
	}

	#request_title {
		width: 100%;
		text-align: center;
		margin: 0;
	}
</style>
