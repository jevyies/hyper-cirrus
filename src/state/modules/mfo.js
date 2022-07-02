import { api } from "../../axios";

export const state = {
  mfo: null,
  selectedMfo: null,
  mfoBalance: 0,
};

export const mutations = {
  SET_MFO(state, data) {
    state.mfo = data;
  },
  SET_MFO_BALANCE(state, data) {
    state.mfoBalance = data;
  },
};
export const getters = {
  getMFO(state) {
    return state.mfo;
  },
  getMFOBalance(state) {
    return state.mfoBalance;
  },
};

export const actions = {
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
};
