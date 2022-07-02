import axios from "axios"

export const actions = {
    createBurs(context, data) {
        return axios.post("/Finance/Burs/Create", data);
    },
    getSingleBurs(context, id) {
        return axios.get(`/Finance/Burs/${id}`);
    },
    updateBurs(context, {id, data}){
        return axios.put(`/Finance/Burs/${id}`, data);
    },
    deleteBurs(context, id){
        return axios.delete(`/Finance/Burs/${id}`);
    },
    postBurs(context, {id, dateApproved}){
        return axios.put(`/Finance/Burs/Post/${id}?dateApproved=${dateApproved}`);
    },
    approveBurs(context, id){
        return axios.put(`/Finance/Burs/Approve/${id}`);
    },
    returnBurs(context, id){
        return axios.put(`/Finance/Burs/Return/${id}`);
    },
    getPendingBurs(context, cycle){
        return axios.get(`/Finance/Burs/Pending/${cycle}`);
    },
    getPostedBurs(context, cycle){
        return axios.get(`/Finance/Burs/Posted/${cycle}`);
    },
    getApprovedBurs(context, cycle){
        return axios.get(`/Finance/Burs/Approved/${cycle}`);
    },
    getAvailable(context, cycle){
        return axios.get(`/Finance/Burs/Available/Rfp/${cycle}`);
    }

}