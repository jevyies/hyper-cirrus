import { api } from "../../axios";

export const actions = {
  GetFundCluster() {
    return api.get("FundCluster/GetAllFundClusters");
  },
  GetSingleFundCluster(context, data) {
    return api.get(`FundCluster/${data}`);
  },
  UpdateFundCluster(context, data) {
    return api.put(`FundCluster/${data.id}`, data);
  },
  DeleteFundCluster(context, data) {
    return api.delete(`FundCluster/${data}`);
  },
  CreateFundCluster(context, data) {
    return api.post(`FundCluster/CreateFundCluster`, data);
  },
};
