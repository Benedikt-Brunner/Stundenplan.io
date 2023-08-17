<!-- src/routes/+layout.svelte -->
<script>
    import { invalidate } from '$app/navigation'
    import { onMount } from 'svelte'
  
    // @ts-ignore
    export let data
  
    // @ts-ignore
    let { supabase, session } = data
    // @ts-ignore
    $: ({ supabase, session } = data)
  
    onMount(() => {
      const {
        data: { subscription },
      // @ts-ignore
      } = supabase.auth.onAuthStateChange((event, _session) => {
        if (_session?.expires_at !== session?.expires_at) {
          invalidate('supabase:auth')
        }
      })
  
      return () => subscription.unsubscribe()
    });
  </script>
  
  <slot />