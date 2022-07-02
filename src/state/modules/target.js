import { api } from "../../axios";

export const actions = {

    // Target
    GetTarget(){
        return api.get("Target/GetAllTargets");
    },
    GetMyTarget(context, data){
        return api.get(`Target/MyTarget/${data}`);
    },
    GetSingleTarget(context, data){
        return api.get(`Target/${data}`);
    },
    GetTargetByDU(context, data){
        return api.get(`Target/DeliveryUnit/${data}`);
    },
    GetTargetByIndicator(context, data){
        return api.get(`Target/indicator/${data.cycle}/${data.id}`);
    },
    UpdateTarget(context, data){
        return api.put(`Target/${data.id}`, data);
    },
    PostTarget(context, data){
        return api.put(`Target/post/${data}`);
    },
    DeleteTarget(context, data){
        return api.delete(`Target/${data}`);
    },
    CreateTarget(context, data){
        return api.post(`Target/CreateTarget`, data);
    },

}