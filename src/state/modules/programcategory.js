import { api } from "../../axios";

export const actions = {

    // ProgramCategory
    GetProgramCategory(){
        return api.get("ProgramCategory/GetAllProgramCategories");
    },
    GetSingleProgramCategory(context, data){
        return api.get(`ProgramCategory/${data}`);
    },
    UpdateProgramCategory(context, data){
        return api.put(`ProgramCategory/${data.id}`, data);
    },
    DeleteProgramCategory(context, data){
        return api.delete(`ProgramCategory/${data}`);
    },
    CreateProgramCategory(context, data){
        return api.post(`ProgramCategory/CreateProgramCategory`, data);
    },

}