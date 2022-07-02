import { procurementAPI } from "../../axios";

export const actions = {

    //RfqItem
    GetRfqItems(context, data){
        return procurementAPI.get(`RfqItem/Rfq/${data}`);
    },
    GetAvailablePRs(context, data){
        return procurementAPI.get(`RfqItem/Available/${data}`);
    },
    GetSingleRfqItem(context, data){
        return procurementAPI.get(`RfqItem/${data}`);
    },
    UpdateRfqItem(context, data){
        return procurementAPI.put(`RfqItem/Update/${data.id}`, data.RfqItemDetails);
    },
    DeleteRfqItem(context, data){
        return procurementAPI.delete(`RfqItem/${data}`);
    },
    CreateRfqItem(context, data){
        return procurementAPI.post(`RfqItem/Add`, data);
    },
    CreateSingleRfqItem(context, data){
        return procurementAPI.post(`RfqItem/Add/Single`, data);
    },
    
}