import { procurementAPI } from "../../axios";

export const actions = {

    // PPMPItem
    GetPPMPLogs(context, data){
        return procurementAPI.get(`PpmpLog/GetPpmpLogs?ppmId=${data}`);
    },

}