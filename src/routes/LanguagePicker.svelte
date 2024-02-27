<script>
    //@ts-nocheck
    import Flag_de from "$lib/Flags/flag_de.svg"
    import Flag_en from "$lib/Flags/flag_en.svg"
    import Flag_es from "$lib/Flags/flag_es.svg"
    import { Language_Store, setLanguage, languages } from "$lib/Stores/LanguageStore";
    import { fly } from "svelte/transition";
    import { get } from "svelte/store";

    export let user;

    let focus = false;
    let img_map = new Map();

    img_map.set(languages.german, Flag_de);
    img_map.set(languages.english, Flag_en);
    img_map.set(languages.spanish, Flag_es);

    const get_params = (mul) =>
        ({
            duration: 100,
            x: `-${mul * 2}vw`,
        });
</script>

{#if focus}
<div class="language_picker">
    <button class="flag_wrap"  on:click={async () => {setLanguage(languages.german); focus = !focus; if(user){
        //TODO: implement a function that updates the language in the database
    }}}>
        <img src={Flag_de} alt="Deutsch"/>
    </button>
    <button class="flag_wrap" in:fly = {get_params(1)} on:click={async () => {setLanguage(languages.english); focus = !focus; if(user){
        //TODO: implement a function that updates the language in the database
    };}}>
        <img src={Flag_en} alt="English"/>
    </button>
    <button class="flag_wrap" in:fly = {get_params(2)} on:click={async () => {setLanguage(languages.spanish); focus = !focus; if(user){
        //TODO: implement a function that updates the language in the database
    };}}>
        <img src={Flag_es} alt="Español"/>
    </button>
</div>
{:else}
<button class = "collapsed_display" on:click={() => {focus = !focus;}}>
    <img src={img_map.get(get(Language_Store).language)} alt="Flag representing the currently selected Language">
</button>
{/if}

<style>
    .language_picker {
        display: flex;
        justify-content: space-between;
        position: fixed;
        bottom: 0;
        left: 0;
        margin: 1%;
        padding: 0%;
        width: 10%;
    }

    .collapsed_display {
        all: unset;
        position: fixed;
        bottom: 0;
        left: 0;
        margin: 1%;
        padding: 0%;
        width: 3.5rem;
        cursor: pointer;
    }

    .collapsed_display img {
        width: 100%;
    }

    .flag_wrap {
        all: unset;
        width: 3.5rem;
        cursor: pointer;
    }

    .flag_wrap img {
        width: 100%;
    }
</style>