//@ts-nocheck
const API_URL = 'https://timetablebackend.shuttleapp.rs/';

export const Routes = {
    SignUp: 'userSignUp',
}

export const TimetableBackendApiService = {
    async get(page) {
        return (await fetch(API_URL + page)).json();
    },

    async post(page, data) {
        return (await fetch(API_URL + page, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })).json();
    },

    async put(page, data) {
        return (await fetch(API_URL + page, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })).json();
    },

    redirect(page) {   
        window.location.href = API_URL + page;
    },
}