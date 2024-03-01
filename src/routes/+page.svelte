<script>
    //@ts-nocheck
    import Header from "./header.svelte";
    import Table from "./Table.svelte";
    import ComparisonTable from "./comparison_Table.svelte";
    import SavedStatus from "./saved_status.svelte";
    import PopUp from "./PopUp.svelte";
    import LanguagePicker from "./LanguagePicker.svelte";
    import { load } from "./loadPageData";
    import { theme, style_map } from "$lib/Stores/ThemeStore";
    import { comparing } from "$lib/Stores/comparingStore";
    import { get } from "svelte/store";
    import { onMount } from "svelte";

    onMount(async () => {
        await load();
    });

    //TODO: implements themes in the rest of the app
    let styles = style_map.get(get(theme));

    theme.subscribe(value => {
        styles = style_map.get(value);
    })
</script>

<Header styles = {styles}/>
<PopUp/>
{#if $comparing.is_comparing}
<ComparisonTable styles = {styles}}/>
{:else}
<Table styles = {styles}/>
{/if}

{#if !$comparing.is_comparing}
<SavedStatus/>
{/if}
<LanguagePicker />
    