import { procurementAPI } from "../../axios";

export const actions = {

    //Ppmp
    GetPpmpByApi(context, data){
        return procurementAPI.get(`Ppmp/api/${data}`);
    },
    GetPpmpPostedByCycle(context, data){
        return procurementAPI.get(`Ppmp/posted/${data}`);
    },
    GetPpmpByOBI(context, data){
        return procurementAPI.get(`Ppmp/deliveryUnitBudgetItem/${data}`);
    },
    GetSinglePpmp(context, data){
        return procurementAPI.get(`Ppmp/${data}`);
    },
    GetPostedPpmp(context, data){
        return procurementAPI.get(`Ppmp/posted/${data}`);
    },
    GetApprovedPpmp(context, data){
        return procurementAPI.get(`Ppmp/approved/${data}`);
    },
    UpdatePpmp(context, data){
        return procurementAPI.put(`Ppmp/${data.id}`, data);
    },
    DeletePpmp(context, data){
        return procurementAPI.delete(`Ppmp/${data}`);
    },
    CreatePpmp(context, data){
        return procurementAPI.post(`Ppmp/CreatePpmp`, data);
    },
    PostPpmp(context, data){
        return procurementAPI.put(`Ppmp/post/${data}`);
    },
    ApprovePpmp(context, data){
        return procurementAPI.put(`Ppmp/approve/${data.id}?allowPrWithoutApp=${data.allowPrWithoutApp}`);
    },
    ReturnPpmp(context, data){
        return procurementAPI.put(`Ppmp/return/${data.id}?remarks=${data.remarks}`);
    },

}