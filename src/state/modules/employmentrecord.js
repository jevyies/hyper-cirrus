import { api } from "../../axios";

export const actions = {

    //EmploymentRecord
    GetEmploymentRecordByStudent(context, data){
        return api.get(`EmploymentRecord/student/${data}`);
    },
    GetSingleEmploymentRecord(context, data){
        return api.get(`EmploymentRecord/${data}`);
    },
    UpdateEmploymentRecord(context, data){
        return api.put(`EmploymentRecord/${data.id}`, data);
    },
    DeleteEmploymentRecord(context, data){
        return api.delete(`EmploymentRecord/${data}`);
    },
    CreateEmploymentRecord(context, data){
        return api.post(`EmploymentRecord/CreateEmploymentRecord`, data);
    },

}