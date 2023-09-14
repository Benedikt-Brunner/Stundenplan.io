<script>
    //@ts-nocheck
import Header from "./header.svelte";
import Table from "./Table.svelte";
import ComparisonTable from "./comparison_Table.svelte";
import SavedStatus from "./saved_status.svelte";
import lightstyles from "./lightstyles";
import PopUp from "./PopUp.svelte";
import { theme } from "$lib/ThemeStore";
import { comparing } from "$lib/comparingStore";

export let data;

let { user, tableData, supabase } = data
  $: ({ user, tableData, supabase } = data)


let styles = lightstyles;
</script>

    <Header data = {data} supabase = {supabase}/>
    <PopUp/>
    {#if $comparing.is_comparing}
    <ComparisonTable styles = {styles}/>
    {:else}
    <Table styles = {styles} supabase = {supabase} user = {user}/>
    {/if}

    {#if tableData && !$comparing.is_comparing}
    <SavedStatus/>
    {/if}
    




