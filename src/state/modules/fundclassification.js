import { api } from "../../axios";

export const actions = {
  GetFundClassification() {
    return api.get("FundClassification/GetAllFundClassifications");
  },
  GetSingleFundClassification(context, data) {
    return api.get(`FundClassification/${data}`);
  },
  UpdateFundClassification(context, data) {
    return api.put(`FundClassification/${data.id}`, data);
  },
  DeleteFundClassification(context, data) {
    return api.delete(`FundClassification/${data}`);
  },
  CreateFundClassification(context, data) {
    return api.post(`FundClassification/CreateFundClassification`, data);
  },
};
