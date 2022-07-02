export default [
  {
    path: "/finance/office-budget",
    name: "Office Budget",
    meta: {
      authRequired: true,
    },
    component: () => import("./views/finance/office-budget"),
  },
  {
    path: "/finance/account-groups/:id?",
    name: "Account Group",
    meta: {
      authRequired: true,
    },
    component: () => import("./views/finance/account-group"),
  },
  {
    path: "/finance/accounts/:group?/:id?",
    name: "Accounts",
    meta: {
      authRequired: true,
    },
    component: () => import("./views/finance/accounts"),
  },
  {
    path: "/finance/expenditures/:id?",
    name: "Object of Expenditures",
    meta: {
      authRequired: true,
    },
    component: () => import("./views/finance/expenditures"),
  },
  {
    path: "/finance/burs",
    name: "Budget Utilization Request and Status",
    meta: {
      authRequired: true,
    },
    component: () => import("./views/finance/burs"),
  },
  {
    path: "/finance/disbursement",
    name: "Disbursement",
    meta: {
      authRequired: true,
    },
    component: () => import("./views/finance/disbursement"),
  },
  {
    path: "/confirmation",
    name: "confirmation",
    meta: {
      authRequired: false,
    },
    component: () => import("./views/confirmation"),
  },
];
