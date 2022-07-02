import { api } from "../../axios";

export const actions = {

    //JobCategory
    GetJobCategory(){
        return api.get(`JobCategory/GetAllJobCategories`);
    },
    GetSingleJobCategory(context, data){
        return api.get(`JobCategory/${data}`);
    },
    UpdateJobCategory(context, data){
        return api.put(`JobCategory/${data.id}`, data);
    },
    DeleteJobCategory(context, data){
        return api.delete(`JobCategory/${data}`);
    },
    CreateJobCategory(context, data){
        return api.post(`JobCategory/CreateJobCategory`, data);
    },

}