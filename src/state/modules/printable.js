import axios from "axios";

export const actions = {
    PrintReport(context, data){
        return axios.get(`${data}`, {responseType: 'blob'});
    },
}