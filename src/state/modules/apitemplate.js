import { planningAPI } from "../../axios";

export const actions = {

    // PriorityApiTemplate
    GetPriorityApiTemplate(){
        return planningAPI.get("PriorityApiTemplate/All");
    },
    GetPriorityApiTemplateByAgency(context, data){
        return planningAPI.get(`PriorityApiTemplate/agency/${data}`);
    },
    GetSinglePriorityApiTemplate(context, data){
        return planningAPI.get(`PriorityApiTemplate/${data}`);
    },
    UpdatePriorityApiTemplate(context, data){
        return planningAPI.put(`PriorityApiTemplate/${data.id}`, data);
    },
    DeletePriorityApiTemplate(context, data){
        return planningAPI.delete(`PriorityApiTemplate/${data}`);
    },
    CreatePriorityApiTemplate(context, data){
        return planningAPI.post(`PriorityApiTemplate/Create`, data);
    },

}