<script>
    export let styles;
</script>

<div class = "container">
    <ul>
        <li>
            <div class = "block" id = "green"></div> Frei
        </li>

        <li>
            <div class = "block" id="blue"></div> Selber Kurs
        </li>

        <li>
            <div class = "block" id = "yellow"></div> Teilweise blockiert
        </li>

        <li>
            <div class = "block" id = "red"></div> Komplett blockiert           
        </li>
    </ul>
</div>


<style>
    .container{
        position: fixed;
        bottom: 0;
        right: 0;
        margin: 1rem;
        padding: 1rem;
        border-radius: 1rem;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        font-size: 1.2rem;
        font-weight: bold;
        z-index: 10;
    }

    ul{
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li{
        display: flex;
        align-items: center;
        margin: 0.5rem 0;
    }

    .block{
        width: 1.5rem;
        height: 1.5rem;
        margin-right: 1rem;
        border-radius: 0.5rem;
    }

    #green{
        background-color: green;
    }

    #blue{
        background-color: blue;
    }

    #red{
        background-color: red;
    }

    #yellow{
        background-color: yellow;
    }
</style>