import { api } from "../../axios";

export const actions = {

    // ExtensionProgram
    GetExtensionProgram(){
        return api.get("ExtensionProgram/GetAllExtensionPrograms");
    },
    GetExtensionProgramByProgram(context, data){
        return api.get(`ExtensionProgram/program/${data}`);
    },
    GetSingleExtensionProgram(context, data){
        return api.get(`ExtensionProgram/${data}`);
    },
    UpdateExtensionProgram(context, data){
        return api.put(`ExtensionProgram/${data.id}`, data);
    },
    DeleteExtensionProgram(context, data){
        return api.delete(`ExtensionProgram/${data}`);
    },
    CreateExtensionProgram(context, data){
        return api.post(`ExtensionProgram/CreateExtensionProgram`, data);
    },

}