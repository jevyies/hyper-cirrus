import { procurementAPI } from "../../axios";

export const actions = {

    // ItemDetail
    GetItemDetailByPPMPItem(context, data){
        return procurementAPI.get(`ItemDetail/ppmpItem/${data}`);
    },
    GetSingleItemDetail(context, data){
        return procurementAPI.get(`ItemDetail/${data}`);
    },
    UpdateItemDetail(context, data){
        return procurementAPI.put(`ItemDetail/${data.id}`, data);
    },
    DeleteItemDetail(context, data){
        return procurementAPI.delete(`ItemDetail/${data}`);
    },
    CreateItemDetail(context, data){
        return procurementAPI.post(`ItemDetail/CreateItemDetail`, data);
    }

}