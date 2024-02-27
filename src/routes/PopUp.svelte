<script>
    //@ts-nocheck
    import { PopUpStore, states} from "$lib/Stores/PopUpStore";
    import { fly } from "svelte/transition";

    let state = states.none;
    let message = "";
    let life_time = 4000;

    PopUpStore.subscribe((value) => {
        if (value.state === states.success) {
            render_success(value.msg);
        } else if (value.state === states.error) {
            render_error(value.msg);
        }
    });

    function render_success(msg) {
        state = states.success;
        message = msg;
        setTimeout(() => {
        state = states.none;
    }, life_time);
    }

    function render_error(msg) {
        state = states.error;
        message = msg;
        setTimeout(() => {
        state = states.none;
    }, life_time);
    }

    let parameters_in = {
        duration: 3000,
        x: "-30vw",
    };
</script>


{#if state === states.success}
    <div class="container" id = "success" in:fly = {parameters_in} out:fly = {parameters_in}>
        <h2>
            {message}
        </h2>
    </div>
{:else if state === states.error}
    <div class="container" id = "error" in:fly = {parameters_in} out:fly = {parameters_in}>
        <h2>
            {message}
        </h2>
    </div>
{/if}

<style>
    .container {
        height: fit-content;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: fixed;
        top: 25;
        left: 5%;
        border: black solid 1px;
        border-radius: 10px;
        background-color: rgba(187, 186, 186, 0.959);
        width: fit-content;
        padding-inline: 2%;
        min-width: 10%;
    }

    #success {
        text-decoration: underline rgb(0, 255, 0);
    }

    #error {
        text-decoration: underline rgb(255, 0, 0);
    }
</style>