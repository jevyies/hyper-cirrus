import axios from "axios";

export const actions = {
    createAccountGroup(context, data)
    {
        return axios.post("/Finance/AccountGroup/CreateAccountGroup", data);
    },
    getAccountGroup(context, data){
        return axios.get(`/Finance/AccountGroup/${data}`);
    },
    updateAccountGroup(context, {id, data}){
        return axios.put(`/Finance/AccountGroup/${id}`, data);
    },
    deleteAccountGroup(context, data){
        return axios.delete(`/Finance/AccountGroup/${data}`);
    },
    getAccountGroupByFundClassification(context, data)
    {
        return axios.get(`/Finance/AccountGroup/FundClassification/${data}`);
    },
    getAllAccountGroup(){
        return axios.get("/Finance/AccountGroup/All");
    }
}
