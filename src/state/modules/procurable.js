import { procurementAPI } from "../../axios";

export const actions = {

    //Procurable
    GetProcurables(context, data){
        return procurementAPI.get(`Procurable/All/${data.cycle}?Take=${data.take}&LastId=${data.lastId}`);
    },
    GetProcurableRows(context, data){
        return procurementAPI.get(`Procurable/All/Total/${data.cycle}`);
    },
    GetAvailableFSProcurables(context, data){
        return procurementAPI.get(`Procurable/Available/${data.cycle}/${data.fsId}`);
    },
    AllowPR(context, data){
        return procurementAPI.put(`Procurable/AllowPr/${data.id}?allowPr=${data.pr}`);
    },
}