import { api } from "../../axios";

export const actions = {

    //Property Location
    GetPropertyLocation(context, data){
        return api.get(`PropertyLocation/All`);
    },
    GetSinglePropertyLocation(context, data){
        return api.get(`PropertyLocation/${data}`);
    },
    UpdatePropertyLocation(context, data){
        return api.put(`PropertyLocation/${data.id}`, data);
    },
    DeletePropertyLocation(context, data){
        return api.delete(`PropertyLocation/${data}`);
    },
    CreatePropertyLocation(context, data){
        return api.post(`PropertyLocation/Create`, data);
    },

}