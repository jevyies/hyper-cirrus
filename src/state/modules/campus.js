import { api } from "../../axios";

export const actions = {

    // Campus
    GetCampus(){
        return api.get("Campus/GetAllCampuss");
    },
    GetCampusByAgency(context, data){
        return api.get(`Campus/Agency/${data}`);
    },
    GetSingleCampus(context, data){
        return api.get(`Campus/${data}`);
    },
    UpdateCampus(context, data){
        return api.put(`Campus/${data.id}`, data);
    },
    DeleteCampus(context, data){
        return api.delete(`Campus/${data}`);
    },
    CreateCampus(context, data){
        return api.post(`Campus/CreateCampus`, data);
    },

}