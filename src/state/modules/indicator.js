import { api } from "../../axios";

export const actions = {

    // Indicator
    GetIndicator(){
        return api.get("Indicator/GetAllIndicators");
    },
    GetSingleIndicator(context, data){
        return api.get(`Indicator/${data}`);
    },
    UpdateIndicator(context, data){
        return api.put(`Indicator/${data.id}`, data);
    },
    DeleteIndicator(context, data){
        return api.delete(`Indicator/${data}`);
    },
    CreateIndicator(context, data){
        return api.post(`Indicator/CreateIndicator`, data);
    },

}