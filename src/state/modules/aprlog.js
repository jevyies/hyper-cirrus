import { procurementAPI } from "../../axios";

export const actions = {

    // APPItem
    GetAprLogs(context, data){
        return procurementAPI.get(`AprLog/GetAprLogs?aprId=${data}`);
    },

}