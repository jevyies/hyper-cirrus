import { procurementAPI } from "../../axios";

export const actions = {

    //Rfq
    GetSingleRfq(context, data){
        return procurementAPI.get(`Rfq/${data}`);
    },
    GetRFQCarts(context, data){
        return procurementAPI.get(`Rfq/Draft/${data}`);
    },
    GetReturnedRfq(context, data){
        return procurementAPI.get(`Rfq/posted/${data}`);
    },
    GetSubmittedRfq(context, data){
        return procurementAPI.get(`Rfq/Submitted/${data}`);
    },
    GetPostedRfq(context, data){
        return procurementAPI.get(`Rfq/Posted/${data}`);
    },
    GetApprovedRfq(context, data){
        return procurementAPI.get(`Rfq/approved/${data}`);
    },
    UpdateRfq(context, data){
        return procurementAPI.put(`Rfq/${data.id}`, data);
    },
    DeleteRfq(context, data){
        return procurementAPI.delete(`Rfq/${data}`);
    },
    CreateRfq(context, data){
        return procurementAPI.post(`Rfq/CreateRfq`, data);
    },
    SubmitRfq(context, data){
        return procurementAPI.put(`Rfq/Submit/${data.id}`, data);
    },
    PostRfq(context, data){
        return procurementAPI.put(`Rfq/post/${data}`);
    },
    ApproveRfq(context, data){
        return procurementAPI.put(`Rfq/approve/${data}`);
    },
    ReturnRfq(context, data){
        return procurementAPI.put(`Rfq/return/${data.id}?remarks=${data.remarks}`);
    },
    AvailableSuppliers(context, data){
        return procurementAPI.get(`Rfq/Available/Supplier/${data}`);
    },

}