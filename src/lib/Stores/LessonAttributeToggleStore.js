// @ts-nocheck
import { writable } from 'svelte/store';

export const lessonAttributeToggleStore = writable({
	show_teacher: true,
	show_room: true,
	show_subject: true
});
