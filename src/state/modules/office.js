import { api } from "../../axios";

export const actions = {

    // Office
    GetOffice(){
        return api.get("Office/GetAllOffices");
    },
    GetOfficeByCampus(context, data){
        return api.get(`Office/campus/${data}`);
    },
    GetSingleOffice(context, data){
        return api.get(`Office/${data}`);
    },
    UpdateOffice(context, data){
        return api.put(`Office/${data.id}`, data);
    },
    DeleteOffice(context, data){
        return api.delete(`Office/${data}`);
    },
    CreateOffice(context, data){
        return api.post(`Office/CreateOffice`, data);
    },

}