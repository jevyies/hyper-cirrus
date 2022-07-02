import { procurementAPI } from "../../axios";

export const actions = {

    //AppItem
    GetAllAppItems(context, data){
        return procurementAPI.get(`AppItem/GetAllAppItems?appId=${data}`);
    },
    GetPPMPforAppItem(context, data){
        return procurementAPI.get(`AppItem/ppmp/${data}`);
    },
    GetSingleAppItem(context, data){
        return procurementAPI.get(`AppItem/${data}`);
    },
    UpdateAppItem(context, data){
        return procurementAPI.put(`AppItem/${data.id}`, data);
    },
    DeleteAppItem(context, data){
        return procurementAPI.delete(`AppItem/${data}`);
    },
    CreateAppItem(context, data){
        return procurementAPI.post(`AppItem/CreateAppItem`, data);
    },

}