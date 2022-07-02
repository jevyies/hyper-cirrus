import { getFirebaseBackend } from '../../authUtils.js'
import axios from "axios"

export const state = {
    currentUser: sessionStorage.getItem('authUser'),
    user: localStorage.getItem('user'),
}

export const mutations = {
    SET_CURRENT_USER(state, newValue) {
        state.currentUser = newValue
        saveState('auth.currentUser', newValue)
    },
}

export const getters = {
    // Whether the user is currently logged in.
    loggedIn(state) {
        return !!state.currentUser
    },
}

export const actions = {
    // This is automatically run in `src/state/store.js` when the app
    // starts, along with any other actions named `init` in other modules.
    // eslint-disable-next-line no-unused-vars
    init({ state, dispatch }) {
        dispatch('validate')
    },

    // Logs in the current user.
    logIn({ commit, dispatch, getters }, { user } = {}) {
        if (getters.loggedIn) return dispatch('validate')
        commit('SET_CURRENT_USER', user)
        return user
    },

    // Logs out the current user.
    logOut({ commit }) {
        // eslint-disable-next-line no-unused-vars
        commit('SET_CURRENT_USER', null)
        return true;
    },

    // register the user
    register({ commit, dispatch, getters }, { email, password } = {}) {
        if (getters.loggedIn) return dispatch('validate')

        return getFirebaseBackend().registerUser(email, password).then((response) => {
            const user = response
            commit('SET_CURRENT_USER', user)
            return user
        });
    },

    // register the user
    // eslint-disable-next-line no-unused-vars
    resetPassword({ commit, dispatch, getters }, { email } = {}) {
        if (getters.loggedIn) return dispatch('validate')

        return getFirebaseBackend().forgetPassword(email).then((response) => {
            const message = response.data
            return message
        });
    },

    // Validates the current user's token and refreshes it
    // with new data from the API.
    // eslint-disable-next-line no-unused-vars
    validate({ commit, state }) {
        if (!state.currentUser) return Promise.resolve(null)
        const user = getFirebaseBackend().getAuthenticatedUser();
        commit('SET_CURRENT_USER', user)
        return user;
    },
    googleLogin(context, googleToken){
        return axios.post('/api/Account/Login/Google', googleToken)
    },
    createAccount(content, data)
    {
        return axios.post('/api/Account/Create', data)
    },
    updateCredentials(content, {id, data})
    {
        return axios.put(`/api/Account/${id}`, data)
    },
    sendEmailConfirmation(context, {email, url})
    {
        return axios.post(`/api/Account/Email/Confirmation/Send?email=${email}&url=${url}`)
    },
    verifyEmail(context, data)
    {
        return axios.post('/api/Account/Email/Confirmation/Verify', data)
    }

}

// ===
// Private helpers
// ===

function saveState(key, state) {
    window.localStorage.setItem(key, JSON.stringify(state))
}
