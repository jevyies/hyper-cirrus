import { api } from "../../axios";

export const state = {
  fundSource: null,
  selectedFundSource: null,
};

export const mutations = {
  SET_FUND_SOURCE(state, data) {
    state.fundSource = data;
  },
};
export const getters = {
  getFundSource(state) {
    return state.fundSource;
  },
};

export const actions = {
  GetFundSource() {
    return api.get("FundSource/GetAllFundSources");
  },
  getActiveFundSource(context, data) {
    return api.get(`FundSource/Active/FundCluster/${data}`);
  },
  getExpiredFundSource(context, data) {
    return api.get(`FundSource/Expired/FundCluster/${data}`);
  },
  GetFundSourceByAgency(context, data) {
    return api.get(`FundSource/Agency/${data}`);
  },
  GetFundSourceByCycle(context, data) {
    return api.get(`FundSource/Cycle/${data}`);
  },
  GetSingleFundSource(context, data) {
    return api.get(`FundSource/${data}`);
  },
  UpdateFundSource(context, data) {
    return api.put(`FundSource/${data.id}`, data);
  },
  DeleteFundSource(context, data) {
    return api.delete(`FundSource/${data}`);
  },
  CreateFundSource(context, data) {
    return api.post(`FundSource/CreateFundSource`, data);
  },
  GetFundSourcePerCluster(context, data) {
    return api.get(`FundSource/FundCluster/${data}`);
  },
  GetTransactionByFundSource(context, data) {
    return api.get(`FundSourceTransaction/FundSource/${data}`);
  },
  CreateFundSourceTransactions(context, data) {
    return api.post("FundSourceTransaction/CreateFundSourceTransaction", data);
  },
  transferFundSource(context, data)
  {
    return api.post("FundSourceTransaction/Transfer", data);
  },
  GetFundSourcePerCycleDU(context, data) {
    return api.get(`FundSource/DeliveryUnit/${data.cycle}/${data.duId}`);
  },
};
