import { api } from "../../axios";

export const actions = {

    //Api
    GetApiByTarget(context, data){
        return api.get(`Api/target/${data}`);
    },
    GetSingleApi(context, data){
        return api.get(`Api/${data}`);
    },
    GetPostedApi(context, data){
        return api.get(`Api/posted/${data}`);
    },
    GetApprovedApi(context, data){
        return api.get(`Api/approved/${data}`);
    },
    GetBackLogs(context, data){
        return api.get(`Api/BackLog/${data}`);
    },
    UpdateApi(context, data){
        return api.put(`Api/${data.id}`, data);
    },
    DeleteApi(context, data){
        return api.delete(`Api/${data}`);
    },
    CreateApi(context, data){
        return api.post(`Api/CreateApi`, data);
    },
    PostApi(context, data){
        return api.put(`Api/post/${data}`);
    },
    ApproveApi(context, data){
        return api.put(`Api/approve/${data}`);
    },
    ReturnApi(context, data){
        return api.put(`Api/Return/${data.id}?remarks=${data.remarks}`);
    },
    ReturnApiPlanning(context, data){
        return api.put(`Api/Planning/Return/${data.id}?remarks=${data.remarks}`);
    },
    GetApiOfficeBudgetItem(context, data) {
        return api.get(`Api/BudgetLineItem/${data}`);
    },
    UpdateBL(context, data) {
        return api.put(`Api/BackLog/${data.id}?status=${data.status}`);
    },
    PrintPPMP(context, data) {
        return api.get(`Api/Print/My/PPMP/${data}`);
    }
}