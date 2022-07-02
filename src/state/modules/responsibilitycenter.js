import { procurementAPI } from "../../axios";

export const actions = {

    //ResponsibilityCenter Financial
    GetReviewFinancial(context, data){
        return procurementAPI.get(`ResponsibilityCenter/Financial/Review/${data}`);
    },
    ApproveFinancial(context, data){
        return procurementAPI.put(`ResponsibilityCenter/Financial/Approve/${data}`);
    },
    ReturnFinancial(context, data){
        return procurementAPI.put(`ResponsibilityCenter/Financial/Return/${data.id}?remarks=${data.remarks}`);
    },
    GetReviewedFinancial(context, data){
        return procurementAPI.get(`ResponsibilityCenter/Financial/Reviewed/${data}`);
    },

    //ResponsibilityCenter Technical
    GetReviewTechnical(context, data){
        return procurementAPI.get(`ResponsibilityCenter/Technical/Review/${data}`);
    },
    ApproveTechnical(context, data){
        return procurementAPI.put(`ResponsibilityCenter/Technical/Approve/${data}`);
    },
    ReturnTechnical(context, data){
        return procurementAPI.put(`ResponsibilityCenter/Technical/Return/${data.id}?remarks=${data.remarks}`);
    },
    GetReviewedTechnical(context, data){
        return procurementAPI.get(`ResponsibilityCenter/Technically/Reviewed/${data}`);
    },

}