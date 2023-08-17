import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { theme } from '$lib/ThemeStore'
import { get } from 'svelte/store'

// Svelte Component To Image
import { image_from_component, type RenderOptions } from 'svelte-component-to-image'

// Normal .svelte component
import LightT from '../lightT.svelte'
import NightT from '../nightT.svelte'
import PinkT from '../pinkT.svelte'

let compMap = new Map<string, any>();

compMap.set('Light', LightT);
compMap.set('Night', NightT);
compMap.set('Pink', PinkT);


let selectedComponent = compMap.get(get(theme));
 
export const GET: RequestHandler = (async ({url}) => {
    selectedComponent = compMap.get(get(theme));
    try {
        const options: RenderOptions = {
            width: 1200,
            height: 600,
            props: {
                text: url.searchParams.get('text') ?? 'text not found'
            },
            fonts: [
                {
                    name: 'Typewriter',
                    url: `${url.origin}/TYPEWR__.TTF`,
                    weight: 400,
                    style: 'normal'
                }
            ]
        }

        // pass the component and options to the package
        const image    = await image_from_component(selectedComponent, options)
        const response = new Response(image)
        response.headers.append('Content-Type', 'image/png')
        return response
    } catch (e) {
        console.error(e)
        throw error(500, 'Error trying to generate image from component.')
    }
}) satisfies RequestHandler