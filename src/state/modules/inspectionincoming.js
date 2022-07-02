import axios from "axios"

export const actions = {

    //Inspection
    GetInspectionIncoming(){
        return axios.get(`inspection/Incoming/All`);
    },
    GetInspectionReceived(){
        return axios.get(`inspection/InspectionPo/Received`);
    },
    ReceiveInspection(context, data){
        return axios.put(`inspection/Incoming/Po/Receive/${data}`);
    },

}