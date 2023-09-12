//@ts-nocheck
export default class Lesson {
    constructor(room, subject, teacher, hours, day, friends) {
        this.room = room;
        this.subject = subject;
        this.teacher = teacher;
        this.hours = hours;
        this.day = day;
        this.friends = friends;
    }

    equals(lesson) {
        return lesson.subject === this.subject && lesson.teacher === this.teacher;
    }

    merge(lesson) {
        this.hours.push(...lesson.hours);
        this.day.push(...lesson.day);
        this.friends.push(...lesson.friends);
        this.room.push(...lesson.room);
    }
}
