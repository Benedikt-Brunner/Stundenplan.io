<script>
    //@ts-nocheck
import Header from "./header.svelte";
import Table from "./Table.svelte";
import ComparisonTable from "./comparison_Table.svelte";
import SavedStatus from "./saved_status.svelte";
import PopUp from "./PopUp.svelte";
import LanguagePicker from "./LanguagePicker.svelte";
import { load } from "./loadPageData";
import { schedule, rows, template, fullweektoogle } from '$lib/Stores/ScheduleStore.js'
import { Language_Store } from '$lib/Stores/LanguageStore.js'
import { theme, style_map } from "$lib/Stores/ThemeStore";
import { comparing } from "$lib/Stores/comparingStore";
import { get } from "svelte/store";
import { onMount } from "svelte";

let data = {buddy: "👾"};

onMount(async () => {
    data = await load();
});

let { user, buddy } = data
  $: ({ user, buddy } = data)

//TODO: implements themes in the rest of the app
let styles = style_map.get(get(theme));

theme.subscribe(value => {
    styles = style_map.get(value);
})

async function test() {
    let options ={
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "buddy": buddy,
            "rows": get(rows),
            "days": get(fullweektoogle),
            "theme": get(theme),
            "template": get(template),
            "language": get(Language_Store).language,
        })
    };
    await fetch('https://timetablebackend.shuttleapp.rs/setUserMetaData', options).then(res => console.log(res.status));
}

$: set_buddy(buddy)

async function set_buddy(e){
    if(user){
        const { data, error } = await supabase.from('meta').update({ buddy: buddy }).eq( 'user_id', user.id ).select();
    }
}
</script>
    <button on:click={test}> Test </button>
    <Header user = {user} styles = {styles}/>
    <PopUp/>
    {#if $comparing.is_comparing}
    <ComparisonTable styles = {styles} bind:buddy = {buddy}/>
    {:else}
    <Table styles = {styles} user = {user} bind:buddy = {buddy}/>
    {/if}

    {#if !$comparing.is_comparing}
    <SavedStatus/>
    {/if}
    <LanguagePicker user = {user}/>
    