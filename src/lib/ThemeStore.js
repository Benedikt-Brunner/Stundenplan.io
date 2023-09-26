import { writable } from "svelte/store";
import { set_theme } from "$lib/MetadataStore";
import lightstyles from "./lightstyles";

export const theme = writable("Light");

export let style_map = new Map();
style_map.set("Light", lightstyles);
style_map.set("Night", lightstyles);
style_map.set("Pink", lightstyles);

theme.subscribe((value) => {
    set_theme(value);
});