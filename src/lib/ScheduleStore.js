import { writable } from "svelte/store";
export const template = writable("University");
export const rows = writable(7);
export const schedule = writable(new Array(7).fill("").map(() => {return {
    "Hours": "",
    "Day1": "",
    "Day2": "",
    "Day3": "",
    "Day4": "",
    "Day5": ""
}}));

rows.subscribe(value => {
    schedule.update(old => {
        let newarr = new Array(value);
        let len = old.length > value ? value : old.length;
        let temp = old.slice(0, len);
        temp.forEach((element, index) => {
            newarr[index] = element;
        });
        newarr.fill("", len);
        newarr.map((element, index) => {
            if (element == "") {
                newarr[index] = {
                    "Hours": "",
                    "Day1": "",
                    "Day2": "",
                    "Day3": "",
                    "Day4": "",
                    "Day5": ""
                }
            }
        })
        return newarr;
    });
})

let TempToRows = new Map();
TempToRows.set("University", 7);
TempToRows.set("School", 6);

template.subscribe(value => {
    if(value == "Custom"){
        return;
    }

    rows.set(TempToRows.get(value));
})