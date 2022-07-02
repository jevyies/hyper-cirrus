import axios from 'axios';

export const actions = {
    createDisbursement(context, data){
        return axios.post('/Finance/Disbursement/Create', data);
    },
    getSingleDisbursement(context, id)
    {
        return axios.get(`/Finance/Disbursement/${id}`);
    },
    updateDisbursement(context, {id, data}){
        return axios.put(`/Finance/Disbursement/${id}`, data);
    },
    deleteDisbursement(context, id){
        return axios.delete(`/Finance/Disbursement/${id}`);
    },
    postDisbursement(context, id){
        return axios.put(`/Finance/Disbursement/Post/${id}`);
    },
    approveDisbursement(context, id){
        return axios.put(`/Finance/Disbursement/Approve/${id}`);
    },
    returnDisbursement(context, id){
        return axios.put(`/Finance/Disbursement/Return/${id}`);
    },
    getPendingDisbursements(context, cycle){
        return axios.get(`/Finance/Disbursement/Pending/${cycle}`);
    },
    getApprovedDisbursements(context, cycle){
        return axios.get(`/Finance/Disbursement/Approved/${cycle}`);
    },
    getPostedDisbursements(context, cycle){
        return axios.get(`/Finance/Disbursement/Posted/${cycle}`);
    },
    getAvailableBurs(context, cycle){
        return axios.get(`/Finance/Disbursement/Available/Burs/${cycle}`);
    }

}