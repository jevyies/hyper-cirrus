import { api } from "../../axios";

export const actions = {

    //Company
    GetCompany(){
        return api.get(`Company/GetAllCompanies`);
    },
    GetSingleCompany(context, data){
        return api.get(`Company/${data}`);
    },
    UpdateCompany(context, data){
        return api.put(`Company/${data.id}`, data);
    },
    DeleteCompany(context, data){
        return api.delete(`Company/${data}`);
    },
    CreateCompany(context, data){
        return api.post(`Company/CreateCompany`, data);
    },

}