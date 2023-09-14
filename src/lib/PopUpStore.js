//@ts-nocheck
import { writable, get } from "svelte/store";

export const states = {
    none: 0,
    success: 1,
    error: 2
}

export const PopUpStore = writable({
    state: 0,
    msg: ''
});


export function show_success(msg) {
    PopUpStore.set({
        state: states.success,
        msg: msg
    });
}

export function show_error(msg) {
    PopUpStore.set({
        state: states.error,
        msg: msg
    });
}