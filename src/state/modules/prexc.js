import { api } from "../../axios";

export const actions = {

    // Prexc
    GetPrexc(){
        return api.get("Prexc/GetAllPrexcs");
    },
    GetPrexcByFundSource(context, data){
        return api.get(`Prexc/FundSource/${data}`);
    },
    GetPrexcByOutcome(context, data){
        return api.get(`Prexc/Outcome/${data}`);
    },
    GetSinglePrexc(context, data){
        return api.get(`Prexc/${data}`);
    },
    UpdatePrexc(context, data){
        return api.put(`Prexc/${data.id}`, data);
    },
    DeletePrexc(context, data){
        return api.delete(`Prexc/${data}`);
    },
    CreatePrexc(context, data){
        return api.post(`Prexc/CreatePrexc`, data);
    },

}