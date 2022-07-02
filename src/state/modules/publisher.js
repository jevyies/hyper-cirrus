import { api } from "../../axios";

export const actions = {

    //Publisher
    GetPublisher(){
        return api.get(`Publisher/GetAllPublishers`);
    },
    GetSinglePublisher(context, data){
        return api.get(`Publisher/${data}`);
    },
    UpdatePublisher(context, data){
        return api.put(`Publisher/${data.id}`, data);
    },
    DeletePublisher(context, data){
        return api.delete(`Publisher/${data}`);
    },
    CreatePublisher(context, data){
        return api.post(`Publisher/CreatePublisher`, data);
    },

}