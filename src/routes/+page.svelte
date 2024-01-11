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
import { onMount } from 'svelte';

export let data;

onMount(async () => {
    const randonNum = Math.floor(Math.random() * 1000000000);
    const requestOptions = {
    method: 'POST',
    crossDomain: true,
    xhrFields: { withCredentials: true },
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `test${randonNum}`, password: 'test123' })
};
fetch('https://timetablebackend.shuttleapp.rs/userSignUp', requestOptions);
});

let { user, tableData, supabase, buddy } = data
  $: ({ user, tableData, supabase } = data)

//TODO: implements themes in the rest of the app
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

    <Header data = {data} supabase = {supabase} styles = {styles}/>
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
    
    




