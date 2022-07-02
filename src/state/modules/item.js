import { procurementAPI } from "../../axios";

export const actions = {

    // Item
    GetItem(){
        return procurementAPI.get(`Item/GetAllItems`);
    },
    GetSingleItem(context, data){
        return procurementAPI.get(`Item/${data}`);
    },
    UpdateItem(context, data){
        return procurementAPI.put(`Item/${data.id}`, data);
    },
    DeleteItem(context, data){
        return procurementAPI.delete(`Item/${data}`);
    },
    CreateItem(context, data){
        return procurementAPI.post(`Item/CreateItem`, data);
    },

}