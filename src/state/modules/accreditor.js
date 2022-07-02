import { api } from "../../axios";

export const actions = {
    GetAccreditor(){
        return api.get("Accreditor/GetAllAccreditors");
    },
    GetSingleAccreditor(context, data){
        return api.get(`Accreditor/${data}`);
    },
    UpdateAccreditor(context, data){
        return api.put(`Accreditor/${data}`);
    },
    DeleteAccreditor(context, data){
        return api.delete(`Accreditor/${data}`);
    },
    CreateAccreditor(context, data){
        return api.post(`Accreditor/CreateAccreditor`, data);
    }
}