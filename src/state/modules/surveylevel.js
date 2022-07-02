import { api } from "../../axios";

export const actions = {

    //SurveyLevel
    GetSurveyLevel(context, data){
        return api.get(`SurveyLevel/GetAllSurveyLevels`);
    },
    GetSingleSurveyLevel(context, data){
        return api.get(`SurveyLevel/${data}`);
    },
    UpdateSurveyLevel(context, data){
        return api.put(`SurveyLevel/${data.id}`, data);
    },
    DeleteSurveyLevel(context, data){
        return api.delete(`SurveyLevel/${data}`);
    },
    CreateSurveyLevel(context, data){
        return api.post(`SurveyLevel/CreateSurveyLevel`, data);
    },

}