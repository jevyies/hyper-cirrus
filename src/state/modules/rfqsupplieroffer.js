import { procurementAPI } from "../../axios";

export const actions = {

    //RfqSupplierOffer
    GetSingleRSO(context, data){
        return procurementAPI.get(`RfqSupplierOffer/${data}`);
    },
    UpdateRSO(context, data){
        return procurementAPI.put(`RfqSupplierOffer/${data.id}`, data);
    },
    DeleteRSO(context, data){
        return procurementAPI.delete(`RfqSupplierOffer/${data}`);
    },
    CreateRSO(context, data){
        return procurementAPI.post(`RfqSupplierOffer/Create`, data);
    },
    
}