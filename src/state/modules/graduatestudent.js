import { api } from "../../axios";

export const actions = {

    //GraduateStudent
    GetGraduateStudent(context, data){
        return api.get(`GraduateStudent/target/${data}`);
    },
    GetSingleGraduateStudent(context, data){
        return api.get(`GraduateStudent/${data}`);
    },
    UpdateGraduateStudent(context, data){
        return api.put(`GraduateStudent/${data.id}`, data);
    },
    DeleteGraduateStudent(context, data){
        return api.delete(`GraduateStudent/${data}`);
    },
    CreateGraduateStudent(context, data){
        return api.post(`GraduateStudent/CreateGraduateStudent`, data);
    },

}