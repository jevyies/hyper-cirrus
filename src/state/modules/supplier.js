import { procurementAPI } from "../../axios";

export const actions = {

    // Supplier
    GetSupplier(){
        return procurementAPI.get(`Supplier/GetAllSuppliers`);
    },
    GetSingleSupplier(context, data){
        return procurementAPI.get(`Supplier/${data}`);
    },
    UpdateSupplier(context, data){
        return procurementAPI.put(`Supplier/${data.id}`, data);
    },
    DeleteSupplier(context, data){
        return procurementAPI.delete(`Supplier/${data}`);
    },
    CreateSupplier(context, data){
        return procurementAPI.post(`Supplier/CreateSupplier`, data);
    },
    CreateSupplierCategory(context, data){
        return procurementAPI.post(`SupplierCategory/Add`, data);
    },
    GetSupplierCategory(context, data){
        return procurementAPI.get(`SupplierCategory/${data}`);
    },
    DeleteSupplierCategory(context, data){
        return procurementAPI.delete(`SupplierCategory/${data}`);
    },
}