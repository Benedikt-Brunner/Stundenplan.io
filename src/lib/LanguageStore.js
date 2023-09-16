//@ts-nocheck
import { writable } from "svelte/store";
import { build_dictionary, mapping as mape } from "./DictionaryBuilder";

export const languages = {
    spanish: "es",
    english: "en",
    german: "de"
}; 

export const mapping = mape;

export let Language_Store = writable({
    language: languages.german
});

export const dictionary = build_dictionary();

export function setLanguage(language){
    if(!Object.values(languages).includes(language)){
        throw new Error("Language not supported");
    }
    Language_Store.update(store => {
        store.language = language;
        return store;
    });
}
