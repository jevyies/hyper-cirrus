import { api } from "../../axios";

export const actions = {

    // Program
    GetProgram(){
        return api.get("Program/GetAllProgramCategories");
    },
    GetProgramByCategory(context, data){
        return api.get(`Program/category/${data}`);
    },
    GetSingleProgram(context, data){
        return api.get(`Program/${data}`);
    },
    UpdateProgram(context, data){
        return api.put(`Program/${data.id}`, data);
    },
    DeleteProgram(context, data){
        return api.delete(`Program/${data}`);
    },
    CreateProgram(context, data){
        return api.post(`Program/CreateProgram`, data);
    },

}