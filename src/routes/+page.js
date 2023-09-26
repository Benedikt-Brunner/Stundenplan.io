// src/routes/profile/+page.ts
//@ts-nocheck
import { friends } from '$lib/FriendsStore.js' 
import { schedule, rows, template, fullweektoogle } from '$lib/ScheduleStore.js'
import { theme } from '$lib/ThemeStore.js'
import { set_metadata } from '$lib/MetadataStore.js'
import { get } from 'svelte/store'

export const load = async ({ parent }) => {
  const { supabase, session } = await parent()
  if (!session) {
    return 
  }

  const { data: res } = await supabase.from('meta').select('buddy, rows, days, theme, template').eq('user_id', session.user.id)
  set_metadata(res[0].buddy, res[0].rows, res[0].days, res[0].theme, res[0].template);
  theme.set(res[0].theme);
  rows.set(res[0].rows);
  template.set(res[0].template);
  fullweektoogle.set(res[0].days);
  

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


