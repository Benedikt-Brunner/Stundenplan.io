// src/routes/profile/+page.ts
//@ts-nocheck
import { friends } from '$lib/FriendsStore.js' 
import { schedule, rows, template, fullweektoogle } from '$lib/ScheduleStore.js'
import { setLanguage, languages } from '$lib/LanguageStore.js'
import { couting_signal } from '$lib/changedStore.js'
import { theme } from '$lib/ThemeStore.js'

export const load = async ({ parent }) => {
  const { supabase, session } = await parent()
  if (!session) {
    theme.set("Light");
    rows.set(7);
    template.set("University");
    fullweektoogle.set(false);
    setLanguage(languages.german);
    return{buddy: "👾"};
  }

  const { data: res } = await supabase.from('meta').select('buddy, rows, days, theme, template, language').eq('user_id', session.user.id)
  theme.set(res[0].theme);
  rows.set(res[0].rows);
  template.set(res[0].template);
  fullweektoogle.set(res[0].days);
  setLanguage(res[0].language);
  couting_signal.update(n => n + 1);
  

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
    supabase,
    buddy: res[0].buddy
  }
}


