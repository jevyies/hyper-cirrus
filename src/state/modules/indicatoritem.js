import { api } from "../../axios";

export const actions = {

    // Indicator Item
    GetIndicatorItem(){
        return api.get("Indicator/GetAllIndicatorItems");
    },
    GetIndicatorItemByIndicator(context, data){
        return api.get(`IndicatorItem/indicator/${data}`);
    },
    GetSingleIndicatorItem(context, data){
        return api.get(`IndicatorItem/${data}`);
    },
    UpdateIndicatorItem(context, data){
        return api.put(`IndicatorItem/${data.id}`, data);
    },
    UpdateIndicatorItemSequence(context, data){
        return api.put(`IndicatorItem/Sequence`, data);
    },
    DeleteIndicatorItem(context, data){
        return api.delete(`IndicatorItem/${data}`);
    },
    CreateIndicatorItem(context, data){
        return api.post(`IndicatorItem/CreateIndicatorItem`, data);
    },

}