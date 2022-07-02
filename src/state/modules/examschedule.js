import { api } from "../../axios";

export const actions = {

    //ExamSchedule
    GetExamScheduleByProgram(context, data){
        return api.get(`ExamSchedule/program/${data}`);
    },
    GetExamScheduleByExam(context, data){
        return api.get(`ExamSchedule/exam/${data}`);
    },
    GetSingleExamSchedule(context, data){
        return api.get(`ExamSchedule/${data}`);
    },
    UpdateExamSchedule(context, data){
        return api.put(`ExamSchedule/${data.id}`, data);
    },
    DeleteExamSchedule(context, data){
        return api.delete(`ExamSchedule/${data}`);
    },
    CreateExamSchedule(context, data){
        return api.post(`ExamSchedule/CreateExamSchedule`, data);
    },

}