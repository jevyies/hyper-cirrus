import { planningAPI } from "../../axios";

export const actions = {

    // TargetTemplateDeliveryUnit
    GetTargetTemplateDeliveryUnit(){
        return planningAPI.get("TargetTemplateDeliveryUnit/All");
    },
    GetTargetTemplateDeliveryUnitByDU(context, data){
        return planningAPI.get(`TargetTemplateDeliveryUnit/DeliveryUnit/${data}`);
    },
    GetTargetTemplateDeliveryUnitByIndicator(context, data){
        return planningAPI.get(`TargetTemplateDeliveryUnit/IndicatorItem/${data}`);
    },
    UpdateTargetTemplateDeliveryUnit(context, data){
        return planningAPI.put(`TargetTemplateDeliveryUnit/${data.id}`, data);
    },
    PostTargetTemplateDeliveryUnit(context, data){
        return planningAPI.put(`TargetTemplateDeliveryUnit/post/${data}`);
    },
    DeleteTargetTemplateDeliveryUnit(context, data){
        return planningAPI.delete(`TargetTemplateDeliveryUnit/${data}`);
    },
    CreateTargetTemplateDeliveryUnit(context, data){
        return planningAPI.post(`TargetTemplateDeliveryUnit/Add`, data);
    },

}