import { procurementAPI } from "../../axios";

export const actions = {

    // ApiResoureLog
    GetApiResourceLogs(context, data){
        return procurementAPI.get(`ApiResourceLog/GetApiResourceLogs?apiResourceId=${data}`);
    },

}