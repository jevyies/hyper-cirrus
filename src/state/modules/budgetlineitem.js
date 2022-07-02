import { api } from "../../axios";

export const actions = {
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
  //Budget Line Item Transaction

  GetBudgetLineItemTransaction(context, data) {
    return api.get(`BudgetLineItemTransaction/BudgetLineItem/${data}`);
  },
  CreateBudgetLineItemTransaction(context, data) {
    return api.post(
      `BudgetLineItemTransaction/CreateBudgetLineItemTransaction`,
      data
    );
  },
};
