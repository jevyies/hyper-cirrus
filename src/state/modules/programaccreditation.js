import { api } from "../../axios";

export const actions = {

    //ProgramAccreditation
    GetProgramAccreditationByProgram(context, data){
        return api.get(`ProgramAccreditation/program/${data}`);
    },
    GetProgramAccreditationBySurveyLevel(context, data){
        return api.get(`ProgramAccreditation/surveyLevel/${data}`);
    },
    GetSingleProgramAccreditation(context, data){
        return api.get(`ProgramAccreditation/${data}`);
    },
    UpdateProgramAccreditation(context, data){
        return api.put(`ProgramAccreditation/${data.id}`, data);
    },
    DeleteProgramAccreditation(context, data){
        return api.delete(`ProgramAccreditation/${data}`);
    },
    CreateProgramAccreditation(context, data){
        return api.post(`ProgramAccreditation/CreateProgramAccreditation`, data);
    },

}