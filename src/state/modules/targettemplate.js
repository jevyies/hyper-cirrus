import { planningAPI } from "../../axios";

export const actions = {

    // TargetTemplate
    GetTargetTemplate(){
        return planningAPI.get("TargetTemplate/All");
    },
    GetTargetTemplateByDU(context, data){
        return planningAPI.get(`TargetTemplate/DeliveryUnit/${data}`);
    },
    GetTargetTemplateByIndicator(context, data){
        return planningAPI.get(`TargetTemplate/IndicatorItem/${data}`);
    },
    UpdateTargetTemplate(context, data){
        return planningAPI.put(`TargetTemplate/${data.id}`, data);
    },
    PostTargetTemplate(context, data){
        return planningAPI.put(`TargetTemplate/post/${data}`);
    },
    DeleteTargetTemplate(context, data){
        return planningAPI.delete(`TargetTemplate/${data}`);
    },
    CreateTargetTemplate(context, data){
        return planningAPI.post(`TargetTemplate/Create`, data);
    },
    SendTargetTemplate(context, data){
        return planningAPI.post(`TargetTemplate/Send/${data.id}`, data);
    },
}