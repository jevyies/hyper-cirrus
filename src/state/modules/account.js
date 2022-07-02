import { api } from "../../axios";

export const actions = {
    CreateAccount(context, data) {
        return api.post("Account", data);
    },
    Login(context, data) {
        return api.post("Account/login", data);
    },
    ChangePassword(context, data) {
        return api.post("Account/changePassword", data);
    },
    ChangeEmail(context, data) {
        return api.put(`Account/Email/${data.id}`, data);
    },
    ChangePhoneNumber(context, data) {
        return api.put(`Account/Phone/${data.id}`, data);
    },
    VerifyPhoneNumber() {
        return api.post(`Account/Phone/Confirmation/`);
    },
    PhoneNumberVerification(context, data) {
        return api.post(`Account/Phone/Verify?code=${data}`);
    },
    GetProfile() {
        return api.get("Account/MyProfile");
    },
}