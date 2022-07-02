import { api } from "../../axios";

export const actions = {

    // ExtensionActivity
    GetExtensionActivity(){
        return api.get("ExtensionActivity/GetAllExtensionActivities");
    },
    GetExtensionActivityByEP(context, data){
        return api.get(`ExtensionActivity/extensionProgram/${data}`);
    },
    GetSingleExtensionActivity(context, data){
        return api.get(`ExtensionActivity/${data}`);
    },
    UpdateExtensionActivity(context, data){
        return api.put(`ExtensionActivity/${data.id}`, data);
    },
    DeleteExtensionActivity(context, data){
        return api.delete(`ExtensionActivity/${data}`);
    },
    CreateExtensionActivity(context, data){
        return api.post(`ExtensionActivity/CreateExtensionActivity`, data);
    },

}