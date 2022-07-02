import { procurementAPI } from "../../axios";

export const actions = {

    // PRItem
    GetPRLogs(context, data){
        return procurementAPI.get(`PrLog/GetPrLogs?prId=${data}`);
    },

}