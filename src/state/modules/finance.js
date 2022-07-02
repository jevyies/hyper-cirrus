import { api } from "../../axios";

export const actions = {
  //Mfo
  GetMfoByFS(context, data) {
    return api.get(`Mfo/FundsSource/${data}`);
  },
  GetSingleMfo(context, data) {
    return api.get(`Mfo/${data}`);
  },
  UpdateMfo(context, data) {
    return api.put(`Mfo/${data.id}`, data);
  },
  DeleteMfo(context, data) {
    return api.delete(`Mfo/${data}`);
  },
  CreateMfo(context, data) {
    return api.post(`Mfo/CreateMfo`, data);
  },
  CreateMultipleMfos(context, data) {
    return api.post(`Mfo/CreateMultipleMfos`, data);
  },

  // MFO Transactions

  GetMfoTransactions(context, data) {
    return api.get(`MfoTransaction/Mfo/${data}`);
  },

  CreateMfoTransaction(context, data) {
    return api.post("MfoTransaction/CreateMfoTransaction", data);
  },

  // FundClassification
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

  // FundCluster
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

  // FundSource
  // GetFundSource() {
  //   return api.get("FundSource/GetAllFundSources");
  // },
  // GetFundSourceByAgency(context, data) {
  //   return api.get(`FundSource/cycle/${data}`);
  // },
  // GetSingleFundSource(context, data) {
  //   return api.get(`FundSource/${data}`);
  // },
  // UpdateFundSource(context, data) {
  //   return api.put(`FundSource/${data.id}`, data);
  // },
  // DeleteFundSource(context, data) {
  //   return api.delete(`FundSource/${data}`);
  // },
  // CreateFundSource(context, data) {
  //   return api.post(`FundSource/CreateFundSource`, data);
  // },
  // GetFundSourcePerCluster(context, data) {
  //   return api.get(`FundSource/FundCluster/${data}`);
  // },
  // GetTransactionByFundSource(context, data) {
  //   return api.get(`FundSourceTransaction/FundSource/${data}`);
  // },

  // CreateFundSourceTransactions(context, data) {
  //   return api.post("FundSourceTransaction/CreateFundSourceTransaction", data);
  // },

  // BudgetLineItem
  GetBudgetLineItem() {
    return api.get("BudgetLineItem/GetAllBudgetLineItems");
  },
  GetBudgetLineItemByMfo(context, data) {
    return api.get(`BudgetLineItem/Mfo/${data}`);
  },
  GetSingleBudgetLineItem(context, data) {
    return api.get(`BudgetLineItem/${data}`);
  },
  UpdateBudgetLineItem(context, data) {
    return api.put(`BudgetLineItem/${data.id}`, data);
  },
  DeleteBudgetLineItem(context, data) {
    return api.delete(`BudgetLineItem/${data}`);
  },
  CreateBudgetLineItem(context, data) {
    return api.post(`BudgetLineItem/CreateBudgetLineItem`, data);
  },

  //Fund Source
  GetAllFundSources() {
    return api.get("FundSource/GetAllFundSources");
  },
  GetFundSourceByCluster(context, data) {
    return api.get(`FundSource/FundCluster/${data}`);
  },

  //Budget Line Item Transaction

  GetBudgetLineItemTransaction(context, data) {
    return api.get(`BudgetLineItemTransaction/${data}`);
  },
  CreateBudgetLineItemTransaction(context, data) {
    return api.post(
      `BudgetLineItemTransaction/CreateBudgetLineItemTransaction`,
      data
    );
  },
};
