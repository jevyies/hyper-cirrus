import { procurementAPI } from "../../axios";

export const actions = {

    //ConsolidatedProcurableResource
    GetPendingCPRByYear(context, data){
        return procurementAPI.get(`ConsolidatedProcurableResource/Pending/${data}`);
    },
    GetPostedCpr(context, data){
        return procurementAPI.get(`ConsolidatedProcurableResource/Posted/${data}`);
    },
    GetApprovedCpr(context, data){
        return procurementAPI.get(`ConsolidatedProcurableResource/Approved/${data}`);
    },
    GetConsolidatedProcurableResourcerovedCPR(context, data){
        return procurementAPI.get(`ConsolidatedProcurableResource/approved/${data}`);
    },
    ConsolidatedProcurableResourceroveCPR(context, data){
        return procurementAPI.put(`ConsolidatedProcurableResource/approve/${data}`);
    },
    ReturnCPR(context, data){
        return procurementAPI.put(`ConsolidatedProcurableResource/return/${data.id}?remarks=${data.remarks}`);
    },
    ApproveCPR(context, data){
        return procurementAPI.put(`ConsolidatedProcurableResource/Approve/${data}`);
    },
    PostCPR(context, data){
        return procurementAPI.put(`ConsolidatedProcurableResource/post/${data}`);
    },
    GetSingleConsolidatedProcurableResource(context, data){
        return procurementAPI.get(`ConsolidatedProcurableResource/${data}`);
    },
    UpdateCpr(context, data){
        return procurementAPI.put(`ConsolidatedProcurableResource/${data.id}`, data);
    },
    DeleteCpr(context, data){
        return procurementAPI.delete(`ConsolidatedProcurableResource/${data}`);
    },
    CreateCpr(context, data){
        return procurementAPI.post(`ConsolidatedProcurableResource/CreateConsolidatedProcurableResource`, data);
    },

}