import { procurementAPI } from "../../axios";

export const actions = {

    //AppItem
    GetAllCprItems(context, data){
        return procurementAPI.get(`ConsolidatedProcurableResourceItem/GetAllConsolidatedProcurableResourceItems?consolidatedProcurableResourceId=${data}`);
    },
    GetPPMPforCprItem(context, data){
        return procurementAPI.get(`ConsolidatedProcurableResourceItem/ppmp/${data}`);
    },
    GetSingleCprItem(context, data){
        return procurementAPI.get(`ConsolidatedProcurableResourceItem/${data}`);
    },
    UpdateCprItem(context, data){
        return procurementAPI.put(`ConsolidatedProcurableResourceItem/${data.id}`, data);
    },
    DeleteCprItem(context, data){
        return procurementAPI.delete(`ConsolidatedProcurableResourceItem/${data}`);
    },
    CreateCprItem(context, data){
        return procurementAPI.post(`ConsolidatedProcurableResourceItem/CreateConsolidatedProcurableResourceItem`, data);
    },

}