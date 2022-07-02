import { procurementAPI } from "../../axios";

export const actions = {

    // DepartmentPpmpItem
    GetDepartmentPpmpItemByPpmp(context, data){
        return procurementAPI.get(`DepartmentPpmpItem/ppmp/${data}`);
    },
    GetSingleDepartmentPpmpItem(context, data){
        return procurementAPI.get(`DepartmentPpmpItem/${data}`);
    },
    UpdateDepartmentPpmpItem(context, data){
        return procurementAPI.put(`DepartmentPpmpItem/${data.id}`, data);
    },
    DeleteDepartmentPpmpItem(context, data){
        return procurementAPI.delete(`DepartmentPpmpItem/${data}`);
    },
    CreateDepartmentPpmpItem(context, data){
        return procurementAPI.post(`DepartmentPpmpItem/CreateDepartmentPpmpItem`, data);
    },
}