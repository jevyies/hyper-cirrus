import { api } from "../../axios";

export const actions = {

    GetBeneficiaryCategory(){
        return api.get("BeneficiaryCategory/GetAllBeneficiaryCategories");
    },
    GetSingleBeneficiaryCategory(context, data){
        return api.get(`BeneficiaryCategory/${data}`);
    },
    UpdateBeneficiaryCategory(context, data){
        return api.put(`BeneficiaryCategory/${data.id}`, data);
    },
    DeleteBeneficiaryCategory(context, data){
        return api.delete(`BeneficiaryCategory/${data}`);
    },
    CreateBeneficiaryCategory(context, data){
        return api.post(`BeneficiaryCategory/CreateBeneficiaryCategory`, data);
    },
}