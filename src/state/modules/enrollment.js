import { planningAPI } from "../../axios";

export const actions = {

    // Enrollment
    GetEnrollmentByProgram(context, data){
        return planningAPI.get(`Enrollment/All/Program/${data}`);
    },
    GetEnrollmentBySY(context, data){
        return planningAPI.get(`Enrollment/All/SchoolYear/${data}`);
    },
    GetSingleEnrollment(context, data){
        return planningAPI.get(`Enrollment/${data}`);
    },
    UpdateEnrollment(context, data){
        return planningAPI.put(`Enrollment/${data.id}`, data);
    },
    DeleteEnrollment(context, data){
        return planningAPI.delete(`Enrollment/${data}`);
    },
    CreateEnrollment(context, data){
        return planningAPI.post(`Enrollment/Create`, data);
    },

}