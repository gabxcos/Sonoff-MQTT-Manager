import { writable } from "svelte/store";

// Authentication global store
function isAuthenticated(){
    const { subscribe, set } = writable(false);

    return {
        subscribe,
        useLocalStorage: () => {
            let isAuthOnMount = localStorage.getItem("jwt")!==null 
            && localStorage.getItem("expireDate") !== null 
            && (new Date(Date.now())) < (new Date(localStorage.getItem("expireDate")));

            set(isAuthOnMount);
        },
        login: (authToken, expireDate) => {
            localStorage.setItem("jwt", authToken);
            localStorage.setItem("expireDate", expireDate);

            set(true);
        },
        logout: () => {
            localStorage.removeItem("jwt");
            localStorage.removeItem("expireDate");

            set(false);
        }
    }
}

// User state global store
function userState(){
    const { subscribe, set, update } = writable(null);

    return {
        subscribe,
        useLocalStorage: () => {
            let nickname = localStorage.getItem("nickname");
            let topics = localStorage.getItem("topics");

            if(nickname !== null && topics !== null){
                set({
                    nickname: nickname,
                    topics: topics
                })
            }else set(null);
        },
        setUser: (nickname, topics) => {

            localStorage.setItem("nickname", nickname);
            localStorage.setItem("topics", topics);

            set({
                nickname: nickname,
                topics: topics
            })
        },

        updateTopics: (topics) => update(us => { return {nickname: us.nickname, topics: topics } }),

        logout: () => {
            localStorage.removeItem("nickname");
            localStorage.removeItem("topics");
            set(null);
        }
    }
}

export const isAuth = isAuthenticated();
export const user = userState();