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
            res = await fetch(API_URL + page, {
                method: 'GET',
                credentials: 'include',
            });
        } catch (e) {
            error = e;
        }

        return { res: res, error };
    },

    async post(page, data) {
        let res;
        let error;
        try {
            res = await fetch(API_URL + page, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        } catch (e) {
            error = e;
        }

        return { res: res, error };
    },

    async put(page, data) {
        let res;
        let error;
        try {
            res = await fetch(API_URL + page, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        } catch (e) {
            error = e;
        }

        return { res: res, error };
    },

    redirect(page) {   
        window.location.href = API_URL + page;
    },
}