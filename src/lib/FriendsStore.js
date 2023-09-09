// @ts-nocheck
import { get, writable } from "svelte/store";
import Lesson from "./Lesson.js";

export let friends = writable({
    friends: [{}],
    pending: [""]
});


export function get_friends_lessons(filterList) {
    let friends_lessons = [];
    let friends_list = get(friends);
    for (let friend of friends_list.friends) {
        if (!filterList.includes(friend.id)) {
            friend.schedule.forEach(hour_block => {
                let cur_hour = hour_block.Hours;
                console.log(cur_hour);
                Object.values(hour_block).filter((value) => value !== cur_hour).forEach((lesson, index) => {
                    if(lesson.Room === "" && lesson.Subject === "" && lesson.Teacher === ""){
                        return;
                    }
                friends_lessons.push(new Lesson(lesson.Room, lesson.Subject, lesson.Teacher, [cur_hour], [`Day${index+1}`], [friend.name]));
                });
            });
        }
    }
    return friends_lessons;
}