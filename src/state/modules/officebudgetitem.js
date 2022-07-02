import axios from 'axios';
import { financeAPI } from "../../axios";

export const actions = {
  //OfficeBudgetItem
  GetOfficeBudgetItemByOffice(context, data) {
    return axios.get(`/Finance/DeliveryUnitBudgetItem/deliveryUnit/${data.id}?cycle=${data.cycle}`);
  },
  GetSingleOfficeBudgetItem(context, data) {
    return axios.get(`/Finance/DeliveryUnitBudgetItem/${data}`);
  },
  UpdateOfficeBudgetItem(context, data) {
    return axios.put(`/Finance/DeliveryUnitBudgetItem/${data.id}`, data);
  },
  DeleteOfficeBudgetItem(context, data) {
    return axios.delete(`/Finance/DeliveryUnitBudgetItem/${data}`);
  },
  CreateOfficeBudgetItem(context, data) {
    return axios.post(`/Finance/DeliveryUnitBudgetItem/Add`, data);
  },
  createMultipleDeliveryUnitBudgetItem(context, data) {
    return axios.post(`/Finance/DeliveryUnitBudgetItem/Add/Multiple`, data);
  },
  GetMyOfficeBudgetItem(context, data) {
    // return axios.get(`/Finance/DeliveryUnitBudgetItem/myDeliveryUnit/${data}`);
    return financeAPI.get(`DeliveryUnitBudgetItem/myDeliveryUnit/${data}`);
  },
  PostOfficeBudgetItem(context, data) {
    return axios.put(`/Finance/DeliveryUnitBudgetItem/post/${data}`);
  },

  GetOfficeBudgetItemByCampus(context, { campusId, cycle }) {
    return axios.get(`/Finance/DeliveryUnitBudgetItem/campus/${campusId}?cycle=${cycle}`);
  },

  /** Transaction */

  CreateOfficeBudgetItemTransaction(context, data) {
    return axios.post("api/DeliveryUnitBudgetItemTransaction/Debit", data);
  },
  GetOfficeBudgetItemTransaction(context, data) {
    return axios.get(`api/DeliveryUnitBudgetItemTransaction/DeliveryUnitBudgetItem/${data}`);
  },
  revertFunds(context, { transaction, revertOption }) {
    if (revertOption === "fs") {
      return axios.post("Finance/DeliveryUnitBudgetItem/Return/FundSource", transaction);
    }
    if (revertOption === "oe") {
      return axios.post("Finance/DeliveryUnitBudgetItem/Return", transaction);
    }
  },
};
