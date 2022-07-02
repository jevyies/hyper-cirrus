import { api } from "../../axios";
export const actions = {
    //FileManager
    GetFiles(context, data) {
      return api.get(`FileManager/${data.id}/${data.type}`);
    },
    DeleteFile(context, data) {
        return api.delete(`FileManager/${data}`);
    },
}