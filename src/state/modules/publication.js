import { api } from "../../axios";

export const actions = {

    //Publication
    GetPublicationByResearch(context, data){
        return api.get(`Publication/GetPublicationsByResearchId?researchId=${data}`);
    },
    GetPublication(){
        return api.get(`Publication/GetAllPublications`);
    },
    GetSinglePublication(context, data){
        return api.get(`Publication/${data}`);
    },
    UpdatePublication(context, data){
        return api.put(`Publication/${data.id}`, data);
    },
    DeletePublication(context, data){
        return api.delete(`Publication/${data}`);
    },
    CreatePublication(context, data){
        return api.post(`Publication/CreatePublication`, data);
    },

}