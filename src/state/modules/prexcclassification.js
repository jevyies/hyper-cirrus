import { api } from "../../axios";

export const actions = {

    // PrexcClassification
    GetPrexcClassification(){
        return api.get("PrexcClassification/GetAllPrexcClassifications");
    },
    GetSinglePrexcClassification(context, data){
        return api.get(`PrexcClassification/${data}`);
    },
    UpdatePrexcClassification(context, data){
        return api.put(`PrexcClassification/${data.id}`, data);
    },
    DeletePrexcClassification(context, data){
        return api.delete(`PrexcClassification/${data}`);
    },
    CreatePrexcClassification(context, data){
        return api.post(`PrexcClassification/CreatePrexcClassification`, data);
    },

}