import { procurementAPI } from "../../axios";

export const actions = {

    //AprItem
    GetAllAprItems(context, data){
        return procurementAPI.get(`AprItem/${data}`);
    },
    GetSingleAprItem(context, data){
        return procurementAPI.get(`AprItem/${data}`);
    },
    GetAvailableAPPs(context, data){
        return procurementAPI.get(`AprItem/app/${data}`);
    },
    UpdateAprItem(context, data){
        return procurementAPI.put(`AprItem/${data.id}`, data);
    },
    DeleteAprItem(context, data){
        return procurementAPI.delete(`AprItem/${data}`);
    },
    CreateAprItem(context, data){
        return procurementAPI.post(`AprItem/CreateAprItem`, data);
    },
}