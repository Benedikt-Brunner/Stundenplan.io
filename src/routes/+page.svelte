<script>
    //@ts-nocheck
import Header from "./header.svelte";
import LightT from "./lightT.svelte";
import NightT from "./nightT.svelte";
import PinkT from "./pinkT.svelte";
import { theme } from "$lib/ThemeStore";

export let data;

let { user, tableData, supabase } = data
  $: ({ user, tableData, supabase } = data)


let t = theme;

theme.subscribe(value => {
    t = value;
})
</script>

    <Header data = {data} supabase = {supabase}/>
    
{#if t == "Light"}
    <LightT />
{:else if t == "Night"}
    <NightT />
{:else if t == "Pink"}
    <PinkT />
{/if}



