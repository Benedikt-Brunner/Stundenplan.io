<script>
    //@ts-nocheck
import {schedule, fullweektoogle} from "$lib/ScheduleStore.js"
import { get_table_pattern } from "$lib/comparingStore";
import { comparing } from "$lib/comparingStore";
import { get } from 'svelte/store';

export let styles;

let coloring = get_table_pattern();
const five_day_ratio = 90/5;
const seven_day_ratio = 90/7;
let ratio = get(fullweektoogle) ? seven_day_ratio : five_day_ratio;

fullweektoogle.subscribe(value => {
    ratio = value ? seven_day_ratio : five_day_ratio;
})


comparing.subscribe(value => {
    if(!value.is_comparing) return;
    coloring = get_table_pattern();
})
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
            <td style="text-align: center;">{hour.Hours}</td>
            <td style="background-color: {coloring[i][0]};">
                <p>Raum: {hour.Day1.Room}</p>
                <p>Fach: {hour.Day1.Subject}</p>
                <p>Lehrer: {hour.Day1.Teacher}</p>
            </td>
            <td style="background-color: {coloring[i][1]};">
                <p>Raum: {hour.Day2.Room}</p>
                <p>Fach: {hour.Day2.Subject}</p>
                <p>Lehrer: {hour.Day2.Teacher}</p>
            </td>
            <td style="background-color: {coloring[i][2]};">
                <p>Raum: {hour.Day3.Room}</p>
                <p>Fach: {hour.Day3.Subject}</p>
                <p>Lehrer: {hour.Day3.Teacher}</p>
            </td>
            <td style="background-color: {coloring[i][3]};">
                <p>Raum: {hour.Day4.Room}</p>
                <p>Fach: {hour.Day4.Subject}</p>
                <p>Lehrer: {hour.Day4.Teacher}</p>
            </td>
            <td style="background-color: {coloring[i][4]};"> 
                <p>Raum: {hour.Day5.Room}</p>
                <p>Fach: {hour.Day5.Subject}</p>
                <p>Lehrer: {hour.Day5.Teacher}</p>
            </td>
            {#if $fullweektoogle}
                <td style="background-color: {coloring[i][5]};">
                    <p>Raum: {hour.Day6.Room}</p>
                    <p>Fach: {hour.Day6.Subject}</p>
                    <p>Lehrer: {hour.Day6.Teacher}</p>
                </td>
                <td style="background-color: {coloring[i][6]};">
                    <p>Raum: {hour.Day7.Room}</p>
                    <p>Fach: {hour.Day7.Subject}</p>
                    <p>Lehrer: {hour.Day7.Teacher}</p>
                </td>
            {/if}
        </tr>
    {/each}
</table>
</div>


<style>

    .center{
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
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
    }
</style>