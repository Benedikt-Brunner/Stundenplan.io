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


function build_map(hours_own, hours_friend){
    let map = new Map();
    hours_own.forEach((element, index) => {
        map.set(index, []);
        hours_friend.forEach((element2, index2) => {
            map.get(index).push(determine_overlap(element, element2));
        });
    });
    return map;
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