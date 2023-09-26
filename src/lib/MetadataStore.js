//@ts-nocheck
import { get, writable } from "svelte/store";

export let metadata = writable({
    buddy: "👾",
    rows: 7,
    days: false,
    theme: "Light",
    template: "University"
});

export let meta_has_changed = writable(false);

metadata.subscribe((value) => {
    meta_has_changed.set(true);
});

export function get_buddy(){
    return get(metadata).buddy;
}

export function get_rows(){
    return get(metadata).rows;
}

export function get_days(){
    return get(metadata).days;
}

export function get_theme(){
    return get(metadata).theme;
}

export function get_template(){
    return get(metadata).template;
}

export function get_metadata(){
    return {buddy: (get(metadata).buddy), rows: (get(metadata).rows), days: (get(metadata).days), theme: (get(metadata).theme), template: (get(metadata).template)};
} 

export function set_buddy(buddy){
    metadata.update((value) => {value.buddy = buddy; return value});
}

export function set_rows(rows){
    metadata.update((value) => {value.rows = rows; return value});
}

export function set_days(days){
    metadata.update((value) => {value.days = days; return value});
}

export function set_theme(theme){
    metadata.update((value) => {value.theme = theme; return value});
}

export function set_template(template){
    metadata.update((value) => {value.template = template; return value});
}

export function set_metadata(buddy, rows, days, theme, template){
    metadata.update((value) => {value.buddy = buddy; value.rows = rows; value.days = days; value.theme = theme; value.template = template; return value});
}