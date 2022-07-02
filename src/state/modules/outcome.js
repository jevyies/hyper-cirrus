import { api } from "../../axios";

export const actions = {

    // Outcome
    GetOutcome(){
        return api.get("Outcome/GetAllOutcomes");
    },
    GetOutcomeByAgency(context, data){
        return api.get(`Outcome/agency/${data}`);
    },
    GetOutcomeBySectoral(context, data){
        return api.get(`Outcome/sectoral/${data}`);
    },
    GetSingleOutcome(context, data){
        return api.get(`Outcome/${data}`);
    },
    UpdateOutcome(context, data){
        return api.put(`Outcome/${data.id}`, data);
    },
    DeleteOutcome(context, data){
        return api.delete(`Outcome/${data}`);
    },
    CreateOutcome(context, data){
        return api.post(`Outcome/CreateOutcome`, data);
    },

}