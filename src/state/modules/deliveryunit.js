import { api } from "../../axios";

export const actions = {

    // DeliveryUnit
    GetDeliveryUnit(){
        return api.get("DeliveryUnit/GetAllDeliveryUnits");
    },
    GetDeliveryUnitByOffice(context, data){
        return api.get(`DeliveryUnit/office/${data}`);
    },
    GetDeliveryUnitByCampus(context, data){
        return api.get(`DeliveryUnit/Campus/${data}`);
    },
    GetSingleDeliveryUnit(context, data){
        return api.get(`DeliveryUnit/${data}`);
    },
    UpdateDeliveryUnit(context, data){
        return api.put(`DeliveryUnit/${data.id}`, data);
    },
    DeleteDeliveryUnit(context, data){
        return api.delete(`DeliveryUnit/${data}`);
    },
    CreateDeliveryUnit(context, data){
        return api.post(`DeliveryUnit/CreateDeliveryUnit`, data);
    },

}