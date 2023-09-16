<script>
    // @ts-nocheck
        import Social from "$lib/social.svg"
        import Add_Friend from "$lib/add-friend.svg"
        import Comparison from "$lib/comparison.svg"
        import { friends, filterList } from "$lib/FriendsStore";
        import { comparing } from "$lib/comparingStore";
        import { show_error, show_success } from "$lib/PopUpStore";
        import { Language_Store, dictionary, mapping } from "$lib/LanguageStore";
        import { get } from 'svelte/store';

        export let data;
        export let supabase 




        let { user, tableData } = data
        $: ({ user, tableData } = data)
      
        let email
        let password
        let name 
        let focus = false;
        let wait = false;
        let selected = false;
        let friend_name = "";
        let friendsdyn = get(friends).friends
        let requestdyn = get(friends).pending
        let language = get(Language_Store).language;

        Language_Store.subscribe(value => {
            language = value.language;
        })

        friends.subscribe(value => {
          Promise.resolve(value).then(value => {
            friendsdyn = Array.isArray(value.friends) ? value.friends : []
            requestdyn = Array.isArray(value.pending) ? value.pending : []
          })
        })
      
        const handleSignUp = async () => {
          const {error} = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name: name },
              emailRedirectTo: `${location.origin}/callback`,
            },
          })
          if(error){
            show_error(error.message);
          }else{
            show_success("Erfolgreich registriert, bitte E-Mail bestätigen!")
            resetInfo();
          }
        }
      
        const handleSignIn = async () => {
         const {error} = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if(error){
            show_error(error.message);
          }else{
            show_success("Erfolgreich angemeldet!")
            resetInfo();
          }
        }

        const handleSignOut = async () => {
          const {error} = await supabase.auth.signOut()

          if(error){
            show_error(error.message);
          }else{
            show_success("Erfolgreich abgemeldet!")
          }
        }

        const handleAddFriend = async (friend_name) => {
          if(friend_name == tableData[0].name){
            show_error("Du kannst dich nicht selbst hinzufügen!");
            selected = false;
            return;
          }

          if(get(friends).friends.map((friend) => friend.name).includes(friend_name)){
            show_error(`${friend_name} ist bereits dein Freund!`);
            selected = false;
            return;
          }
          selected = false;
          let res = await supabase.rpc('add_friend', {id: user.id,friend_name: friend_name})
          if(res.error){
            show_error(res.error.message);
          }else{
            if(res.data == false){
              show_error(`${friend_name === "" ? "Niemand" : friend_name} existiert nicht!`);
            }else{
              show_success(`${friend_name} hat deine Anfrage erhalten!`);
            }
          }
        }

        const handleFriendRequestDeny = async (friend_name) => {
          let res = await supabase.rpc('deny_friend_requests', {id: user.id, requester: friend_name})
          console.log(res)
          let newobj = {
            friends: [],
            pending: []
           };
          newobj.friends = (await supabase.rpc('get_friends', {id: user.id})).data;
          newobj.pending = (await supabase.rpc('get_friend_requests', {id: user.id})).data;
          friends.set(newobj);
        }

        const handleFriendRequestAccept = async (friend_name) => {
          let res = await supabase.rpc('accept_friend_requests', {id: user.id, requester: friend_name})
          console.log(res)
          let newobj = {
            friends: [],
            pending: []
           };
          newobj.friends = (await supabase.rpc('get_friends', {id: user.id})).data;
          newobj.pending = (await supabase.rpc('get_friend_requests', {id: user.id})).data;
          friends.set(newobj);
        }

        function waiter(){
        wait = true;
        setTimeout(() => {
            wait = false;
        }, 100);
    }

    function toogle_friend(friend){
        if(get(filterList).includes(friend.name)){
            filterList.update(value => {
                let newvalue = value.filter(item => item != friend.name)
                return newvalue
            })
        }else{
            filterList.update(value => {
                value.push(friend.name)
                return value
            })
        }
    }

    function show_comparison(friend){
      if((get(comparing).friend.name) && friend.name === get(comparing).friend.name){
        comparing.set({
          is_comparing: false,
          friend: {}
        })
        return;
      }
        comparing.set({
            is_comparing: true,
            friend: friend
        })
    }

    function resetInfo(){
      name = "";
      email = "";
      password = "";
    }
      </script>


      <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class = {focus ? "social" : "socialcollapse"} on:click={() =>{if(focus == false && !wait){focus = true}}}>
        {#if focus}
        <div class="top-row">
          {#if user}
          <button id = "sOut" on:click="{handleSignOut}">{dictionary.get(mapping.Sign_out)[language]}</button>
          {:else}
          <div></div>
          {/if}
          <button id = "exit" on:click={() =>{waiter(); focus = false;}} style = "--color: 0,0,0; border-radius: 50rem;">❌</button>
        </div>
        <div class="center">
          {#if !user}
          <form>
            <input name="name" bind:value="{name}" placeholder="{dictionary.get(mapping.Username)[language]}"/>
            <input name="email" bind:value="{email}" placeholder="{dictionary.get(mapping.E_Mail)[language]}"/>
            <input type="password" name="password" bind:value="{password}" placeholder="{dictionary.get(mapping.Password)[language]}"/>
          </form>
          <div class="buttons"> 
            <button on:click={handleSignUp}>{dictionary.get(mapping.Sign_up)[language]}</button>
            <button on:click="{handleSignIn}">{dictionary.get(mapping.Sign_in)[language]}</button>
          </div>
          {/if}
        </div>
        {#if user}
        <div class="center">
          <div class="wrap">          
          <div></div>
          <h3>{dictionary.get(mapping.Friends)[language]}</h3>
          <button on:click={() =>{selected = true}}><img src={Add_Friend} alt="Add a friend"></button>
        </div>

        <div class="list">
          {#each friendsdyn as friend}
            <div class = "item">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div class="comparison-box" on:click={() =>{show_comparison(friend)}}>
                <img src= {Comparison} alt="compare the players">
              </div>
              <p>{friend.name.split('#')[0]}<span>#{friend.name.split('#')[1]}</span></p>
            <input type="checkbox" checked = {!get(filterList).includes(friend.name)} on:click={() =>{toogle_friend(friend)}}>
            </div>
          {/each}
          {#if requestdyn.length != 0}
          <h4>{dictionary.get(mapping.Requests)[language]}:</h4>
          {/if}
          {#each requestdyn as request}
          <div class="request">
            <button class="accept" on:click={handleFriendRequestAccept(request)}>✔</button>
            <button class="deny" on:click={handleFriendRequestDeny(request)}>❌</button>
            <p>{request}</p>
          </div>
          {/each}
        </div>
        </div>
        {/if}
          {:else}
          <img src={Social} alt="Social">
          {/if}
      </div>


      {#if selected}
      <div class="editor">
          <input type="text" placeholder="Name#1234" bind:value={friend_name}>
          <button on:click={handleAddFriend(friend_name)}>Hinzufügen</button>
      </div>
  {/if}


        <style>

          .comparison-box{
            width: 8%;
            padding: 1%;
            border-radius: 10vw;
            background-color: bisque;
            cursor: pointer;
            border: 1px solid black;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .comparison-box > img{
            width: 100%;
            height: 100%;
          }
          .item{
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 90%;
            margin-left: 5%;
          }

          .item span{
            color: rgba(250, 236, 236, 0.61);
          }
          .request{
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }

          .request p{
            margin: 0;
            margin-left: 6%;
          }

          .request button{
            border: none;
            border-radius: 50px;
            padding: 0.2rem;
            cursor: pointer;
            transition: 0.5s;
            margin-top: 1%;
            aspect-ratio: 1/1;
            width: 2rem;
            margin-inline: 1%;
          }

          .deny{
            border: none;
            border-radius: 50px;
            padding: 0.2rem;
            cursor: pointer;
            transition: 0.5s;
            margin-top: 1%;
            background-color: rgba(209, 30, 30, 0.733);
            font-weight: bold;
          }

          .accept{
            border: none;
            border-radius: 50px;
            padding: 0.2rem;
            cursor: pointer;
            transition: 0.5s;
            margin-top: 1%;
            background-color: rgba(30, 209, 30, 0.733);
            font-weight: bold;
          }

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

        .socialcollapse{
        height: 2.5rem;
        aspect-ratio: 1/1;
        cursor: pointer;
        border: 1px solid black;
        background-image: radial-gradient(circle, rgb(194, 236, 78) 0%, rgb(231, 83, 83) 50%, rgb(150, 130, 42) 100%);
        border-radius: 50%;
        padding: 2px;
        margin-left: 1%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 1rem;
    }

    .socialcollapse img{
        height: 80%;
        aspect-ratio: 1/1;
    }

    .social{
        width: 15rem;
        height: fit-content;
        background-color: rgb(214, 212, 212);
        border-radius: 1rem;
        margin-left: 1%;
        padding-bottom: 1%;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: space-between;
    }

    #exit{
        background-color: rgba(var(--color));
        border: none;
        border-radius: 5px;
        padding: 0.5rem;
        cursor: pointer;
        transition: 0.5s;
        margin-top: 1%;
        z-index: 14;
        align-self: flex-end;
    }

    .top-row{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2%;
    }

    .center{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .center form{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .center form input{
        margin: 1%;
        padding: 1%;
        border-radius: 5px;
        border: 1px solid black;
        width: 80%;
        text-align: center;
    }

    .center form input:focus{
        outline: none;
    }

    .center form input::placeholder{
        color: black;
    }

    .center .buttons{
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 50%;
    }

    .center .buttons button{
        border: none;
        border-radius: 5px;
        padding: 0.2rem;
        cursor: pointer;
        transition: 0.5s;
        margin-top: 1%;
    }
    
    #sOut {
      border: none;
        border-radius: 5px;
        padding: 0.3rem;
        cursor: pointer;
        transition: 0.5s;
        background-color: rgba(209, 30, 30, 0.733);
        font-style: italic;
        font-weight: bold;
    }

    .wrap{
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 95%;
    }

    .wrap h3{
      margin: 0;
      margin-left: 10%;
    }

    .wrap button{
      border: none;
        border-radius: 50px;
        padding: 0.2rem;
        cursor: pointer;
        transition: 0.5s;
        margin-top: 1%;
    }

    .wrap button img{
      height: 1.5rem;
      aspect-ratio: 1/1;
    }

    h4{
      margin: 0;
      width: 100%;
      text-align: center;
    }
    
    
    </style>