//@ts-nocheck
import { friends } from '$lib/Stores/FriendsStore.js';
import { schedule, rows, template, fullweektoogle } from '$lib/Stores/ScheduleStore.js';
import { setLanguage, languages } from '$lib/Stores/LanguageStore.js';
import { couting_signal } from '$lib/Stores/changedStore.js';
import { theme } from '$lib/Stores/ThemeStore.js';
import { Routes, TimetableBackendApiService } from '$lib/TimetableBackendApiService';
import { buddyStore, usernameStore } from '$lib/Stores/userStore';

export const load = async () => {
	const { res, error } = await TimetableBackendApiService.get(Routes.UserData);

	if (error || res.status !== 200) {
		theme.set('Light');
		rows.set(7);
		template.set('University');
		fullweektoogle.set(false);
		setLanguage(languages.german);
		buddyStore.set('👾');

		return;
	}

	const data = await res.json();

	theme.set(data.meta.theme);
	rows.set(data.meta.rows);
	template.set(data.meta.template);
	fullweektoogle.set(data.meta.days);
	setLanguage(data.meta.language);
	schedule.set(data.schedule.schedule);
	couting_signal.update((n) => n + 1);

	friends.set(await TimetableBackendApiService.retrieveFriendsData());
	usernameStore.set(data.username);
	buddyStore.set(data.meta.buddy);
};
