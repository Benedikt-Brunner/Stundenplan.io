// src/routes/profile/+page.ts
//@ts-nocheck
import { friends } from '$lib/Stores/FriendsStore.js' 
import { schedule, rows, template, fullweektoogle } from '$lib/Stores/ScheduleStore.js'
import { setLanguage, languages } from '$lib/Stores/LanguageStore.js'
import { couting_signal } from '$lib/Stores/changedStore.js'
import { theme } from '$lib/Stores/ThemeStore.js'
import { Routes, TimetableBackendApiService } from '$lib/TimetableBackendApiService'

export const load = async () => {
  let { res, error } = await TimetableBackendApiService.get(Routes.UserData);

  if (error || res.status !== 200) {
    theme.set("Light");
    rows.set(7);
    template.set("University");
    fullweektoogle.set(false);
    setLanguage(languages.german);
    return {
      user: {
        name: "User"
      },
      buddy: "👾"
    };
  }

  const data = await res.json();

  theme.set(data.meta.theme);
  rows.set(data.meta.rows);
  template.set(data.meta.template);
  fullweektoogle.set(data.meta.days);
  setLanguage(data.meta.language);
  couting_signal.update(n => n + 1);
  
// set schedule
  
  let newobj = {
    friends: [],
    pending: []
  };
  friends.set(newobj);
  
  return {
    user: {
      name: data.username
    },
    buddy: data.meta.buddy,
  }
}


