// @ts-nocheck
import {writable, get} from "svelte/store";
import { schedule } from "./ScheduleStore";

const colors = {
    red: "rgba(194, 43, 8, 0.6)",
    green: "rgba(17, 148, 10, 0.6)",
    yellow: "rgba(201, 214, 40, 0.6)",
    blue: "rgba(21, 13, 125, 0.6)"
}

const overlaps = {
    no_overlap: 0,
    full_overlap: 1,
    partial_overlap: 2,
}


const overlap_colors = {
    no_overlap: colors.green,
    full_overlap: colors.red,
    partial_overlap: colors.yellow,
    overlap_same_class: colors.blue
}

export const comparing = writable({
    is_comparing: false,
    friend: {}
});


export function get_table_pattern(){
    if(!get(comparing).is_comparing){
        return [];
    }

    if(Array.isArray(get(comparing).friend)){
        let pattern = [];
    let own_days = Object.keys(get(schedule)[0]).length - 1;
    let friends_days = get(comparing).friend.map((element) => {Object.keys(element.schedule[0]).length - 1}).reduce((a, b) => {return Math.min(a, b)});
    let own_hours_as_int = getHoursasInts(get(schedule));
    let friends_hours_as_int = get(comparing).friend.map((element) => {
        return getHoursasInts(element.schedule);
    });
    
    for(let i = 0; i < own_hours_as_int.length; i++){
        pattern.push([]);
        for(let j = 0; j < own_days; j++){
            pattern[i].push("");
        }
    }
    let overlap_map = build_map_from_arr(own_hours_as_int, friends_hours_as_int);
    pattern.forEach((_, index) => {
        let overlaps_arr = overlap_map.get(index);
        _.forEach((_, index2) => {
            let res = overlap_colors.no_overlap;
            if(index2 >= friends_days){
                pattern[index][index2] = res;
                return;
            }
            let own_day = get(schedule)[index][`Day${index2+1}`];
            overlaps_arr.forEach((element, index3) => {
                if(element === overlaps.no_overlap){

                }else if((element === overlaps.full_overlap || element === overlaps.partial_overlap) && is_lesson(own_day) && is_lesson_from_arr(get(comparing).friend.map((f) => {return f.schedule[index3][`Day${index2+1}`]})) && is_same_lesson_from_arr(own_day, get(comparing).friend.map((f) => {return f.schedule[index3][`Day${index2+1}`]}))){
                    res = overlap_colors.overlap_same_class;
                }else if((element === overlaps.full_overlap) && (is_lesson(own_day) || is_lesson_from_arr(get(comparing).friend.map((f) => {return f.schedule[index3][`Day${index2+1}`]})))){
                    if(res !== overlap_colors.overlap_same_class){
                        res = overlap_colors.full_overlap;
                    }
                }else if((element === overlaps.partial_overlap) && (is_lesson(own_day) || is_lesson_from_arr(get(comparing).friend.map((f) => {return f.schedule[index3][`Day${index2+1}`]})))){
                    if(res !== overlap_colors.full_overlap && res !== overlap_colors.overlap_same_class){
                        res = overlap_colors.partial_overlap;
                    }
                }
        });
        pattern[index][index2] = res;
    });
    });

    return pattern;
    }

    let pattern = [];
    let own_days = Object.keys(get(schedule)[0]).length - 1;
    let friend_days = Object.keys(get(comparing).friend.schedule[0]).length - 1;
    let own_hours_as_int = getHoursasInts(get(schedule));
    let friend_hours_as_int = getHoursasInts(get(comparing).friend.schedule);
    
    for(let i = 0; i < own_hours_as_int.length; i++){
        pattern.push([]);
        for(let j = 0; j < own_days; j++){
            pattern[i].push("");
        }
    }
    let overlap_map = build_map(own_hours_as_int, friend_hours_as_int);
    pattern.forEach((_, index) => {
        let overlaps_arr = overlap_map.get(index);
        _.forEach((_, index2) => {
            let res = overlap_colors.no_overlap;
            if(index2 >= friend_days){
                pattern[index][index2] = res;
                return;
            }
            let own_day = get(schedule)[index][`Day${index2+1}`];
            overlaps_arr.forEach((element, index3) => {
                if(element === overlaps.no_overlap){

                }else if((element === overlaps.full_overlap || element === overlaps.partial_overlap) && is_lesson(own_day) && is_lesson(get(comparing).friend.schedule[index3][`Day${index2+1}`]) && is_same_lesson(own_day, get(comparing).friend.schedule[index3][`Day${index2+1}`])){
                    res = overlap_colors.overlap_same_class;
                }else if((element === overlaps.full_overlap) && (is_lesson(own_day) || is_lesson(get(comparing).friend.schedule[index3][`Day${index2+1}`]))){
                    if(res !== overlap_colors.overlap_same_class){
                        res = overlap_colors.full_overlap;
                    }
                }else if((element === overlaps.partial_overlap) && (is_lesson(own_day) || is_lesson(get(comparing).friend.schedule[index3][`Day${index2+1}`]))){
                    if(res !== overlap_colors.full_overlap && res !== overlap_colors.overlap_same_class){
                        res = overlap_colors.partial_overlap;
                    }
                }
        });
        pattern[index][index2] = res;
    });
    });

    return pattern;
}


