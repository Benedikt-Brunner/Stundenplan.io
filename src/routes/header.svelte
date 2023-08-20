<script>
// @ts-nocheck

    import Git from "$lib/github.svg"
    import Options from "./Options.svelte";
    import Social from "./Social.svelte";

    export let data;
    export let supabase;

    let { user, tableData } = data
    $: ({ user, tableData } = data)
</script>


<nav>
    <h2>Stundenplan.io</h2>
    <h3>Hallo, {#if tableData}{tableData[0].name.split('#')[0]} <span>#{tableData[0].name.split('#')[1]}</span>{:else} Guest {/if}</h3>
    <Options />
    <Social data = {data} supabase = {supabase}/>
    <a href="https://github.com/Benedikt-Brunner/Timetable"><img src={Git} alt="Github Logo" width="40vw" style="margin: 4%;"></a>
</nav>


<style>
nav{
    display: flex;
    justify-content: end;
    align-items: center;
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
}

nav h2{
    margin-right: auto;
}

nav h3{
    margin-right: auto;
    margin-left: 1%;
}

nav h3 span{
    color: rgba(85, 83, 83, 0.61);
}
</style>