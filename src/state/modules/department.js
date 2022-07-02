import { coreAPI } from "../../axios";

export const actions = {

    // Department
    GetDepartment(){
        return coreAPI.get("Department/GetAllDepartments");
    },
    GetDepartmentByDU(context, data){
        return coreAPI.get(`Department/deliveryUnit/${data}`);
    },
    GetSingleDepartment(context, data){
        return coreAPI.get(`Department/${data}`);
    },
    UpdateDepartment(context, data){
        return coreAPI.put(`Department/${data.id}`, data);
    },
    DeleteDepartment(context, data){
        return coreAPI.delete(`Department/${data}`);
    },
    CreateDepartment(context, data){
        return coreAPI.post(`Department/CreateDepartment`, data);
    },

}