import { api } from "../../axios";

export const actions = {

    // Examination
    GetExamination(){
        return api.get("Examination/GetAllExaminationCategories");
    },
    GetSingleExamination(context, data){
        return api.get(`Examination/${data}`);
    },
    UpdateExamination(context, data){
        return api.put(`Examination/${data.id}`, data);
    },
    DeleteExamination(context, data){
        return api.delete(`Examination/${data}`);
    },
    CreateExamination(context, data){
        return api.post(`Examination/CreateExamination`, data);
    },

}