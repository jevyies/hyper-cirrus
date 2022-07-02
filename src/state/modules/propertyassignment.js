import axios from "axios"

export const actions = {

    // Property Assignment
    GetPropertyAssignment(context, data){
        return axios.get(`property/PropertyAssignment/All/${data}`);
    },
    GetSinglePropertyAssignment(context, data){
        return axios.get(`property/PropertyAssignment/${data}`);
    },
    UpdatePropertyAssignment(context, data){
        return axios.put(`property/PropertyAssignment/${data.propertyId}`, data);
    },
    DeletePropertyAssignment(context, data){
        return axios.delete(`property/PropertyAssignment/${data}`);
    },
    AddPropertyAssignment(context, data){
        return axios.post(`property/PropertyAssignment/Add`, data);
    },
    ReturnPropertyAssignment(context, data){
        return axios.put(`property/PropertyAssignment/Return/${data.id}`, data);
    },

}