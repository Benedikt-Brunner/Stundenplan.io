<script>
    //@ts-nocheck
    import { theme } from "$lib/ThemeStore";
	import Options from "$lib/Options.svg"
    import {rows} from "$lib/ScheduleStore.js"
    import {template as templateStore} from "$lib/ScheduleStore.js";
    import {fullweektoogle} from "$lib/ScheduleStore.js";
    import { get } from 'svelte/store';


    let focus = false;
    let colorRGB = "";
    let color = "";
    let dynamicRows = get(rows);
    let dynDays = get(fullweektoogle);
    let template = "University";
    let setting = "Theme";
    let disabled = true;
    let wait = false;


    let settings = [
        "Theme",
        "Template",
        "Days"
    ]


    let themes = [
        "Light",
        "Night",
        "Pink",
    ]

    let templates = [
        "University",
        "School",
        "Custom"
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

   
    theme.subscribe(value => {
        color = value;
        colorRGB = colormap.get(value);
    })

    $:{disabled = template != "Custom";}

    $: updateRows(dynamicRows);

    $: updateTemplate(template);

    $: updateDays(dynDays);

    function updateDays(e){
        fullweektoogle.set(dynDays);
    }

    function updateTemplate(e){
        templateStore.set(template);
        if(template == "Custom"){
            updateRows(dynamicRows);
    }
}

    function updateRows(e){
        dynamicRows = dynamicRows < 1 ? 1 : dynamicRows;
        dynamicRows = dynamicRows > 30 ? 30 : dynamicRows;
        rows.set(dynamicRows);
    }

    function waiter(){
        wait = true;
        setTimeout(() => {
            wait = false;
        }, 100);
    }
</script>




<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class = {focus ? "options" : "optionscollapse"} on:click={() =>{if(focus == false && !wait){focus = true}}}>
    {#if focus}
    <div class="top">
        {#each settings as s}
        {#if s == setting}
        <div style="background-color: black;color: white">{s}</div>
    {:else}
        <button style="--color: 0,0,0; color: white" on:click={() => {setting = s}}>{s}</button>
    {/if}
        {/each}
        <button on:click={() =>{waiter(); focus = false}} style = "--color: 0,0,0; border-radius: 50rem;">❌</button>
    </div>
    {#if setting == "Theme"}
        <div class="top">
            {#each themes as t}
                {#if t == color}
                    <div style="background-color: rgb({colorRGB});color: {DarkText.includes(t) ? "black" : "white"}">{t}</div>
                {:else}
                    <button style="--color: {colormap.get(t)}; color: {DarkText.includes(t) ? "black" : "white"}" on:click={() => {theme.set(t)}}>{t}</button>
                {/if}
            {/each}   
        </div>
    {:else if setting == "Template"}
        <div class = "middle">

            {#each templates as t}
                <label>
                    <input type="radio" bind:group={template} value={t} style="margin-right: 0.5rem">
                    {t}
                </label>
            {/each}

        </div>
        <div class = "bottom">
            <label for="rows">Stunden:</label>
            <input type="number" name="rows"  bind:value={dynamicRows} {disabled} style="{disabled ? "cursor: not-allowed" : ""}">
        </div>
    {:else if setting == "Days"}
        <div class = "middle">
            <label for="rows">7-Tage:</label>
            <input type="checkbox" bind:checked={dynDays}>
        </div>
    {/if}
    {:else}
    <img src={Options} alt="Options">
    {/if}
</div>




<style>
    .optionscollapse{
        height: 2.5rem;
        aspect-ratio: 1/1;
        cursor: pointer;
        border: 1px solid black;
        background-color: rgba(151, 147, 147, 0.781);
        border-radius: 50%;
        padding: 2px;
        margin-top: 1rem;
    }

    .optionscollapse img{
        height: 100%;
        aspect-ratio: 1/1;
    }

    .options{
        width: 20rem;
        height: 12rem;
        background-color: rgba(151, 147, 147);
        border-radius: 1rem;
    }



    .top{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
    }

    .top button{
        background-color: rgba(var(--color));
        border: none;
        border-radius: 5px;
        padding: 0.5rem;
        cursor: pointer;
        transition: 0.5s;
    }

    .top div{
        border-radius: 5px;
        padding: 0.2rem;
        border: 3px solid gold;
    }

    .top button:hover{
        transform: scale(1.1);
    }

    .middle{
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem;
    }

    .bottom{
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem;
    }

    .bottom label{
        margin-right: 1rem;
    }
</style>



