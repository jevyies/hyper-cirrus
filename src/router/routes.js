import store from "@/state/store";

export default [
  {
    path: "/",
    name: "default",
    meta: {
      authRequired: true,
    },
    component: () => import("./views/dashboards/default"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("./views/account/login"),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (localStorage.getItem("user")) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/reset-password",
    name: "renewpwd",
    meta: { authRequired: true },
    component: () => import("./views/account/reset-password"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("./views/account/register"),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters["auth/loggedIn"]) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/forgot-password",
    name: "Forgot password",
    component: () => import("./views/account/forgot-password"),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters["auth/loggedIn"]) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/logout",
    name: "logout",
    meta: {
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        localStorage.removeItem("cycle");
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("auth.currentUser");
        const authRequiredOnPreviousRoute = routeFrom.matched.some((route) =>
          route.push("/login")
        );
        // Navigate back to previous page, or home as a fallback
        next(
          authRequiredOnPreviousRoute ? { name: "default" } : { ...routeFrom }
        );
      },
    },
  },
  {
    path: "/404",
    name: "404",
    component: require("./views/utility/404").default,
  },
  {
    path: "/500",
    name: "500",
    component: require("./views/utility/500").default,
  },
  {
    path: "*",
    redirect: "404",
  },
  {
    path: "/account-settings",
    name: "account-settings",
    meta: { authRequired: true },
    component: () => import("./views/account/account-settings"),
  },
  {
    path: "/finance/fund-cluster",
    name: "fund-cluster",
    meta: { authRequired: true },
    component: () => import("./views/finance/fund-cluster"),
  },
  {
    path: "/finance/fund-cluster/sources/:id",
    name: "fund-cluster-source",
    meta: { authRequired: true },
    component: () => import("./views/finance/fund-source-id"),
  },
  {
    path: "/finance/fund-source",
    name: "fund-source",
    meta: { authRequired: true },
    component: () => import("./views/finance/fund-source"),
  },
  {
    path: "/finance/mfo-list/:id",
    name: "mfo",
    meta: { authRequired: true },
    component: () => import("./views/finance/mfo-list"),
  },
  {
    path: "/finance/budget-line-item/:id",
    name: "budget-item",
    meta: { authRequired: true },
    component: () => import("./views/finance/budget-line-item"),
  },
  {
    path: "/finance/prexc-fund-classification",
    name: "prexc-fund-classification",
    meta: { authRequired: true },
    component: () => import("./views/finance/prexc-fund-classification"),
  },

  {
    path: "/finance/fund-classification",
    name: "fund-classification",
    meta: { authRequired: true },
    component: () => import("./views/finance/fund-classification"),
  },
  {
    path: "/administration/agency",
    name: "agency",
    meta: { authRequired: true },
    component: () => import("./views/administration/agency"),
  },
  {
    path: "/administration/campus/:id",
    name: "campus",
    meta: { authRequired: true },
    component: () => import("./views/administration/campus"),
  },
  {
    path: "/administration/office/:id",
    name: "office",
    meta: { authRequired: true },
    component: () => import("./views/administration/office"),
  },
  {
    path: "/administration/delivery-unit/:id",
    name: "delivery-unit",
    meta: { authRequired: true },
    component: () => import("./views/administration/deliveryUnit"),
  },
  {
    path: "/administration/department/:id",
    name: "department",
    meta: { authRequired: true },
    component: () => import("./views/administration/department"),
  },
  {
    path: "/administration/employees",
    name: "employees",
    meta: { authRequired: true },
    component: () => import("./views/administration/employees"),
  },
  {
    path: "/planning/program",
    name: "program",
    meta: { authRequired: true },
    component: () => import("./views/planning/program"),
  },
  {
    path: "/planning/outcome",
    name: "outcome",
    meta: { authRequired: true },
    component: () => import("./views/planning/outcome"),
  },
  {
    path: "/planning/prexc/:id",
    name: "prexc",
    meta: { authRequired: true },
    component: () => import("./views/planning/prexc"),
  },
  {
    path: "/planning/indicator",
    name: "indicator",
    meta: { authRequired: true },
    component: () => import("./views/planning/indicator"),
  },
  {
    path: "/planning/target/:id",
    name: "target",
    meta: { authRequired: true },
    component: () => import("./views/planning/target"),
  },
  {
    path: "/planning/api/:id",
    name: "api",
    meta: { authRequired: true },
    component: () => import("./views/planning/api"),
  },
  {
    path: "/office/targets",
    name: "myTarget",
    meta: { authRequired: true },
    component: () => import("./views/office/targets"),
  },
  {
    path: "/office/api",
    name: "myAPI",
    meta: { authRequired: true },
    component: () => import("./views/office/api"),
  },
  {
    path: "/office/budget-item",
    name: "myBudgetItemResources",
    meta: { authRequired: true },
    component: () => import("./views/office/office-budget-item"),
  },
  {
    path: "/office/for-charging",
    name: "myBudgetItemForCharging",
    meta: { authRequired: true },
    component: () => import("./views/office/for-charging"),
  },
  {
    path: "/office/pr",
    name: "pr",
    meta: { authRequired: true },
    component: () => import("./views/office/pr"),
  },
  {
    path: "/office/department-allocation",
    name: "myDepartmentAllocation",
    meta: { authRequired: true },
    component: () => import("./views/office/department-allocation"),
  },
  {
    path: "/planning/extension-activity/:id",
    name: "extension-activity",
    meta: { authRequired: true },
    component: () => import("./views/planning/extension-activity"),
  },
  {
    path: "/planning/research",
    name: "research",
    meta: { authRequired: true },
    component: () => import("./views/planning/research"),
  },
  {
    path: "/procurement/manage-pr",
    name: "managePR",
    meta: { authRequired: true },
    component: () => import("./views/procurement/manage-pr"),
  },
  {
    path: "/procurement/rfq",
    name: "rfq",
    meta: { authRequired: true },
    component: () => import("./views/procurement/rfq"),
  },
  {
    path: "/procurement/po",
    name: "po",
    meta: { authRequired: true },
    component: () => import("./views/procurement/po"),
  },
  {
    path: "/responsibility-center/financial",
    name: "responsibility-center-financial",
    meta: { authRequired: true },
    component: () => import("./views/responsibility-center/financial"),
  },
  {
    path: "/responsibility-center/technical",
    name: "responsibility-center-technical",
    meta: { authRequired: true },
    component: () => import("./views/responsibility-center/technical"),
  },
  {
    path: "/department/ppmp",
    name: "departmentPPMP",
    meta: { authRequired: true },
    component: () => import("./views/department/ppmp"),
  },
  {
    path: "/inspection/incoming",
    name: "inspectionIncoming",
    meta: { authRequired: true },
    component: () => import("./views/inspection/incoming"),
  },
  {
    path: "/inspection/iar",
    name: "inspectionIar",
    meta: { authRequired: true },
    component: () => import("./views/inspection/iar"),
  },
  {
    path: "/supply-and-assets/request-for-payment",
    name: "RFPPO",
    meta: { authRequired: true },
    component: () => import("./views/property/rfp-po"),
  },
  {
    path: "/inspection/property",
    name: "inspectionProperty",
    meta: { authRequired: true },
    component: () => import("./views/inspection/property"),
  },
  {
    path: "/inspection/propertyinspection/:id",
    name: "inspectionPropertyInspect",
    meta: { authRequired: true },
    component: () => import("./views/inspection/propertyinspection"),
  },
  {
    path: "/property/iar",
    name: "propertyIar",
    meta: { authRequired: true },
    component: () => import("./views/property/iar"),
  },
  {
    path: "/property/register",
    name: "propertyRegister",
    meta: { authRequired: true },
    component: () => import("./views/property/register"),
  },
  {
    path: "/property/review",
    name: "propertyReview",
    meta: { authRequired: true },
    component: () => import("./views/property/review"),
  },
  {
    path: "/property/unassigned",
    name: "propertyUnassigned",
    meta: { authRequired: true },
    component: () => import("./views/property/unassigned"),
  },
  {
    path: "/property/dispose",
    name: "propertyDispose",
    meta: { authRequired: true },
    component: () => import("./views/property/dispose"),
  },
  {
    path: "/property/posted",
    name: "propertyPosted",
    meta: { authRequired: true },
    component: () => import("./views/property/posted"),
  },
  {
    path: "/property/inspection/:id",
    name: "propertyInspection",
    meta: { authRequired: true },
    component: () => import("./views/property/inspection"),
  },
  {
    path: "/procurement/procurables",
    name: "procurables",
    meta: { authRequired: true },
    component: () => import("./views/procurement/procurables"),
  },
  {
    path: "/procurement/cpr",
    name: "cpr",
    meta: { authRequired: true },
    component: () => import("./views/procurement/cpr"),
  },
  {
    path: "/planning/api-list",
    name: "api-list",
    meta: { authRequired: true },
    component: () => import("./views/planning/api-list"),
  },
  {
    path: "/excel-uploading",
    name: "excel-uploading",
    meta: { authRequired: true },
    component: () => import("./views/excel-uploading"),
  },
  {
    path: "/procurement/settings",
    name: "procurement-settings",
    meta: { authRequired: true },
    component: () => import("./views/procurement/settings"),
  },
  {
    path: "/planning/settings",
    name: "planning-settings",
    meta: { authRequired: true },
    component: () => import("./views/planning/settings"),
  },
  {
    path: "/administration/settings",
    name: "administration-settings",
    meta: { authRequired: true },
    component: () => import("./views/administration/settings"),
  },
];
