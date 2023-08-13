<script>
    //@ts-nocheck
    import { theme } from "$lib/ThemeStore";
	import { fade } from "svelte/transition";

    let themes = [
        "Light",
        "Night",
        "Pink",
    ]

    let DarkText = [
        "Light"
    ]

    /**
     * @type {Map<String, String>}
    */
    let colormap = new Map();

    colormap.set("Light", "255, 255, 255")
    colormap.set("Night", "12, 16, 70")
    colormap.set("Pink", "255, 0, 255")

    let focus = false;
    let colorRGB = "";
    let color = "";
    theme.subscribe(value => {
        color = value;
        colorRGB = colormap.get(value);
    })
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="circle" style="--theme-color: {colorRGB}"  on:click={() =>{focus = !focus;}}>

</div>
<!-- TODO: maybe refactor so select is a popup centered on screen  --> 
{#if focus}
<div class = "buttons" style="--theme-color: {colorRGB}" in:fade out:fade>
    {#each themes as t}
    {#if t != color}
    <button style="--Bcolor: {colormap.get(t)}; --Tcolor: {DarkText.includes(t) ? "black" : "white"}"  on:click={() =>{theme.set(t); focus = !focus;}}>
       {t}
    </button>
    {/if}
{/each}
</div>
{/if}






<style>


.buttons{
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0px 0px 48px 50rem rgba(0,0,0,0.78);
    background-color: rgb(var(--theme-color));
    transition: background-color 0.5s;
    width: 30rem;
    height: 30rem;
    border-radius: 50rem;
    bottom: 15rem;
    right: 45rem;
}

.buttons button{
    width: 10rem;
    height: 3rem;
    border-radius: 1rem;
    background-color: rgb(var(--Bcolor));
    color: var(--Tcolor);
    margin: 1rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.5s;
}


.circle{
    width: 2rem;
    border-radius: 50rem;
    background-color: rgb(var(--theme-color));
    transition: background-color 0.5s;
    cursor: pointer;
    outline: 2px dotted grey;
    aspect-ratio: 1/1;
}
</style>



