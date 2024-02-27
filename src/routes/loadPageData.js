// src/routes/profile/+page.ts
//@ts-nocheck
import { friends } from '$lib/Stores/FriendsStore.js' 
import { schedule, rows, template, fullweektoogle } from '$lib/Stores/ScheduleStore.js'
import { setLanguage, languages } from '$lib/Stores/LanguageStore.js'
import { couting_signal } from '$lib/Stores/changedStore.js'
import { theme } from '$lib/Stores/ThemeStore.js'
import { Routes, TimetableBackendApiService } from '$lib/TimetableBackendApiService'

export const load = async () => {
  let { res, error } = await TimetableBackendApiService.get(Routes.UserData, {});

  if (error || res.status !== 200) {
    theme.set("Light");
    rows.set(7);
    template.set("University");
    fullweektoogle.set(false);
    setLanguage(languages.german);
    return{buddy: "👾"};
  }

  const data = await res.json();

  console.log(data);

  return;

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
    buddy: res[0].buddy
  }
}


