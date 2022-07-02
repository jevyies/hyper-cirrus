import axios from 'axios'

export const actions = {
    createPayment(context, data)
    {
        return axios.post('/Finance/RFP/Payment/Create', data);
    },
    getSinglePayment(context, id)
    {
        return axios.get(`/Finance/RFP/Payment/${id}`);
    },
    updatePayment(context, {id, data})
    {
        return axios.put(`/Finance/RFP/Payment/${id}`, data);
    },
    deletePayment(context, id)
    {
        return axios.delete(`/Finance/RFP/Payment/${id}`);
    },
    postPayment(context, id)
    {
        return axios.put(`/Finance/RFP/Payment/Post/${id}`);
    },
    returnPayment(context, id)
    {
        return axios.put(`/Finance/RFP/Payment/Return/${id}`);
    },
    getAllPending(context, cycle)
    {
        return axios.get(`/Finance/RFP/Payment/Pending?cycle=${cycle}`);
    },
    getAllPosted(context, cycle)
    {
        return axios.get(`/Finance/RFP/Payment/Posted?cycle=${cycle}`);
    },
    getAllAvailable(context, cycle)
    {
        return axios.get(`/Finance/RFP/Payment/Available?cycle=${cycle}`);
    },
    getAllPaymentsByExpenditure(context, {id, cycle}){
        return axios.get(`/Finance/RFP/Payment/All/${id}/${cycle}`)
    }
}