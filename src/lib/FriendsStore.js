// @ts-nocheck
import { get, writable } from "svelte/store";
import Lesson from "./Lesson.js";

export let friends = writable({
    friends: [{}],
    pending: [""]
});

export let filterList = writable([]);


export function get_friends_lessons() {
    let result_object = {
        lessons: [],
        lessons_merged: []
    };
    let friends_lessons = [];
    let friends_list = get(friends);
    for (let friend of friends_list.friends) {
        if (!get(filterList).includes(friend.name)) {
            friend.schedule.forEach(hour_block => {
                let cur_hour = hour_block.Hours;
                Object.values(hour_block).filter((value) => value !== cur_hour).forEach((lesson, index) => {
                    if(lesson.Room === "" && lesson.Subject === "" && lesson.Teacher === ""){
                        return;
                    }
                friends_lessons.push(new Lesson([lesson.Room], lesson.Subject, lesson.Teacher, [cur_hour], [`Day${index+1}`], [friend.name]));
                });
            });
        }
    }
    result_object.lessons = JSON.parse(JSON.stringify(friends_lessons));
    result_object.lessons_merged = merge(friends_lessons)
    return result_object;
}


/**
 * @param {Array<Lesson>} arr
 */
function merge(arr){

    let merged = [];
    while(arr.length > 0){
       let cur = arr.pop();
       let indeces = [];
       arr.forEach((lesson, index) => {
              if(lesson.equals(cur)){
                cur.merge(lesson);
                indeces.push(index);
              }
         });
         indeces.forEach((index,offset) => arr.splice(index-offset, 1));
         merged.push(cur);
    }
    return merged;
}
