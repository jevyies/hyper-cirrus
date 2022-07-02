import { api } from "../../axios";

export const actions = {

    // Employee
    GetEmployee(){
        return api.get("Employee/GetAllEmployees");
    },
    GetEmployeeByOffice(context, data){
        return api.get(`Employee/office/${data}`);
    },
    GetEmployeeByAgency(context, data){
        return api.get(`Employee/agency/${data}`);
    },
    GetEmployeeByCampus(context, data){
        return api.get(`Employee/campus/${data}`);
    },
    GetEmployeeByDU(context, data){
        return api.get(`Employee/DeliveryUnit/${data}`);
    },
    GetSingleEmployee(context, data){
        return api.get(`Employee/${data}`);
    },
    UpdateEmployee(context, data){
        return api.put(`Employee/${data.id}`, data);
    },
    DeleteEmployee(context, data){
        return api.delete(`Employee/${data}`);
    },
    CreateEmployee(context, data){
        return api.post(`Employee/CreateEmployee`, data);
    },

}