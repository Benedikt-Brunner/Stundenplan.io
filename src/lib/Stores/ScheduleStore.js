// @ts-nocheck
import { get, writable } from "svelte/store";
import { get_friends_lessons} from "./FriendsStore";
import { changed } from "./changedStore";
export const fullweektoogle = writable(false);
export const template = writable("University");
export const rows = writable(7);
export const schedule = writable(new Array(7).fill("").map(() => {return makeStdhr()}));

let uniMap = new Map();

let schoolMap = new Map();


let MapMap = new Map();
MapMap.set("University", uniMap);
MapMap.set("School", schoolMap);

uniMap.set(0, "08:00 - 09:40");
uniMap.set(1, "09:50 - 11:30");
uniMap.set(2, "11:40 - 13:20");
uniMap.set(3, "13:30 - 15:10");
uniMap.set(4, "15:20 - 17:00");
uniMap.set(5, "17:10 - 18:50");
uniMap.set(6, "19:00 - 20:40");

schoolMap.set(0, "07:45 - 08:30");
schoolMap.set(1, "08:30 - 09:15");
schoolMap.set(2, "09:15 - 09:35");
schoolMap.set(3, "09:35 - 10:20");
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

function fiveToSeven(old){
    return {...old, Day6: {
        "Subject": "",
        "Teacher": "",
        "Room": ""
    }, Day7: {
        "Subject": "",
        "Teacher": "",
        "Room": ""
    }}
}

function sevenToFive(old){
    return {"Hours": old.Hours, "Day1": old.Day1, "Day2": old.Day2, "Day3": old.Day3, "Day4": old.Day4, "Day5": old.Day5}
}

fullweektoogle.subscribe(value => {
    schedule.update(old => {
        let newarr = old;
        if(value){
            newarr = newarr.map(fiveToSeven);
        }else{
            newarr = newarr.map(sevenToFive);
        }
        return newarr;
    });
    changed.set(true);
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

schedule.subscribe(value => {
    value.forEach(element => {
        if(Array.isArray(element.Hours)){
            element.Hours = element.Hours.join(' - ');
        }
    });
});

function getHoursasInts(){
    let hours = [];
    get(schedule).forEach(element => {
        if(element.Hours.includes('-')){
            let temp = element.Hours.split('-');
            temp.forEach((element) =>{element.trim()});
            hours.push(temp);
        }
    });
    hours = hours.map(element => {
        return element.map((element) => {
            return parseInt(element.split(':')[0])*100 + parseInt(element.split(':')[1]);
    });
    });
    return hours;
}

function getInsertionPoints(lesson){
    let lesson_start = parseInt(lesson.hours[0].split('-')[0].split(':')[0])*100 + parseInt(lesson.hours[0].split('-')[0].split(':')[1]);
    let lesson_end = parseInt(lesson.hours[0].split('-')[1].split(':')[0])*100 + parseInt(lesson.hours[0].split('-')[1].split(':')[1]);
    let hours = getHoursasInts();
    let insertion_points = [];
    hours.forEach((element, index) => {
        if(
            (element[0] <= lesson_start && lesson_start <= element[1] && element[0] <= lesson_end && element[1] <= lesson_end)||
            (lesson_start <= element[0] && lesson_start <= element[1] && element[0] <= lesson_end && element[1] <= lesson_end)||
            (lesson_start <= element[0] && lesson_start <= element[1] && element[0] <= lesson_end && lesson_end <= element[1])
        ){
            insertion_points.push(index);
        }
    });
    return insertion_points;
}

function get_insertion_points_for_merged_lesson(lesson){
    let insertion_points_and_days = [];
    let days = lesson.day;
    let hours = lesson.hours;

    days.forEach((day, index) => {
        let insertion_points = getInsertionPoints({hours: [hours[index]], day: [day]});
        insertion_points.forEach((element) => {
            insertion_points_and_days.push({day: day, hour: element});
        });
    });
        return insertion_points_and_days;
}

export function get_lessons_for_insertion_point(day, hour){
    let res_ray = [];
    let lessons = get_friends_lessons().lessons;
    lessons = lessons.filter((element) => element.day.includes(day));
    lessons = lessons.filter((element) => getInsertionPoints(element).includes(hour));
    return lessons;
}

export function insert_merged_lesson(lesson){
    let merged_lesson = get_friends_lessons().lessons_merged.filter((element) => element.equals(lesson))[0];
    let insertion_points = get_insertion_points_for_merged_lesson(merged_lesson);
    insertion_points.forEach((element, index) => {
        schedule.update(old => {
            let newarr = old;
            newarr[element.hour][element.day].Subject = merged_lesson.subject;
            newarr[element.hour][element.day].Teacher = merged_lesson.teacher;
            newarr[element.hour][element.day].Room = merged_lesson.room[0];
            return newarr;
        });
});
}



