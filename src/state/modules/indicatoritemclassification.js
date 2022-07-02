import { api } from "../../axios";

export const actions = {

    //IndicatorItemClassification
    GetIndicatorItemClassification(){
        return api.get(`IndicatorItemClassification/GetAllIndicatorItemClassifications`);
    },
    GetSingleIndicatorItemClassification(context, data){
        return api.get(`IndicatorItemClassification/${data}`);
    },
    UpdateIndicatorItemClassification(context, data){
        return api.put(`IndicatorItemClassification/${data.id}`, data);
    },
    DeleteIndicatorItemClassification(context, data){
        return api.delete(`IndicatorItemClassification/${data}`);
    },
    CreateIndicatorItemClassification(context, data){
        return api.post(`IndicatorItemClassification/CreateIndicatorItemClassification`, data);
    },

}