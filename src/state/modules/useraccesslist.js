import { coreAPI } from "../../axios";

export const actions = {
    // UserAccessList
    GetUserAccessList(context, data){
        return coreAPI.get(`UserAccessList/All?applicationUserId=${data}`);
    },
    CreateUserAccessList(context, data){
        return coreAPI.post(`UserAccessList/Create`, data);
    },
}