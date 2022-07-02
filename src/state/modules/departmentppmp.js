import { procurementAPI } from "../../axios";

export const actions = {

    // DepartmentPpmp
    GetDepartmentPpmpByYear(context, data){
        return procurementAPI.get(`DepartmentPpmp/ppmps/${data}`);
    },
    GetSingleDepartmentPpmp(context, data){
        return procurementAPI.get(`DepartmentPpmp/${data}`);
    },
    UpdateDepartmentPpmp(context, data){
        return procurementAPI.put(`DepartmentPpmp/${data.id}`, data);
    },
    DeleteDepartmentPpmp(context, data){
        return procurementAPI.delete(`DepartmentPpmp/${data}`);
    },
    CreateDepartmentPpmp(context, data){
        return procurementAPI.post(`DepartmentPpmp/CreateDepartmentPpmp`, data);
    },
    PostDepartmentPpmp(context, data){
        return procurementAPI.put(`DepartmentPpmp/post/${data}`);
    },
    ApproveDepartmentPpmp(context, data){
        return procurementAPI.put(`DepartmentPpmp/approve/${data}`);
    },
    ReturnDepartmentPpmp(context, data){
        return procurementAPI.put(`DepartmentPpmp/return/${data}`);
    },

}