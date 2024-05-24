//@ts-nocheck
import { get as getStore } from 'svelte/store';
import { buddyStore } from './Stores/userStore';
import {
	rows as rowsStore,
	fullweektoogle as fullweektoogleStore,
	template as templateStore
} from './Stores/ScheduleStore';
import { theme as themeStore } from './Stores/ThemeStore';
import { dictionary, languageStore, mapping } from './Stores/LanguageStore';
import { show_error } from './Stores/PopUpStore';

const API_URL = '/api/';

export const Routes = {
	SignUp: 'userSignUp',
	SignIn: 'userSignIn',
	SignOut: 'userSignOut',
	UserData: 'userInfo',
	UpdateMetadata: 'setUserMetadata',
	UpdateSchedule: 'setUserSchedule',
	GetFriends: 'userFriends',
	GetFriendRequests: 'userFriendRequests',
	OpenFriendRequest: 'openFriendRequest',
	AcceptFriendRequest: 'acceptFriendRequest',
	DenyFriendRequest: 'denyFriendRequest',
	RemoveFriend: 'removeFriend',
	AddGroup: 'addGroup',
	RemoveGroup: 'removeGroup',
	Styles: 'styles'
};

export const TimetableBackendApiService = {
	async get(page) {
		let res;
		let error;
		try {
			res = await fetch(API_URL + page, {
				method: 'GET',
				credentials: 'include'
			});
		} catch (e) {
			error = e;
		}

		return { res, error };
	},

	async post(page, data) {
		let res;
		let error;
		try {
			res = await fetch(API_URL + page, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
		} catch (e) {
			error = e;
		}

		return { res, error };
	},

	async put(page, data) {
		let res;
		let error;
		try {
			res = await fetch(API_URL + page, {
				method: 'PUT',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
		} catch (e) {
			error = e;
		}

		return { res, error };
	},

	redirect(page) {
		window.location.href = API_URL + page;
	},

	async updateMetadata({ buddy, rows, fullweektoogle, theme, template, language }) {
		return await this.post(Routes.UpdateMetadata, {
			buddy: buddy ?? getStore(buddyStore),
			rows: rows ?? getStore(rowsStore),
			days: fullweektoogle ?? getStore(fullweektoogleStore),
			theme: theme ?? getStore(themeStore),
			template: template ?? getStore(templateStore),
			language: language ?? getStore(languageStore)?.language ?? 'de'
		});
	},

	async retrieveFriendsData() {
		const { res: friendsResponse, error: friendsError } = await this.get(Routes.GetFriends);
		const { res: pendingResponse, error: pendingError } = await this.get(Routes.GetFriendRequests);

		if (
			friendsError ||
			pendingError ||
			friendsResponse?.status !== 200 ||
			pendingResponse?.status !== 200
		) {
			show_error(
				`${dictionary.get(mapping.Retrieve_Friends_Data_Failed)}${friendsError?.message || pendingError?.message}`
			);

			return { friends: [], pending: [] };
		}

		const friends = await friendsResponse.json();
		const pending = await pendingResponse.json();

		return { friends, pending };
	},

	async getStyle(style) {
		let query = {
			style
		};

		return this.post(Routes.Styles, query);
	}
};
