import { api } from "../../axios";

export const actions = {
    GetBeneficiary(){
        return api.get("Beneficiary/GetAllBeneficiaries");
    },
    GetSingleBeneficiary(context, data){
        return api.get(`Beneficiary/${data}`);
    },
    UpdateBeneficiary(context, data){
        return api.put(`Beneficiary/${data.id}`, data);
    },
    DeleteBeneficiary(context, data){
        return api.delete(`Beneficiary/${data}`);
    },
    CreateBeneficiary(context, data){
        return api.post(`Beneficiary/CreateBeneficiary`, data);
    },
}