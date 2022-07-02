import { procurementAPI } from "../../axios";

export const actions = {

    // DepartmentAllocation
    GetDepartmentAllocationByDeliveryUnit(context, data){
        return procurementAPI.get(`DepartmentAllocation/GetAllDepartmentAllocationsByDeliveryUnitId?deliveryUnitId=${data.deliveryUnitId}&year=${data.year}`);
    },
    GetSingleDepartmentAllocation(context, data){
        return procurementAPI.get(`DepartmentAllocation/${data}`);
    },
    UpdateDepartmentAllocation(context, data){
        return procurementAPI.put(`DepartmentAllocation/${data.id}`, data);
    },
    DeleteDepartmentAllocation(context, data){
        return procurementAPI.delete(`DepartmentAllocation/${data}`);
    },
    CreateDepartmentAllocation(context, data){
        return procurementAPI.post(`DepartmentAllocation/CreateDepartmentAllocation`, data);
    },

}