import { procurementAPI } from "../../axios";

export const actions = {

    // Months
    GetAllMonths(){
        return procurementAPI.get(`Month/GetAllMonths`);
    },
    GetSingleMonth(context, data){
        return procurementAPI.get(`Month/${data}`);
    },

}