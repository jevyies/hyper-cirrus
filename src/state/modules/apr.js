import { procurementAPI } from "../../axios";

export const actions = {

    //Apr
    GetAPRByYear(context, data){
        return procurementAPI.get(`Apr/all/${data}`);
    },
    GetPostedAPR(context, data){
        return procurementAPI.get(`Apr/posted/${data}`);
    },
    GetApprovedAPR(context, data){
        return procurementAPI.get(`Apr/approved/${data}`);
    },
    ApproveAPR(context, data){
        return procurementAPI.put(`Apr/approve/${data}`);
    },
    ReturnAPR(context, data){
        return procurementAPI.put(`Apr/return/${data.id}?remarks=${data.remarks}`);
    },
    PostAPR(context, data){
        return procurementAPI.put(`Apr/post/${data}`);
    },
    GetSingleApr(context, data){
        return procurementAPI.get(`Apr/${data}`);
    },
    UpdateApr(context, data){
        return procurementAPI.put(`Apr/${data.id}`, data);
    },
    DeleteApr(context, data){
        return procurementAPI.delete(`Apr/${data}`);
    },
    CreateApr(context, data){
        return procurementAPI.post(`Apr/CreateApr`, data);
    },
}