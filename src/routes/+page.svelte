<script>
    //@ts-nocheck
import Header from "./header.svelte";
import Table from "./Table.svelte";
import ComparisonTable from "./comparison_Table.svelte";
import SavedStatus from "./saved_status.svelte";
import PopUp from "./PopUp.svelte";
import LanguagePicker from "./LanguagePicker.svelte";
import { theme, style_map } from "$lib/ThemeStore";
import { comparing } from "$lib/comparingStore";
import { get } from "svelte/store";

export let data;

let { user, tableData, supabase, buddy } = data
  $: ({ user, tableData, supabase, buddy } = data)


let styles = style_map.get(get(theme));

theme.subscribe(value => {
    styles = style_map.get(value);
})


</script>

    <Header data = {data} supabase = {supabase}/>
    <PopUp/>
    {#if $comparing.is_comparing}
    <ComparisonTable styles = {styles} buddy = {buddy}/>
    {:else}
    <Table styles = {styles} supabase = {supabase} user = {user} buddy = {buddy}/>
    {/if}

    {#if tableData && !$comparing.is_comparing}
    <SavedStatus/>
    {/if}
    <LanguagePicker supabase = {supabase} user = {user}/>
    
    




