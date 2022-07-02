import { api } from "../../axios";

export const actions = {

    //ApiType
    GetApiType(){
        return api.get(`ApiType/GetAllApiTypes`);
    },
    GetSingleApiType(context, data){
        return api.get(`ApiType/${data}`);
    },
    UpdateApiType(context, data){
        return api.put(`ApiType/${data.id}`, data);
    },
    DeleteApiType(context, data){
        return api.delete(`ApiType/${data}`);
    },
    CreateApiType(context, data){
        return api.post(`ApiType/CreateApiType`, data);
    },

}