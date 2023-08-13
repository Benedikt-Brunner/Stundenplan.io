<script>
    //@ts-nocheck
import Header from "./header.svelte";
import LightT from "./lightT.svelte";
import NightT from "./nightT.svelte";
import PinkT from "./pinkT.svelte";
import { theme } from "$lib/ThemeStore";


let t = theme;

theme.subscribe(value => {
    t = value;
})
</script>

    <Header />

{#if t == "Light"}
    <LightT />
{:else if t == "Night"}
    <NightT />
{:else if t == "Pink"}
    <PinkT />
{/if}



<style>

</style>