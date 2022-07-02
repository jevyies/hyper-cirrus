import { procurementAPI } from "../../axios";

export const actions = {
  // ApiResource
  GetResourceItemByAPI(context, data) {
    return procurementAPI.get(`ApiResource/${data.apiId}/${data.bli}`);
  },
  GetAllResourceByAPI(context, data) {
    return procurementAPI.get(`ApiResource/all/${data}/`);
  },
  GetSinglePPMPItem(context, data) {
    return procurementAPI.get(`ApiResource/${data}`);
  },
  UpdatePPMPItem(context, data) {
    return procurementAPI.put(`ApiResource/${data.id}`, data);
  },
  DeletePPMPItem(context, data) {
    return procurementAPI.delete(`ApiResource/${data}`);
  },
  CreatePPMPItem(context, data) {
    return procurementAPI.post(`ApiResource/CreateApiResource`, data);
  },
  ResubmitPPMPItem(context, data) {
    return procurementAPI.put(`ApiResource/Resubmit/${data}`);
  },
  GetResourceItemByBudget(context, data) {
    return procurementAPI.get(`ApiResource/BudgetItem/${data}`);
  },
};
