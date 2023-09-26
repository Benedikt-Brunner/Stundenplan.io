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
  $: ({ user, tableData, supabase } = data)


let styles = style_map.get(get(theme));

theme.subscribe(value => {
    styles = style_map.get(value);
})

$: set_buddy(buddy)

async function set_buddy(e){
    if(user){
        const { data, error } = await supabase.from('meta').update({ buddy: buddy }).eq( 'user_id', user.id ).select();
    }
}
</script>

    <Header data = {data} supabase = {supabase}/>
    <PopUp/>
    {#if $comparing.is_comparing}
    <ComparisonTable styles = {styles} bind:buddy = {buddy}/>
    {:else}
    <Table styles = {styles} supabase = {supabase} user = {user} bind:buddy = {buddy}/>
    {/if}

    {#if tableData && !$comparing.is_comparing}
    <SavedStatus/>
    {/if}
    <LanguagePicker supabase = {supabase} user = {user}/>
    
    




