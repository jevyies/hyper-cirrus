import { api } from "../../axios";

export const actions = {

    //ResearchCategory
    GetResearchCategory(){
        return api.get(`ResearchCategory/GetAllResearchCategories`);
    },
    GetSingleResearchCategory(context, data){
        return api.get(`ResearchCategory/${data}`);
    },
    UpdateResearchCategory(context, data){
        return api.put(`ResearchCategory/${data.id}`, data);
    },
    DeleteResearchCategory(context, data){
        return api.delete(`ResearchCategory/${data}`);
    },
    CreateResearchCategory(context, data){
        return api.post(`ResearchCategory/CreateResearchCategory`, data);
    },

}