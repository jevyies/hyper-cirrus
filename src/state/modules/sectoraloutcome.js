import { api } from "../../axios";

export const actions = {

    // Sectoral Outcome
    GetSectoralOutcome(){
        return api.get("SectoralOutcome/GetAllSectoralOutcomes");
    },
    GetSectoralBySocietal(context, data){
        return api.get(`SectoralOutcome/societal/${data}`);
    },
    GetSingleSectoralOutcome(context, data){
        return api.get(`SectoralOutcome/${data}`);
    },
    UpdateSectoralOutcome(context, data){
        return api.put(`SectoralOutcome/${data.id}`, data);
    },
    DeleteSectoralOutcome(context, data){
        return api.delete(`SectoralOutcome/${data}`);
    },
    CreateSectoralOutcome(context, data){
        return api.post(`SectoralOutcome/CreateSectoralOutcome`, data);
    },

}