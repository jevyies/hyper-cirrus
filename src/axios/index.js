import axios from "axios";

axios.defaults.baseURL = "https://www.cocyfms.codes/";
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
axios.interceptors.request.use(
  function(config) {
    config.headers.common["Authorization"] = `Bearer ${localStorage.getItem(
      "accessToken"
    )}`;
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

const config = {
  baseURL: "https://www.cocyfms.codes/",
  header: {
    "X-Requested-With": "XMLHttpRequest",
    "Access-Control-Allow-Origin": "*",
  },
};

export const api = axios.create({
  ...config,
  baseURL: config.baseURL + "api/",
});
api.interceptors.request.use(
  function(config) {
    config.headers.common["Authorization"] = `Bearer ${localStorage.getItem(
      "accessToken"
    )}`;
    updateResponse(config, "request");
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    updateResponse(response.config, "response");
    return response;
  },
  (error) => {
    updateResponse(error.config, "response");
    return Promise.reject(error);
  }
);

export const procurementAPI = axios.create({
  ...config,
  baseURL: config.baseURL + "procurement/",
});
procurementAPI.interceptors.request.use(
  (config) => {
    config.headers.common["Authorization"] = `Bearer ${localStorage.getItem(
      "accessToken"
    )}`;
    updateResponse(config, "request");
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
procurementAPI.interceptors.response.use(
  (response) => {
    updateResponse(response.config, "response");
    return response;
  },
  (error) => {
    updateResponse(error.config, "response");
    return Promise.reject(error);
  }
);

export const coreAPI = axios.create({
  ...config,
  baseURL: config.baseURL + "core/",
});
coreAPI.interceptors.request.use(
  (config) => {
    config.headers.common["Authorization"] = `Bearer ${localStorage.getItem(
      "accessToken"
    )}`;
    updateResponse(config, "response");
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);
coreAPI.interceptors.response.use(
  (response) => {
    updateResponse(response.config, "response");
    return response;
  },
  (error) => {
    updateResponse(error.config, "response");
    return Promise.reject(error);
  }
);

export const financeAPI = axios.create({
  ...config,
  baseURL: config.baseURL + "finance/",
});
financeAPI.interceptors.request.use(
  function(config) {
    config.headers.common["Authorization"] = `Bearer ${localStorage.getItem(
      "accessToken"
    )}`;
    updateResponse(config, "response");
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);
financeAPI.interceptors.response.use(
  (response) => {
    updateResponse(response.config, "response");
    return response;
  },
  (error) => {
    updateResponse(error.config, "response");
    return Promise.reject(error);
  }
);

export const planningAPI = axios.create({
  ...config,
  baseURL: config.baseURL + "planning/",
});

planningAPI.interceptors.request.use(
  function(config) {
    config.headers.common["Authorization"] = `Bearer ${localStorage.getItem(
      "accessToken"
    )}`;
    updateResponse(config, "response");
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

planningAPI.interceptors.response.use(
  (response) => {
    updateResponse(response.config, "response");
    return response;
  },
  (error) => {
    updateResponse(error.config, "response");
    return Promise.reject(error);
  }
);

function updateResponse({ method }, type) {
  if (type === "request") {
    if (
      method.toLowerCase() === "post" ||
      method.toLowerCase() === "put" ||
      method.toLowerCase() === "delete"
    ) {
      document.getElementById("full-page-loader").classList.remove("d-none");
    }
  } else {
    document.getElementById("full-page-loader").classList.add("d-none");
  }
}
