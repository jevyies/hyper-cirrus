import { procurementAPI } from "../../axios";

export const actions = {

    //App
    GetAPPByYear(context, data){
        return procurementAPI.get(`App/all/${data}`);
    },
    GetPostedAPP(context, data){
        return procurementAPI.get(`App/posted/${data}`);
    },
    GetApprovedAPP(context, data){
        return procurementAPI.get(`App/approved/${data}`);
    },
    ApproveAPP(context, data){
        return procurementAPI.put(`App/approve/${data}`);
    },
    ReturnAPP(context, data){
        return procurementAPI.put(`App/return/${data.id}?remarks=${data.remarks}`);
    },
    PostAPP(context, data){
        return procurementAPI.put(`App/post/${data}`);
    },
    GetSingleApp(context, data){
        return procurementAPI.get(`App/${data}`);
    },
    UpdateApp(context, data){
        return procurementAPI.put(`App/${data.id}`, data);
    },
    DeleteApp(context, data){
        return procurementAPI.delete(`App/${data}`);
    },
    CreateApp(context, data){
        return procurementAPI.post(`App/CreateApp`, data);
    },

}