import { procurementAPI } from "../../axios";

export const actions = {

    //Aob
    GetAobByYear(context, data){
        return procurementAPI.get(`Aob/${data.campus}/${data.cycle}`);
    },
    GetSingleAob(context, data){
        return procurementAPI.get(`Aob/${data}`);
    },
    UpdateAob(context, data){
        return procurementAPI.put(`Aob/${data.id}`, data);
    },
    DeleteAob(context, data){
        return procurementAPI.delete(`Aob/${data}`);
    },
    CreateAob(context, data){
        return procurementAPI.post(`Aob/CreateAob`, data);
    },

}