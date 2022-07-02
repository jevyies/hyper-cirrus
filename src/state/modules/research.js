import { api } from "../../axios";

export const actions = {

    //Research
    GetResearchByUnit(context, data){
        return api.get(`Research/research/${data}`);
    },
    GetSingleResearch(context, data){
        return api.get(`Research/${data}`);
    },
    UpdateResearch(context, data){
        return api.put(`Research/${data.id}`, data);
    },
    DeleteResearch(context, data){
        return api.delete(`Research/${data}`);
    },
    CreateResearch(context, data){
        return api.post(`Research/CreateResearch`, data);
    },

}