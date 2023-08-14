<script>
    import Git from "$lib/github.svg"
    import Options from "./Options.svelte";
    import Profile from "./Profile.svelte";
</script>


<nav>
    <h2>Stundenplan.io</h2>
    <Options />
    <a href="https://github.com/Benedikt-Brunner/Timetable"><img src={Git} alt="Github Logo" width="40vw" style="margin: 4%;"></a>
    <Profile />
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
</style>