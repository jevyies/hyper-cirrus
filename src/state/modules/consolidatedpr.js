import { procurementAPI } from "../../axios";

export const actions = {

    // ConsolidatedPr
    GetConsolidatedPr(context, data){
        return procurementAPI.get(`ConsolidatedPr/All/${data}`);
    },
    GetSingleConsolidatedPr(context, data){
        return procurementAPI.get(`ConsolidatedPr/${data}`);
    },
    GetPostedConsolidatedPr(context, data){
        return procurementAPI.get(`ConsolidatedPr/Posted/${data}`);
    },
    PostConsolidatedPr(context, data){
        return procurementAPI.put(`ConsolidatedPr/post/${data}`);
    },
    ReturnConsolidatedPr(context, data){
        return procurementAPI.put(`ConsolidatedPr/${data}`);
    },
    UpdateConsolidatedPr(context, data){
        return procurementAPI.put(`ConsolidatedPr/${data.id}`, data);
    },
    DeleteConsolidatedPr(context, data){
        return procurementAPI.delete(`ConsolidatedPr/${data}`);
    },
    CreateConsolidatedPr(context, data){
        return procurementAPI.post(`ConsolidatedPr/CreateConsolidatedPr`, data);
    },

}