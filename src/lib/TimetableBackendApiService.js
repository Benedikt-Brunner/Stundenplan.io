//@ts-nocheck
const API_URL = 'https://timetablebackend.shuttleapp.rs/';

export const Routes = {
    SignUp: 'userSignUp',
    SignIn: 'userSignIn',
    SignOut: 'userSignOut',
    UserData: 'userInfo',
}

export const TimetableBackendApiService = {
    async get(page) {
        let res;
        let error;
        try {
            res = await fetch(API_URL + page);
        } catch (e) {
            error = e;
        }

        return { res: await res.json(), error };
    },

    async post(page, data) {
        let res;
        let error;
        try {
            res = await fetch(API_URL + page, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        } catch (e) {
            error = e;
        }

        return { res: await res.json(), error };
    },

    async put(page, data) {
        let res;
        let error;
        try {
            res = await fetch(API_URL + page, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        } catch (e) {
            error = e;
        }

        return { res: await res.json(), error };
    },

    redirect(page) {   
        window.location.href = API_URL + page;
    },
}