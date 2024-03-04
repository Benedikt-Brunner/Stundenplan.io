<script>
// @ts-nocheck
import { changed } from "$lib/Stores/changedStore";
import { get } from "svelte/store";
import { usernameStore } from "$lib/Stores/userStore";

let state_lib = {
    not_changed: "not_changed",
    changed: "changed"
}

let username = get(usernameStore);
let state = get(changed) ? state_lib.changed : state_lib.not_changed;

usernameStore.subscribe(value => {
    username = value;
})

changed.subscribe(value => {
    state = value ? state_lib.changed : state_lib.not_changed;
})
</script>

{#if username}
    <div class="{state}">
        {$changed ? "❌" : "✔"}
    </div>
{/if}

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