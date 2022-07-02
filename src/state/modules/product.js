import { api } from "../../axios";

export const actions = {

    //Product
    GetProduct(context, data){
        return api.get(`Product/All/${data}`);
    },
    GetSingleProduct(context, data){
        return api.get(`Product/${data}`);
    },
    UpdateProduct(context, data){
        return api.put(`Product/${data.id}`, data);
    },
    DeleteProduct(context, data){
        return api.delete(`Product/${data}`);
    },
    CreateProduct(context, data){
        return api.post(`Product/CreateProduct`, data);
    },

}