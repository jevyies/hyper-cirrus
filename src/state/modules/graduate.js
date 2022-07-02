import { api } from "../../axios";

export const actions = {

    //Graduate
    GetGraduate(){
        return api.get("Graduate/GetAllGraduates");
    },
    GetGraduateByProgram(context, data){
        return api.get(`Graduate/program/${data}`);
    },
    GetSingleGraduate(context, data){
        return api.get(`Graduate/${data}`);
    },
    UpdateGraduate(context, data){
        return api.put(`Graduate/${data.id}`, data);
    },
    DeleteGraduate(context, data){
        return api.delete(`Graduate/${data}`);
    },
    CreateGraduate(context, data){
        return api.post(`Graduate/CreateGraduate`, data);
    },

}