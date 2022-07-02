import { procurementAPI } from "../../axios";

export const actions = {

    //PrItemDetail
    GetPrItemDetails(context, data){
        return procurementAPI.get(`PrItemDetail/prItem/${data}`);
    },
    GetSinglePrItemDetail(context, data){
        return procurementAPI.get(`PrItemDetail/${data}`);
    },
    UpdatePrItemDetail(context, data){
        return procurementAPI.put(`PrItemDetail/${data.id}`, data);
    },
    DeletePrItemDetail(context, data){
        return procurementAPI.delete(`PrItemDetail/${data}`);
    },
    CreatePrItemDetail(context, data){
        return procurementAPI.post(`PrItemDetail/CreatePrItemDetail`, data);
    },
    
}