import { api } from "../../axios";

export const actions = {

    // Cycle
    GetSingleCycle(context, data){
        return api.get(`Cycle/${data}`);
    },
    GetAllCycle(){
        return api.get(`Cycle/GetAllCycles`);
    },

}