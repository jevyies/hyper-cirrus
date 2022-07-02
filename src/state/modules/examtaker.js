import { api } from "../../axios";

export const actions = {

    //ExamTaker
    GetExamTakerBySchedule(context, data){
        return api.get(`ExamTaker/GetExamTakersByScheduleId?scheduleId=${data}`);
    },
    GetSingleExamTaker(context, data){
        return api.get(`ExamTaker/${data}`);
    },
    UpdateExamTaker(context, data){
        return api.put(`ExamTaker/${data.id}`, data);
    },
    DeleteExamTaker(context, data){
        return api.delete(`ExamTaker/${data}`);
    },
    CreateExamTaker(context, data){
        return api.post(`ExamTaker/CreateExamTaker`, data);
    },

}