import Vue from "vue";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import VueCryptojs from 'vue-cryptojs'
import store from "@/state/store";

const toastOpt = {
  transition: "Vue-Toastification__bounce",
  maxToasts: 20,
  newestOnTop: true,
};
Vue.use(Toast, toastOpt);
Vue.use(VueCryptojs);

Vue.prototype.formatDate = function(dt) {
  if (dt == null) return "";
  let ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(dt);
  let mo = new Intl.DateTimeFormat("en", { month: "long" }).format(dt);
  let da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(dt);
  return `${mo} ${da}, ${ye}`;
};
Vue.prototype.formatDateShort = function(dt) {
  if (dt == null) return "";
  let ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(dt);
  let mo = new Intl.DateTimeFormat("en", { month: "short" }).format(dt);
  let da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(dt);
  return `${mo} ${da}, ${ye}`;
};
Vue.prototype.formatDateWithTime = function(dt) {
  if (dt == null) return "";
  let time = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(dt);
  return time;
};
Vue.prototype.getDate = function(data) {
  var year = new Date(data).getFullYear();
  var month = new Date(data).getMonth() + 1;
  var day = new Date(data).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}T16:00:00`;
};
Vue.prototype.getExactAmt = function(amount) {
  return amount.replace(/,/g, "");
};
Vue.prototype.diffDate = (date) => {
  const date1 = new Date(date);
  const date2 = new Date();
  const diffTime = Math.abs(date2 - date1);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const diffSecond = diffTime / 1000;
  const diffMin = diffTime / (1000 * 60);
  const diffHour = diffTime / (1000 * 60 * 60);

  if (diffDays >= 1) {
    if (diffDays > 365) {
      return `${diffDays % 365} year ago`;
    }
    if (diffDays > 30) {
      return `${diffDays % 30} month ago`;
    }
    return `${Math.trunc(diffDays)} days ago`;
  } else {
    if (diffHour >= 1) {
      return `${Math.trunc(diffHour)} hours ago`;
    }
    if (diffMin >= 1) {
      return `${Math.trunc(diffMin)} min ago`;
    }
    if (diffSecond >= 0) {
      return `${Math.trunc(diffSecond)} seconds ago`;
    }
    return "0 second ago";
  }
};
Vue.prototype.pageLoader = (display) => {
  if (display) {
    document.getElementById("full-page-loader").classList.remove("d-none");
  } else {
    document.getElementById("full-page-loader").classList.add("d-none");
  }
};
Vue.prototype.scrollToTop = () => {
  window.scrollTo(0, 0);
};
Vue.prototype.showToast = (message, type) => {
  Vue.$toast[`${type}`](message, {
    position: "top-right",
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: false,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false,
  });
};
Vue.prototype.numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
Vue.prototype.decryptToken = (encryptedText) => {
  var rawData = Vue.CryptoJS.enc.Base64.parse(encryptedText);
  var key = Vue.CryptoJS.enc.Latin1.parse(store.state.data.decipherCode);
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
  return plaintext;
}