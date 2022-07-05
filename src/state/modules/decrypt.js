import Vue from "vue";
import VueCryptojs from 'vue-cryptojs'
Vue.use(VueCryptojs);

export const state = {
    userAccessList(){
        let encryptedText = localStorage.getItem("userAccess");
        var rawData = Vue.CryptoJS.enc.Base64.parse(encryptedText);
        var key = Vue.CryptoJS.enc.Latin1.parse("$b14cA5898a4e4142@@@2ea2143a2410");
        var plaintextData = Vue.CryptoJS.AES.decrypt(
            { ciphertext: rawData },
            key,
            {
                iv: Vue.CryptoJS.enc.Latin1.parse(
                    ""
                ),
            }
        );
        var plaintext = plaintextData.toString(Vue.CryptoJS.enc.Latin1);
        return JSON.parse(plaintext)
    },
}