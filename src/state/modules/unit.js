import { procurementAPI } from "../../axios";

export const actions = {

    // Unit
    GetUnit(){
        return procurementAPI.get(`Unit/GetAllUnits`);
    },
    GetSingleUnit(context, data){
        return procurementAPI.get(`Unit/${data}`);
    },
    UpdateUnit(context, data){
        return procurementAPI.put(`Unit/${data.id}`, data);
    },
    DeleteUnit(context, data){
        return procurementAPI.delete(`Unit/${data}`);
    },
    CreateUnit(context, data){
        return procurementAPI.post(`Unit/CreateUnit`, data);
    },

}