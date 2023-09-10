<script>
// @ts-nocheck
import { changed } from "$lib/changedStore";
import { get } from "svelte/store";

let state_lib = {
    not_changed: "not_changed",
    changed: "changed"
}

let state = get(changed) ? state_lib.changed : state_lib.not_changed;

changed.subscribe(value => {
    state = value ? state_lib.changed : state_lib.not_changed;
})
</script>

<div class="{state}">
{$changed ? "❌" : "✔"}
</div>

<style>
div{
    position: fixed;
    bottom: 0;
    right: 0;
    margin: 1vw;
    padding: 8px;
    border-radius: 10vw;
    font-size: 1rem;
    font-weight: bold;
    aspect-ratio: 1/1;
}

.not_changed{
    background-color: green;
    width: 1.3rem;
    text-align: center;
}

.changed{
    background-color: black;
}
</style>