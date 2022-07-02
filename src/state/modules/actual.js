import { api } from "../../axios";

export const actions = {
    GetActual(){
        return api.get("Actual/GetAllActuals");
    },
    GetSingleActual(context, data){
        return api.get(`Actual/${data}`);
    },
    UpdateActual(context, data){
        return api.put(`Actual/${data.id}`, data);
    },
    DeleteActual(context, data){
        return api.delete(`Actual/${data}`);
    },
    CreateActual(context, data){
        return api.post(`Actual/CreateActual`, data);
    },
    PostActual(context, data){
        return api.put(`Actual/post/${data}`);
    },
}