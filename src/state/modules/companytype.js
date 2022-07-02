import { api } from "../../axios";

export const actions = {

    //CompanyType
    GetCompanyType(){
        return api.get(`CompanyType/GetAllCompanyTypes`);
    },
    GetSingleCompanyType(context, data){
        return api.get(`CompanyType/${data}`);
    },
    UpdateCompanyType(context, data){
        return api.put(`CompanyType/${data.id}`, data);
    },
    DeleteCompanyType(context, data){
        return api.delete(`CompanyType/${data}`);
    },
    CreateCompanyType(context, data){
        return api.post(`CompanyType/CreateCompanyType`, data);
    },

}