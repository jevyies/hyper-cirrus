import { procurementAPI } from "../../axios";

export const actions = {

    //Pr
    GetPrByCycle(context, data){
        return procurementAPI.get(`Pr/My/${data}`);
    },
    GetSinglePr(context, data){
        return procurementAPI.get(`Pr/${data}`);
    },
    GetPRCarts(context, data){
        return procurementAPI.get(`Pr/Draft/${data}`);
    },
    GetPostedPr(context, data){
        return procurementAPI.get(`Pr/posted/${data}`);
    },
    GetApprovedPr(context, data){
        return procurementAPI.get(`Pr/approved/${data}`);
    },
    GetReturnedPr(context, data){
        return procurementAPI.get(`Pr/Returned/${data}`);
    },
    UpdatePr(context, data){
        return procurementAPI.put(`Pr/${data.id}`, data);
    },
    DeletePr(context, data){
        return procurementAPI.delete(`Pr/${data}`);
    },
    CreatePr(context, data){
        return procurementAPI.post(`Pr/CreatePr`, data);
    },
    PostPr(context, data){
        return procurementAPI.put(`Pr/post/${data.id}`, data);
    },
    ApprovePr(context, data){
        return procurementAPI.put(`Pr/approve/${data}`);
    },
    ReturnPr(context, data){
        return procurementAPI.put(`Pr/return/${data.id}?remarks=${data.remarks}`);
    },
    GetMyFSperCycle(context, data){
        return procurementAPI.get(`Pr/FundSources/${data}`);
    },


}