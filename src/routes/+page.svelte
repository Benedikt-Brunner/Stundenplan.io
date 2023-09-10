<script>
    //@ts-nocheck
import Header from "./header.svelte";
import Table from "./Table.svelte";
import SavedStatus from "./saved_status.svelte";
import lightstyles from "./lightstyles";
import { theme } from "$lib/ThemeStore";

export let data;

let { user, tableData, supabase } = data
  $: ({ user, tableData, supabase } = data)


let styles = lightstyles;
</script>

    <Header data = {data} supabase = {supabase}/>

    <Table styles = {styles} supabase = {supabase} user = {user}/>

    <SavedStatus/>
    




