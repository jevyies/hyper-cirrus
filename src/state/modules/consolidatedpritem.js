import { procurementAPI } from "../../axios";

export const actions = {

    // ConsolidatedPrItem
    GetConsolidatedPrItems(context, data){
        return procurementAPI.get(`ConsolidatedPrItem/ConsolidatedPr/${data}`);
    },
    GetAvailablePr(context, data){
        return procurementAPI.get(`ConsolidatedPrItem/Available/PR/${data}`);
    },
    GetSingleConsolidatedPrItem(context, data){
        return procurementAPI.get(`ConsolidatedPrItem/${data}`);
    },
    UpdateConsolidatedPrItem(context, data){
        return procurementAPI.put(`ConsolidatedPrItem/${data.id}`, data);
    },
    DeleteConsolidatedPrItem(context, data){
        return procurementAPI.delete(`ConsolidatedPrItem/${data}`);
    },
    CreateConsolidatedPrItem(context, data){
        return procurementAPI.post(`ConsolidatedPrItem/Add/Multiple`, data);
    },

}