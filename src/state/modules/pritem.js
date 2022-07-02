import { procurementAPI } from "../../axios";

export const actions = {

    //PrItem
    GetPrItems(context, data){
        return procurementAPI.get(`PrItem/PR/${data}`);
    },
    GetAvailableAPIs(context, data){
        return procurementAPI.get(`PrItem/Available/${data}`);
    },
    GetSinglePrItem(context, data){
        return procurementAPI.get(`PrItem/${data}`);
    },
    UpdatePrItem(context, data){
        return procurementAPI.put(`PrItem/Update/${data.id}`, data.prItemDetails);
    },
    DeletePrItem(context, data){
        return procurementAPI.delete(`PrItem/${data}`);
    },
    CreatePrItem(context, data){
        return procurementAPI.post(`PrItem/Add`, data);
    },
    
}