import { procurementAPI } from "../../axios";

export const actions = {

    // ApiResourceDetail
    GetApiResourceDetailByApiResource(context, data){
        return procurementAPI.get(`ApiResourceDetail/ApiResource/${data}`);
    },
    GetSingleApiResourceDetail(context, data){
        return procurementAPI.get(`ApiResourceDetail/${data}`);
    },
    UpdateApiResourceDetail(context, data){
        return procurementAPI.put(`ApiResourceDetail/${data.id}`, data);
    },
    DeleteApiResourceDetail(context, data){
        return procurementAPI.delete(`ApiResourceDetail/${data}`);
    },
    CreateApiResourceDetail(context, data){
        return procurementAPI.post(`ApiResourceDetail/CreateApiResourceDetail`, data);
    }

}