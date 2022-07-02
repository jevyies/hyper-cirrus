import { procurementAPI } from "../../axios";

export const actions = {

    //RfqSupplier
    GetSingleRfqSupplierByRFQ(context, data){
        return procurementAPI.get(`RfqSupplier/Rfq/${data}`);
    },
    GetSingleRfqSupplier(context, data){
        return procurementAPI.get(`RfqSupplier/${data}`);
    },
    UpdateRfqSupplier(context, data){
        return procurementAPI.put(`RfqSupplier/${data.id}`, data.RfqItemDetails);
    },
    DeleteRfqSupplier(context, data){
        return procurementAPI.delete(`RfqSupplier/${data}`);
    },
    CreateRfqSupplier(context, data){
        return procurementAPI.post(`RfqSupplier/Add`, data);
    },
    
}