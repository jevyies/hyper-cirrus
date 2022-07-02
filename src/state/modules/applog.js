import { procurementAPI } from "../../axios";

export const actions = {

    // APPItem
    GetAppLogs(context, data){
        return procurementAPI.get(`AppLog/GetAppLogs?appId=${data}`);
    },

}