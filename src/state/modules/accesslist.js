import { coreAPI } from "../../axios";

export const actions = {
    CreateAccessList(context, data) {
        return coreAPI.post("AccessList/CreateAccessList", data);
    },
    GetSingleAccessList(context, data) {
        return coreAPI.get(`AccessList/${data}`);
    },
    GetAllAccessList() {
        return coreAPI.get(`AccessList/GetAllAccessLists`);
    },
    UpdateAccessList(context, data) {
        return coreAPI.put(`AccessList/${data.id}`, data);
    },
    DeleteAccessList(context, data) {
        return coreAPI.delete(`AccessList/${data}`);
    },
}