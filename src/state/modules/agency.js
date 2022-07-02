import { api } from "../../axios";


export const actions = {
    GetAgency(){
        return api.get("Agency/GetAllAgencies");
    },
    GetSingleAgency(context, data){
        return api.get(`Agency/${data}`);
    },
    UpdateAgency(context, data){
        return api.put(`Agency/${data.id}`, data);
    },
    DeleteAgency(context, data){
        return api.delete(`Agency/${data}`);
    },
    CreateAgency(context, data){
        return api.post(`Agency/CreateAgency`, data);
    }
}