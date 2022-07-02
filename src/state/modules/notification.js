import { coreAPI } from '../../axios'
export const state = {
    type: null,
    message: null,
    hubConnection: 'https://www.cocyfms.codes/',
    notifications: [],
    error: '',
    notifCount: 0,
};

export const mutations = {
    success(state, message) {
        state.type = 'alert-success';
        state.message = message;
    },
    error(state, message) {
        state.type = 'alert-danger';
        state.message = message;
    },
    clear(state) {
        state.type = null;
        state.message = null;
    },
    setNotifs(state, data) {
        state.notifications = data;
    },
    setCount(state, data) {
        state.notifCount = data;
    },
    addNotif(state, data) {
        data.showDeleteOption = false
        state.notifications.push(data)
        state.notifCount += 1;
    },
    clearNotif(state, data) {
        state.notifications = []
    },
    setError(state, msg) {
        state.error = msg;
        if (msg) console.log(`Error: ${msg}`);
    },
    setDeleteOption(state, data){
        state.notifications[data.index].showDeleteOption = data.bool
    }
};

export const actions = {
    success({ commit }, message) {
        commit('success', message);
    },
    error({ commit }, message) {
        commit('error', message);
    },
    clear({ commit }) {
        commit('clear');
    },
    CreateNotif(context, data) {
        return coreAPI.post(`Notification/CreateNotification`, data);
    },
    GetNotif({ commit }, data) {
        coreAPI.get(`Notification/GetMyNotifications`)
            .then(res => {
                res.data.forEach(item => {item.showDeleteOption = false})
                let notifs = res.data;
                let counted = notifs.reduce((pv, cv) => {
                    return pv + (cv.status !== 'Seen' ? 1 : 0)
                }, 0)
                commit("setNotifs", notifs);
                commit("setCount", counted);
            })
            .catch(() => commit("setError", "Failed to load the notifications..."));
    },
    SeenNotif({ commit }, data) {
        coreAPI.put(`Notification/${data}`).catch(() => commit("setError", "Failed to load the notifications..."))
    },
    DeleteNotif({ commit }, data) {
        coreAPI.delete(`Notification/${data}`).catch(() => commit("setError", "Failed to load the notifications..."))
    },
    DeleteAllNotif({ commit }) {
        coreAPI.delete(`Notification`).then((res) => { commit("setNotifs", []); }).catch(() => commit("setError", "Failed to clear the notifications..."));
    }
};
