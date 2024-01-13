// src/routes/profile/+page.ts
//@ts-nocheck
import { friends } from '$lib/FriendsStore.js' 
import { schedule, rows, template, fullweektoogle } from '$lib/ScheduleStore.js'
import { setLanguage, languages } from '$lib/LanguageStore.js'
import { couting_signal } from '$lib/changedStore.js'
import { theme } from '$lib/ThemeStore.js'

export const load = async () => {
  if (true) {
    theme.set("Light");
    rows.set(7);
    template.set("University");
    fullweektoogle.set(false);
    setLanguage(languages.german);
    return{buddy: "👾"};
  }

  if (error || res.length == 0) {
    theme.set("Light");
    rows.set(7);
    template.set("University");
    fullweektoogle.set(false);
    setLanguage(languages.german);
    return{buddy: "👾"};
  }

  theme.set(res[0].theme);
  rows.set(res[0].rows);
  template.set(res[0].template);
  fullweektoogle.set(res[0].days);
  setLanguage(res[0].language);
  couting_signal.update(n => n + 1);
  
// set schedule
  
  let newobj = {
    friends: [],
    pending: []
  };
  friends.set(newobj);
  return {
    user: "",
    tableData,
    supabase,
    buddy: res[0].buddy
  }
}


