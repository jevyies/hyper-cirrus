import { api } from "../../axios";

export const actions = {

    // Societal Outcome
    GetSocietalOutcome(){
        return api.get("SocietalOutcome/GetAllSocietalOutcomes");
    },
    GetSingleSocietalOutcome(context, data){
        return api.get(`SocietalOutcome/${data}`);
    },
    UpdateSocietalOutcome(context, data){
        return api.put(`SocietalOutcome/${data.id}`, data);
    },
    DeleteSocietalOutcome(context, data){
        return api.delete(`SocietalOutcome/${data}`);
    },
    CreateSocietalOutcome(context, data){
        return api.post(`SocietalOutcome/CreateSocietalOutcome`, data);
    },

}