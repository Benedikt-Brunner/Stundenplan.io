// src/routes/profile/+page.ts
//@ts-nocheck
import { friends } from '$lib/FriendsStore.js' 
import { schedule } from '$lib/ScheduleStore.js'
import { get } from 'svelte/store'

export const load = async ({ parent }) => {
  const { supabase, session } = await parent()
  if (!session) {
    return 
  }
  const { data: tableData } = await supabase.from('users').select('name, schedule').eq('id', session.user.id)
  schedule.set(tableData[0].schedule);
  
  let newobj = {
    friends: [],
    pending: []
  };
  newobj.friends = (await supabase.rpc('get_friends', {id: session.user.id})).data;
  newobj.pending = (await supabase.rpc('get_friend_requests', {id: session.user.id})).data;
  friends.set(newobj);
  return {
    user: session.user,
    tableData,
    supabase
  }
}


