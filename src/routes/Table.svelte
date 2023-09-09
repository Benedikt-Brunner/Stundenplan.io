<script>
    //@ts-nocheck
import {schedule, fullweektoogle} from "$lib/ScheduleStore.js"
import { get_friends_lessons } from "$lib/FriendsStore";
import { get } from 'svelte/store';


export let styles;
export let supabase;
export let user;

let selectobject = {"row" : 0, "column" : 0}
let selected = false;
const five_day_ratio = 90/5;
const seven_day_ratio = 90/7;
let ratio = get(fullweektoogle) ? seven_day_ratio : five_day_ratio;

fullweektoogle.subscribe(value => {
    ratio = value ? seven_day_ratio : five_day_ratio;
})

async function persist(){
    let data = get(schedule);
    const res = (await supabase.rpc('persist_schedule', {id: user.id, schedule: data})).data;
    console.log(res)
}

</script>

<div class = "center">
<table>
    <tr>
        <th contenteditable="true">👾</th>
        <th style="background-color: {styles.header_color_monday}; width: {ratio}%;">Montag</th>
        <th style="background-color: {styles.header_color_tuesday}; width: {ratio}%;">Dienstag</th>
        <th style="background-color: {styles.header_color_wednesday}; width: {ratio}%;">Mittwoch</th>
        <th style="background-color: {styles.header_color_thursday}; width: {ratio}%;">Donnerstag</th>
        <th style="background-color: {styles.header_color_friday}; width: {ratio}%;">Freitag</th>
        {#if $fullweektoogle}
            <th style="background-color: {styles.header_color_saturday}; width: {ratio}%;">Samstag</th>
            <th style="background-color: {styles.header_color_sunday}; width: {ratio}%;">Sonntag</th>
        {/if}
    </tr>
    {#each $schedule as hour, i}
        <tr>
            <td style="text-align: center;" on:click={() => {if(!selected){selectobject.row = i; selectobject.column = 0; selected = true}}}>{hour.Hours}</td>
            <td on:click={() => {if(!selected){selectobject.row = i; selectobject.column = 1; selected = true}}}>
                <p>Raum: {hour.Day1.Room}</p>
                <p>Fach: {hour.Day1.Subject}</p>
                <p>Lehrer: {hour.Day1.Teacher}</p>
            </td>
            <td on:click={() => {if(!selected){selectobject.row = i; selectobject.column = 2; selected = true}}}>
                <p>Raum: {hour.Day2.Room}</p>
                <p>Fach: {hour.Day2.Subject}</p>
                <p>Lehrer: {hour.Day2.Teacher}</p>
            </td>
            <td on:click={() => {if(!selected){selectobject.row = i; selectobject.column = 3; selected = true}}}>
                <p>Raum: {hour.Day3.Room}</p>
                <p>Fach: {hour.Day3.Subject}</p>
                <p>Lehrer: {hour.Day3.Teacher}</p>
            </td>
            <td on:click={() => {if(!selected){selectobject.row = i; selectobject.column = 4; selected = true}}}>
                <p>Raum: {hour.Day4.Room}</p>
                <p>Fach: {hour.Day4.Subject}</p>
                <p>Lehrer: {hour.Day4.Teacher}</p>
            </td>
            <td on:click={() => {if(!selected){selectobject.row = i; selectobject.column = 5; selected = true}}}>
                <p>Raum: {hour.Day5.Room}</p>
                <p>Fach: {hour.Day5.Subject}</p>
                <p>Lehrer: {hour.Day5.Teacher}</p>
            </td>
            {#if $fullweektoogle}
                <td on:click={() => {if(!selected){selectobject.row = i; selectobject.column = 6; selected = true}}}>
                    <p>Raum: {hour.Day6.Room}</p>
                    <p>Fach: {hour.Day6.Subject}</p>
                    <p>Lehrer: {hour.Day6.Teacher}</p>
                </td>
                <td on:click={() => {if(!selected){selectobject.row = i; selectobject.column = 7; selected = true}}}>
                    <p>Raum: {hour.Day7.Room}</p>
                    <p>Fach: {hour.Day7.Subject}</p>
                    <p>Lehrer: {hour.Day7.Teacher}</p>
                </td>
            {/if}
        </tr>
    {/each}
</table>
{#if selected}
    <div class="editor">
        {#if selectobject.column == 0}
        <input type="text" placeholder="Stunden" bind:value={$schedule[selectobject.row].Hours}>
        {:else}
        <input type="text" placeholder="Raum" bind:value={$schedule[selectobject.row]["Day" + (selectobject.column)].Room}>
        <input type="text" placeholder="Fach" bind:value={$schedule[selectobject.row]["Day" + (selectobject.column)].Subject}>
        <input type="text" placeholder="Lehrer" bind:value={$schedule[selectobject.row]["Day" + (selectobject.column)].Teacher}>
        {/if}
        <button on:click={() => {selected = false; persist();}}>Speichern</button>
    </div>
{/if}
</div>


<style>

    .editor{
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        background-color: rgba(0,0,0,0.5);
        z-index: 1;
    }

    .editor input{
        margin: 1rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: none;
        outline: none;
    }

    .editor button{
        margin: 1rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: none;
        outline: none;
        cursor: pointer;
    }

    .center{
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100vh;
        margin-top: 5%;
        z-index: 0;
    }
            table{
        width: 70%;
        height: 50%;
        border-collapse: collapse;
        margin-bottom: 5%;
    }

    th,td{
        border: 1px solid black;
        }
    th{
        font-size: 2rem;
        text-align: center;
    }
    td{
        font-size: 0.8rem;
        text-align: start;
        cursor: pointer;
    }
</style>