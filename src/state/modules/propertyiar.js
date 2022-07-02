import axios from "axios"

export const actions = {

    //Inspection IAR
    GetPropertyIarPending(context, data){
        return axios.get(`property/Property/Submitted/IAR/${data}`);
    },
    PostPropertyIar(context, data){
        return axios.put(`property/Property/IAR/Item/${data}`);
    },

}