<script>
    // @ts-nocheck
        import Group from "./group.svelte";
        import Social from "$lib/social.svg"
        import Add_Friend from "$lib/add-friend.svg"
        import Comparison from "$lib/comparison.svg"
        import Manager from "$lib/manager.svg"
        import Plus from "$lib/Plus.svg"
        import { friends, filterList, get_groups, get_friends_with_no_group } from "$lib/FriendsStore";
        import { comparing } from "$lib/comparingStore";
        import { show_error, show_success } from "$lib/PopUpStore";
        import { Language_Store, dictionary, mapping } from "$lib/LanguageStore";
        import { invalidateAll } from "$app/navigation";
        import { get } from 'svelte/store';

        export let data;
        export let supabase 


          
        let { user, tableData } = data
        $: ({ user, tableData } = data)

        let not_logged_in_states = {
          not_decided: 0,
          sign_up: 1,
          sign_in: 2
        }
        let not_logged_in_state = not_logged_in_states.not_decided; 
        let email
        let password
        let name 
        let focus = false;
        let wait = false;
        let adder_selected = false;
        let manager_selected = false;
        let friend_name = "";
        let friendsdyn = get(friends).friends
        let requestdyn = get(friends).pending
        let groups = get_groups();
        let friends_with_no_group = get_friends_with_no_group();
        let language = get(Language_Store).language;
        let group_collapse_arr = groups.map((_) => false);


        
        Language_Store.subscribe(value => {
            language = value.language;
        })

        friends.subscribe(value => {
          Promise.resolve(value).then(value => {
            friendsdyn = Array.isArray(value.friends) ? value.friends : []
            requestdyn = Array.isArray(value.pending) ? value.pending : []
          })
          groups = get_groups();
          group_collapse_arr = groups.map((_, i) => i < group_collapse_arr.length ? group_collapse_arr[i] : false);
          friends_with_no_group = get_friends_with_no_group();
        })

        function persist(){
          groups = groups.filter(group => group.friends.length != 0);
          let counter = 1;
          for(let group in groups){
            if(group.name === ""){
              group.name = `Group ${counter}`;
              counter++;
            }
          }
          groups.forEach((group) => {
           persist_group(group);
          })
          friends_with_no_group.forEach((friend) => {
            persist_non_group_members(friend);
          })
        }

        function persist_group(group){
          group.friends.forEach(async (friend) =>{
            if(group.name !== get_from_friends(friend).group){
              const res = await supabase.rpc('change_friend_group', {id: user.id, friend: friend.name, new_group: group.name})
              console.log(res)
            }
          })
        }
        async function persist_non_group_members(friend){
          if(get_from_friends(friend).group !== null){
            let res = await supabase.rpc('null_friend_group', {id: user.id, friend: friend.name})
            console.log(res)
          }
        }

        function get_from_friends(friend){
          let res = friendsdyn.filter((f) => {
            return f.name === friend.name;
          })
          return res[0];
        }
       
      
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
            show_success(dictionary.get(mapping.Successfully_registered_please_confirm_E_Mail)[language])
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
            invalidateAll();
            show_success(dictionary.get(mapping.Successfully_signed_in)[language])
            not_logged_in_state = not_logged_in_states.not_decided;
            resetInfo();
          }
        }

        const handleSignOut = async () => {
          const {error} = await supabase.auth.signOut()

          if(error){
            show_error(error.message);
          }else{
            invalidateAll();
            not_logged_in_state = not_logged_in_states.not_decided;
            show_success(dictionary.get(mapping.Successfully_signed_out)[language])
          }
        }

        const handleAddFriend = async (friend_name) => {
          if(friend_name == tableData[0].name){
            show_error(dictionary.get(mapping.You_cant_add_yourself)[language]);
            adder_selected = false;
            focus = true;
            return;
          }

          if(get(friends).friends.map((friend) => friend.name).includes(friend_name)){
            show_error(`${friend_name} ${dictionary.get(mapping.is_already_your_friend)[language]}`);
            adder_selected = false;
            focus = true;
            return;
          }
          adder_selected = false;
          focus = true;
          let res = await supabase.rpc('add_friend', {id: user.id,friend_name: friend_name})
          if(res.error){
            show_error(res.error.message);
          }else{
            if(res.data == false){
              show_error(`${friend_name === "" ? dictionary.get(mapping.Nobody)[language] : friend_name} ${dictionary.get(mapping.doesnt_exist)[language]}`);
            }else{
              show_success(`${friend_name} ${dictionary.get(mapping.was_added)[language]}`);
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


    /**
     * check if list1 is a sublist of list2
     * @param list1 potentially sublist
     * @param list2 potentially superlist
     */
    function isSublist(list1, list2){
      let res = true;
      list1.forEach((item) => {
        if(!list2.includes(item)){
          res = false;
        }
      })
      return res;
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

    function show_group_comparison(group){
      if((Array.isArray(get(comparing).friend)) && isSublist(group.friends, get(comparing).friend)){
        comparing.set({
          is_comparing: false,
          friend: {}
        })
        return;
      }
        comparing.set({
            is_comparing: true,
            friend: group.friends
        })
    }
    
    function resetInfo(){
      name = "";
      email = "";
      password = "";
    }

    function add_group(){
      let colors = [
        "#1446A0",
        "#DB3069",
        "#312509",
        "#16324F",
        "#6EEB83",
        "#1BE7FF",
        "#E8AA14",
        "#BA7BA1",
        "#B4ADEA",
        "#621B00"
    ]
      let newobj = {
        name: "",
        color: colors[(groups.length) % colors.length],
        friends: []
      }
      groups = [...groups, newobj];
    }

    function toogle_group(i){
      return () => {
        group_collapse_arr[i] = !group_collapse_arr[i];
      }
    }
      </script>
<svelte:window on:beforeunload = {persist}/>

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
          <button id = "exit" on:click={() =>{waiter(); focus = false; not_logged_in_state = not_logged_in_states.not_decided;}} style = "--color: 0,0,0; border-radius: 50rem;">❌</button>
        </div>
        <div class="center">
          {#if !user}
          {#if not_logged_in_state == not_logged_in_states.not_decided}
          <div class="deciders">
            <button on:click={() =>{not_logged_in_state = not_logged_in_states.sign_in;}}>{dictionary.get(mapping.Sign_in)[language]}</button>
            <button on:click={() =>{not_logged_in_state = not_logged_in_states.sign_up;}}>{dictionary.get(mapping.Sign_up)[language]}</button>
          </div>
          {:else if not_logged_in_state == not_logged_in_states.sign_up}
          <form>
            <input name="name" bind:value="{name}" placeholder="{dictionary.get(mapping.Username)[language]}"/>
            <input name="email" bind:value="{email}" placeholder="{dictionary.get(mapping.E_Mail)[language]}"/>
            <input type="password" name="password" bind:value="{password}" placeholder="{dictionary.get(mapping.Password)[language]}"/>
          </form>
          <div class="buttons"> 
            <button on:click={handleSignUp}>{dictionary.get(mapping.Sign_up)[language]}</button>
          </div>
          {:else if not_logged_in_state == not_logged_in_states.sign_in}
          <form>
            <input name="email" bind:value="{email}" placeholder="{dictionary.get(mapping.E_Mail)[language]}"/>
            <input type="password" name="password" bind:value="{password}" placeholder="{dictionary.get(mapping.Password)[language]}"/>
          </form>
          <div class="buttons"> 
            <button on:click="{handleSignIn}">{dictionary.get(mapping.Sign_in)[language]}</button>
          </div>
          {/if}
          {/if}
        </div>
        {#if user}
        <div class="center">
          <div class="wrap">    
          <button on:click={() =>{if(!adder_selected){manager_selected = true; focus = false; waiter();}}}>
            <img src= {Manager} alt="Manage your friend groupings">
          </button>
          <h3>{dictionary.get(mapping.Friends)[language]}</h3>
          <button on:click={() =>{if(!manager_selected){adder_selected = true, focus = false; waiter();}}}><img src={Add_Friend} alt="Add a friend"></button>
        </div>
        <div class="list">
          {#if groups}
          {#each groups as group, i}
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <button class = "deez_buttons" style="color: {group.color};" on:click={toogle_group(i)}>
            {#if !group_collapse_arr[i]}
            <div class="comparison-box" style="background-color: {group.color};" on:click={() =>{show_group_comparison(group)}}>
              <img src= {Comparison} alt="compare the players">
            </div>
            {/if}
            {group_collapse_arr[i] ? `${group.name}` : `------${group.name}------`}
            {#if !group_collapse_arr[i]}
            <div id = "filler"></div>
            {/if}
          </button>
          {#if !group_collapse_arr[i]}
          {#each group.friends as friend}
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
        {/if}
          {/each}
          {/if}
          {#if friends_with_no_group.length != 0 && groups.length != 0}
          <h4>{dictionary.get(mapping.Friends_without_group)[language]}:</h4>
          {/if}
          {#each friends_with_no_group as friend}
            <div class = "item">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div class="comparison-box" on:click={() =>{show_comparison(friend)}}>
                <img src= {Comparison} alt="compare the players">
              </div>
              <p>{friend.name.split('#')[0]}<span>#{friend.name.split('#')[1]}</span></p>
            <input type="checkbox" checked = {!$filterList.includes(friend.name)} on:click={() =>{toogle_friend(friend)}}>
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


      {#if adder_selected}
      <div class="editor">
          <input type="text" placeholder="{dictionary.get(mapping.Name)[language]}#1234" bind:value={friend_name}>
          <button on:click={handleAddFriend(friend_name)}>{dictionary.get(mapping.Add)[language]}</button>
      </div>
  {/if}

  {#if manager_selected}
      <div class="editor">
          <div class = "manager">
            <div class = "manager_header">
              <div></div>
              <h3>{dictionary.get(mapping.Groups)[language]}</h3>
              <button on:click={() =>{persist();manager_selected = false; focus = true;}} style = "--color: 0,0,0; border-radius: 50rem;">❌</button>
            </div>
            <div class = "group_display">
                {#each groups as group,i}
                  <Group bind:group = {group} bind:friends_with_no_group = {friends_with_no_group}/>
                {/each}
                <button id="new_group" on:click={add_group}>
                  <img src= {Plus} alt="Add a new group">
                </button>
            </div>
            <span>{dictionary.get(mapping.Empty_groups_will_be_removed)[language]}</span>
          </div>
      </div>
  {/if}


        <style>

          .deciders{
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
          }

          .deciders button{
            border: none;
            border-radius: 50px;
            padding: 0.2rem;
            cursor: pointer;
            transition: 0.5s;
            margin-top: 1%;
            margin-inline: 7%;
          }
            #new_group{
                width: 8%;
                border-radius: 10vw;
                cursor: pointer;
                border: 1px solid black;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 5%;
                margin-left: 5%;
            }

            #new_group > img{
                width: 100%;
                height: 100%;
            }
          .group_display{
            padding: 2%;
            width: 80%;
            height: 70%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-start;
            flex-wrap: wrap;
            background-color: rgba(135, 138, 141);
            border-radius: 50px;
            overflow-y: scroll;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .group_display::-webkit-scrollbar {
            display: none;
          }

          .manager{
            width: 60%;
            height: 60%;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 10px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            flex-direction: column;
          }

          .manager span{
            color: white;
            margin: 0;
            margin-top: 2%;
          }

          .manager_header{
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }

          .manager_header h3{
            margin: 0;
            color: white;
            margin-left: 10%;
            text-decoration: underline;
            font-size: 1.5rem;
          }
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
        justify-content: center;
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
      margin-bottom: 3%;
    }

    .wrap h3{
      margin: 0;
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

    .deez_buttons{
      all: unset;
      margin: 0;
      width: 100%;
      text-align: center;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
    }

    #filler{
      width: 20%;
    }

    .deez_buttons .comparison-box{
            width: 6%;
            padding: 1%;
            border-radius: 10vw;
            cursor: pointer;
            border: 1px solid black;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-left: 12%;
          }
    </style>