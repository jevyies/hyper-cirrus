import { coreAPI } from "../../axios";

export const actions = {

    // TechnicalReviewUser
    GetTechnicalReviewUser(){
        return coreAPI.get(`TechnicalReviewUser/GetMyTechnicalReviewCategories`);
    },
    CreateTechnicalReviewUser(context, data){
        return coreAPI.post(`TechnicalReviewUser/CreateTechnicalReviewUser`, data);
    },
    DeleteTechnicalReviewUser(context, data){
        return coreAPI.delete(`TechnicalReviewUser/${data}`);
    },
    GetAvailableCategories(context, data){
        return coreAPI.get(`TechnicalReviewUser/GetAvailableCategories/${data}`);
    },
    GetEmployeeCategories(context, data){
        return coreAPI.get(`TechnicalReviewUser/Employee/${data}`);
    },
}