function getHoursasInts(passed_schedule){
    let hours = [];
    passed_schedule.forEach(element => {
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

function is_lesson(day){
    return day.Subject !== "" || day.Teacher !== "" || day.Room !== "";
}

function is_lesson_from_arr(arr){
    return arr.some((element) => {
        return element.Subject !== "" || element.Teacher !== "" || element.Room !== "";
    });
}


function build_map(hours_own, hours_friend){
    let map = new Map();
    hours_own.forEach((element, index) => {
        map.set(index, []);
        hours_friend.forEach((element2, _) => {
            map.get(index).push(determine_overlap(element, element2));
        });
    });
    return map;
}

function build_map_from_arr(hours_own, hours_friend){
    let map = new Map();
    hours_own.forEach((element, index) => {
        map.set(index, []);
        hours_friend.forEach((arr, index2) =>{
            map.get(index).push([]);
            arr.forEach((element2, _) => {
                map.get(index)[index2].push(determine_overlap(element, element2));
            });
        })
    });
    map.forEach((element, index) => {
        map.set(index, reduce_arr_of_arrs(element));
    });
    return map;
}

function reduce_arr_of_arrs(arr){
    let base_len = arr[0].length;
    let hours = [];
    for(let i = 0; i < base_len; i++){
        hours.push([]);
        hours[i] = arr.map((element) => {
            return element[i];
        });
    }
    hours = hours.map((element) => {
        return element.reduce(overlap_reducer);
    });
    return hours;
}


function overlap_reducer(a, b){
    if(a === overlaps.no_overlap){
        return b;
    }else if(a === overlaps.full_overlap){
        return a;
    }else if(a === overlaps.partial_overlap){
        if(b === overlaps.full_overlap){
            return b;
        }else{
            return a;
        }
    }
}

function determine_overlap(own_hour, friend_hour){
    let overlap = overlaps.no_overlap;
    if(friend_hour[0] <= own_hour[0] && friend_hour[1] >= own_hour[1]){
        overlap = overlaps.full_overlap;
    }else if(friend_hour[0] >= own_hour[0] && friend_hour[1] <= own_hour[1] || friend_hour[0] <= own_hour[0] && friend_hour[1] <= own_hour[1] && friend_hour[1] >= own_hour[0] || friend_hour[0] >= own_hour[0] && friend_hour[0] <= own_hour[1] && friend_hour[1] >= own_hour[1]){
        overlap = overlaps.partial_overlap;
    }
    return overlap;
}

function is_same_lesson(own_lesson, friend_lesson){
    return own_lesson.Subject === friend_lesson.Subject && own_lesson.Teacher === friend_lesson.Teacher && own_lesson.Room === friend_lesson.Room;
}

function is_same_lesson_from_arr(own_lesson, friend_lessons){
    return friend_lessons.every((element) => {
        return is_same_lesson(own_lesson, element);
    });
}