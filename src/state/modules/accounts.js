import axios from "axios";

export const actions = {
    createAccounts(context, data)
    {
        return axios.post("/Finance/Accounts/CreateAccount", data);
    },
    getSingleAccount(context, data){
        return axios.get(`/Finance/Accounts/${data}`);
    },
    updateAccount(context, {id, data}){
        return axios.put(`/Finance/Accounts/${id}`, data);
    },
    deleteAccount(context, data){
        return axios.delete(`/Finance/Accounts/${data}`);
    },
    getAccountByAccountGroup(context, data)
    {
        return axios.get(`/Finance/Accounts/AccountGroup/${data}`);
    },
    getAllAccounts(){
        return axios.get("/Finance/Accounts/All");
    }
}