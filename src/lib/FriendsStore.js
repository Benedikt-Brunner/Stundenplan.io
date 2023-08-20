// @ts-nocheck
import { get, writable } from "svelte/store";

export let friends = writable({
    friends: [{}],
    pending: [""]
});