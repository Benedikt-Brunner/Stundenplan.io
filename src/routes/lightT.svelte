<script>
import {schedule} from "$lib/ScheduleStore.js"

</script>

<div class = "center">
<table>
    <tr>
        <th>👾</th>
        <th>Montag</th>
        <th>Dienstag</th>
        <th>Mittwoch</th>
        <th>Donnerstag</th>
        <th>Freitag</th>
    </tr>
    {#each $schedule as hour}
        <tr>
            <td>{hour.Hours}</td>
            <td>{hour.Day1}</td>
            <td>{hour.Day2}</td>
            <td>{hour.Day3}</td>
            <td>{hour.Day4}</td>
            <td>{hour.Day5}</td>
        </tr>
    {/each}
</table>
</div>


<style>
    .center{
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
            table{
        width: 60%;
        border-collapse: collapse;
        margin-bottom: 5%;
    }

    th,td{
        border: 1px solid black;
        padding: 1%;
    }
    th{
        font-size: 2rem;
        text-align: center;
        width: fit-content;
    }
    td{
        font-size: 1rem;
        text-align: center;
    }
</style>