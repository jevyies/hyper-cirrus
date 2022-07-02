import axios from "axios"

export const actions = {

    //Inspection IAR
    GetInspectionIar(context, data){
        return axios.get(`Inspection/Iar/${data}`);
    },
    GetInspectionIarPosted(context, data){
        return axios.get(`Inspection/Iar/Posted/${data}`);
    },
    GetInspectionIarPending(context, data){
        return axios.get(`Inspection/Iar/Pending/${data}`);
    },
    GetInspectionIarAvailable(context, data){
        return axios.get(`Inspection/Iar/Available/${data}`);
    },
    CreateInspectionIar(context, data){
        return axios.post(`Inspection/Iar/Create`, data);
    },
    CancelInspectionIar(context, data){
        return axios.post(`Inspection/Iar/Cancel`, data);
    },
    SubmitInspectionIar(context, data){
        return axios.post(`Inspection/Iar/Submit/Items`, data);
    },
    DeleteInspectionIar(context, data){
        return axios.delete(`Inspection/Iar/${data}`);
    },
    UpdateInspectionIar(context, data){
        return axios.put(`Inspection/Iar/${data.id}`, data);
    },
    PostInspectionIar(context, data){
        return axios.put(`Inspection/Iar/Post/${data.id}`, data);
    },

}