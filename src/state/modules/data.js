export const state = {
  cycle: localStorage.getItem("cycle") ? localStorage.getItem("cycle") : new Date().getFullYear(),
  department: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).department : {},
  deliveryUnit: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).department.deliveryUnit : {},
  office: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).department.deliveryUnit.office : {},
  campus: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).department.deliveryUnit.office.campus : {},
  agency: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).department.deliveryUnit.office.campus.agency : {},
  rootFileDirectory: 'https://www.cocyfms.codes/files/',
  uploadURL: 'https://www.cocyfms.codes/api/FileManager/File/Upload',
  decipherCode: '$b14cA5898a4e4142@@@2ea2143a2410'
};
export const mutations = {
  changeCycle(state, data) {
    localStorage.setItem("cycle", data);
    state.cycle = data;
  },
};
export const getters = {
  getCycle(state) {
    return state.cycle;
  },
};
