import axios from "axios"

export const actions = {

    //Property Inspection
    GetPropertyInspection(context, data){
        return axios.get(`inspection/PropertyInspection/All/${data}`);
    },
    GetSinglePropertyInspection(context, data){
        return axios.get(`inspection/PropertyInspection/${data}`);
    },
    AddPropertyInspection(context, data){
        return axios.post(`inspection/PropertyInspection/Add`, data);
    },
    UpdatePropertyInspection(context, data){
        return axios.put(`inspection/PropertyInspection/${data.id}`, data);
    },
    DeletePropertyInspection(context, data){
        return axios.delete(`inspection/PropertyInspection/${data}`, data);
    },
    PostPropertyInspection(context, data){
        return axios.put(`inspection/PropertyInspection/Post/${data}`);
    },
    UnpostPropertyInspection(context, data){
        return axios.put(`inspection/PropertyInspection/Unpost/${data}`);
    },

}