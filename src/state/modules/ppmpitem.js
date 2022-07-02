import { procurementAPI } from "../../axios";

export const actions = {

    // PPMPItem
    GetPPMPItemByPPMP(context, data){
        return procurementAPI.get(`PpmpItem/ppmp/${data}`);
    },
    GetSinglePPMPItem(context, data){
        return procurementAPI.get(`PpmpItem/${data}`);
    },
    UpdatePPMPItem(context, data){
        return procurementAPI.put(`PpmpItem/${data.id}`, data);
    },
    DeletePPMPItem(context, data){
        return procurementAPI.delete(`PpmpItem/${data}`);
    },
    CreatePPMPItem(context, data){
        return procurementAPI.post(`PpmpItem/CreatePpmpItem`, data);
    },

}