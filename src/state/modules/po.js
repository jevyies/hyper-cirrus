import { procurementAPI } from "../../axios";

export const actions = {

    //Po
    GetPendingPo(context, data){
        return procurementAPI.get(`Po/Pending/${data}`);
    },
    GetPostedPo(context, data){
        return procurementAPI.get(`Po/Posted/${data}`);
    },
    GetSinglePo(context, data){
        return procurementAPI.get(`Po/${data}`);
    },
    UpdatePo(context, data){
        return procurementAPI.put(`Po/${data.id}`, data);
    },
    DeletePo(context, data){
        return procurementAPI.delete(`Po/${data}`);
    },
    CreatePo(context, data){
        return procurementAPI.post(`Po/Create`, data);
    },
    PostPo(context, data){
        return procurementAPI.put(`Po/Post/${data}`);
    },
    ReceivePo(context, data){
        return procurementAPI.put(`Po/Receive/${data.id}/${data.date}`);
    },
}