import { procurementAPI } from "../../axios";


export const actions = {
    GetModeOfProcurement(){
        return procurementAPI.get("ModeOfProcurement/GetAllModeOfProcurements");
    },
    GetSingleModeOfProcurement(context, data){
        return procurementAPI.get(`ModeOfProcurement/${data}`);
    },
    UpdateModeOfProcurement(context, data){
        return procurementAPI.put(`ModeOfProcurement/${data.id}`, data);
    },
    DeleteModeOfProcurement(context, data){
        return procurementAPI.delete(`ModeOfProcurement/${data}`);
    },
    CreateModeOfProcurement(context, data){
        return procurementAPI.post(`ModeOfProcurement/CreateModeOfProcurement`, data);
    }
}