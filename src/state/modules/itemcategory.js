import { procurementAPI } from "../../axios";

export const actions = {

    // ItemCategory
    GetItemCategory(){
        return procurementAPI.get(`ItemCategory/GetAllItemCategories`);
    },
    GetSingleItemCategory(context, data){
        return procurementAPI.get(`ItemCategory/${data}`);
    },
    UpdateItemCategory(context, data){
        return procurementAPI.put(`ItemCategory/${data.id}`, data);
    },
    DeleteItemCategory(context, data){
        return procurementAPI.delete(`ItemCategory/${data}`);
    },
    CreateItemCategory(context, data){
        return procurementAPI.post(`ItemCategory/CreateItemCategory`, data);
    },

}