import axios from "axios"

export const actions = {

    //Property
    GetPropertyPending(){
        return axios.get(`property/Property/All/Pending`);
    },
    GetPropertyAvailable(){
        return axios.get(`property/Property/Available`);
    },
    GetPropertyPosted(){
        return axios.get(`property/Property/All/Posted`);
    },
    GetPropertyDisposed(){
        return axios.get(`property/Property/All/Disposed`);
    },
    GetSingleProperty(context, data){
        return axios.get(`property/Property/${data}`);
    },
    UpdateProperty(context, data){
        return axios.put(`property/Property/${data.id}`, data);
    },
    DeleteProperty(context, data){
        return axios.delete(`property/Property/${data}`);
    },
    CreateProperty(context, data){
        return axios.post(`property/Property/Create`, data);
    },
    CreatePropertyMultiple(context, data){
        return axios.post(`property/Property/multiple/Create`, data);
    },
    PostProperty(context, data){
        return axios.put(`property/Property/post/${data}`, data);
    },
    ReturnProperty(context, data){
        return axios.put(`property/Property/return/${data}`, data);
    },
    DisposeProperty(context, data){
        return axios.put(`property/Property/dispose/${data}`, data);
    },
    PropertyUploadImage(context, data){
        return axios.post(`property/Property/File/Upload/${data.id}`, data);
    },

}