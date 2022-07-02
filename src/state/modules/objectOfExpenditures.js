import axios from "axios"

export const actions = {
    createObjectOfExpenditures(context, data)
    {
        return axios.post("/Finance/ObjectOfExpenditures/CreateObjectOfExpenditures", data)
    },
    getSingleObjectOfExpenditures(context, data){
        return axios.get(`/Finance/ObjectOfExpenditures/${data}`)
    },
    getObjectOfExpendituresByPrexcAndCycle(context, { cycle, prexcId, fundSourceId })
    {
        return axios.get(`/Finance/ObjectOfExpenditures/Prexc/${prexcId}/${fundSourceId}/${cycle}`)
    },
    removeObjectOfExpenditures(context, data)
    {
        return axios.delete(`/Finance/ObjectOfExpenditures/${data}`)
    },
    getAvailableAccount(context, { cycle, prexcId })
    {
        return axios.get(`/Finance/ObjectOfExpenditures/Available/${prexcId}/${cycle}`)
    },
    getObjectOfExpendituresByFundSource(context, {fundSourceId, cycle, outcomeId}){
        return axios.get(`/Finance/ObjectOfExpenditures/FundSource/${fundSourceId}/${outcomeId}/${cycle}`)
    },
    addFund(context, data)
    {
        return axios.post("/api/ObjectOfExpenditureTransaction/AddFund", data)
    },
    revertFund(context, data)
    {
        return axios.post("/api/ObjectOfExpenditureTransaction/Revert", data)
    },
    getSingleObjectOfExpenditureTransaction(context, data)
    {
        return axios.get(`/api/ObjectOfExpenditureTransaction/${data}`)
    },
    removeSingleObjectOfExpenditureTransaction(context, data)
    {
        return axios.delete(`/api/ObjectOfExpenditureTransaction/${data}`)
    },
    getObjectOfExpenditureTransactionByExpenditureId(context, data)
    {
        return axios.get(`/api/ObjectOfExpenditureTransaction/ObjectOfExpenditure/${data}`);
    }

}