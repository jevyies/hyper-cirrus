import { api } from "../../axios";

export const actions = {

    //ProductCategory
    GetProductCategory(){
        return api.get(`ProductCategory/GetAllProductCategories`);
    },
    GetSingleProductCategory(context, data){
        return api.get(`ProductCategory/${data}`);
    },
    UpdateProductCategory(context, data){
        return api.put(`ProductCategory/${data.id}`, data);
    },
    DeleteProductCategory(context, data){
        return api.delete(`ProductCategory/${data}`);
    },
    CreateProductCategory(context, data){
        return api.post(`ProductCategory/CreateProductCategory`, data);
    },

}