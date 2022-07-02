import { financeAPI } from "../../axios";

export const actions = {
    
    //RfpPo
    GetPendingRfpPo(context, data){
        return financeAPI.get(`RFP/PO/Pending/${data}`);
    },
    GetPostedRfpPo(context, data){
        return financeAPI.get(`RFP/PO/Posted/${data}`);
    },
    GetAvailableRfpPo(context, data){
        return financeAPI.get(`RFP/PO/Available/${data}`);
    },
    GetSingleRfpPo(context, data){
        return financeAPI.get(`RFP/PO/${data}`);
    },
    UpdateRfpPo(context, data){
        return financeAPI.put(`RFP/PO/${data}`);
    },
    DeleteRfpPo(context, data){
        return financeAPI.delete(`RFP/PO/${data}`);
    },
    CreateRfpPo(context, data){
        return financeAPI.post(`RFP/PO/Create`, data);
    },
}