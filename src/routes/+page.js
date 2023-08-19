// src/routes/profile/+page.ts
//@ts-nocheck
import { friends } from '$lib/FriendsStore.js' 


export const load = async ({ parent }) => {
  const { supabase, session } = await parent()
  if (!session) {
    return 
  }
  const { data: tableData } = await supabase.from('users').select('name').eq('id', session.user.id)

  friends.update(async () =>{
    let arr = [];
    arr = await supabase.from('friends').select('users (name, schedule)').eq('userr', session.user.id).eq('pending', false)
    return arr
  })

  return {
    user: session.user,
    tableData,
    supabase
  }
}