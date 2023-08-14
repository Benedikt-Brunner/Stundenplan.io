import { get, writable } from "svelte/store";
export const template = writable("University");
export const rows = writable(7);
export const schedule = writable(new Array(7).fill("").map(() => {return makeStdhr()}));

let uniMap = new Map();

let schoolMap = new Map();


let MapMap = new Map();
MapMap.set("University", uniMap);
MapMap.set("School", schoolMap);

uniMap.set(0, "8:00 - 9:40");
uniMap.set(1, "9:50 - 11:30");
uniMap.set(2, "11:40 - 13:20");
uniMap.set(3, "13:30 - 15:10");
uniMap.set(4, "15:20 - 17:00");
uniMap.set(5, "17:10 - 18:50");
uniMap.set(6, "19:00 - 20:40");

schoolMap.set(0, "7:45 - 8:30");
schoolMap.set(1, "8:30 - 9:15");
schoolMap.set(2, "9:15 - 9:35");
schoolMap.set(3, "9:35 - 10:20");
schoolMap.set(4, "10:20 - 11:10");
schoolMap.set(5, "11:10 - 11:25");
schoolMap.set(6, "11:25 - 12:10");
schoolMap.set(7, "12:15 - 12:55");
schoolMap.set(8, "12:55 - 13:45");
schoolMap.set(9, "13:45 - 14:30");
schoolMap.set(10, "14:30 - 15:15");
schoolMap.set(11, "15:20 - 16:05");
schoolMap.set(12, "16:05 - 16:50");
schoolMap.set(13, "16:50 - 17:35");
schoolMap.set(14, "17:35 - 18:20");

rows.subscribe(value => {
    schedule.update(old => {
        let newarr = new Array(value);
        let temptemplate = get(template);
        if(temptemplate != "Custom"){
            newarr = newarr.fill("").map(() => {return makeStdhr()})
            newarr.forEach((element, index) => {
                element.Hours =  MapMap.get(temptemplate).get(index) ;
            });
            return newarr;
        }

        let len = old.length > value ? value : old.length;
        let temp = old.slice(0, len);
        temp.forEach((element, index) => {
            newarr[index] = element;
        });
        newarr.fill("", len);
        newarr.map((element, index) => {
            if (element == "") {
                newarr[index] = makeStdhr();
            }
        })
        return newarr;
    });
})

let TempToRows = new Map();
TempToRows.set("University", 7);
TempToRows.set("School", 15);


template.subscribe(value => {
    if(value == "Custom"){
        return;
    }
    if(get(rows) == TempToRows.get(value)){
        schedule.update(old => {
            let newarr = old;
            newarr.forEach((element, index) => {
                element.Hours =  MapMap.get(value).get(index) ;
                
            });
            return newarr;
        });
        return;
    }
    rows.set(TempToRows.get(value));
})


function makeStdhr(){
    return {
        "Hours": "",
        "Day1": {
            "Subject": "",
            "Teacher": "",
            "Room": ""
        },
        "Day2": {
            "Subject": "",
            "Teacher": "",
            "Room": ""
        },
        "Day3": {
            "Subject": "",
            "Teacher": "",
            "Room": ""
        },
        "Day4": {
            "Subject": "",
            "Teacher": "",
            "Room": ""
        },
        "Day5": {
            "Subject": "",
            "Teacher": "",
            "Room": ""
        }
    }
}