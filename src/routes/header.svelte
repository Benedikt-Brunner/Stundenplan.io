<script>
// @ts-nocheck

    import Git from "$lib/github.svg"
    import Options from "./Options.svelte";
    import Social from "./Social.svelte";
    import { usernameStore } from "$lib/Stores/userStore";
    import { Language_Store, dictionary, mapping } from "$lib/Stores/LanguageStore";
    import { comparing } from "$lib/Stores/comparingStore";
    import { get } from "svelte/store";

    export let styles;

    let language = get(Language_Store).language;
    let username = get(usernameStore);

    Language_Store.subscribe(value => {
        language = value.language;
    })

    usernameStore.subscribe(value => {
        username = value;
    })
</script>


<nav>
    <h2>Stundenplan.io</h2>
    <h3>{dictionary.get(mapping.Greeting)[language]}, {#if username}{username}{:else} Guest {/if}</h3>
    {#if !$comparing.is_comparing}
    <Options styles = {styles}/>
    {/if}
    <Social styles = {styles}/>
    <a href="https://github.com/Benedikt-Brunner/Timetable"><img src={Git} alt="Github Logo" width="40vw" style="margin: 4%;"></a>
</nav>


<style>
nav{
    display: flex;
    justify-content: end;
    align-items: start;
    padding: 0 1rem;
    background-color: var(--background);
    color: var(--text);
    height: 5rem;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.2);
    position: relative;
    top: 0;
    z-index: 12;
}

nav a{
    margin-left: 1%;
    margin-top: 1rem;
}

nav h2{
    margin-right: auto;
}

nav h3{
    position: absolute;
    left: 45%;
    margin-top: 1.5rem;
}

nav h3 span{
    color: rgba(85, 83, 83, 0.61);
}
</style>