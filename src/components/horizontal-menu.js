import Vue from "vue";
import VueCryptojs from 'vue-cryptojs'
Vue.use(VueCryptojs);
let accessList = userAccessList();
export const menuItems = [
  {
    id: 1,
    label: "Dashboards",
    icon: "bx bxs-dashboard",
    link: "/",
    display: true
  },
  {
    id: 2,
    label: "My",
    icon: "bx bx-user-pin",
    isUiElement: true,
    display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'my' && x.AccessList.Type.toLowerCase() === 'my') ? true : false,
    subItems: [
      {
        id: 1,
        label: "Delivery Unit",
        isUiElement: true,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'Delivery Unit' && x.AccessList.Type.toLowerCase() === 'my') ? true : false,
        subItems: [
          {
            id: 1,
            label: "Targets",
            link: "/office/targets",
            parentId: 2,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'Targets' && x.AccessList.Type.toLowerCase() === 'my') ? true : false,
          },
          {
            id: 2,
            label: "OPCR",
            link: "/office/api",
            parentId: 2,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'OPCR' && x.AccessList.Type.toLowerCase() === 'my') ? true : false,
          },
          {
            id: 2,
            label: "Budget Item",
            isUiElement: true,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'Budget Item' && x.AccessList.Type.toLowerCase() === 'my') ? true : false,
            subItems: [
              {
                id: 1,
                label: "Resources",
                link: "/office/budget-item",
                parentId: 2,
                display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'Resources' && x.AccessList.Type.toLowerCase() === 'my') ? true : false,
              },
              {
                id: 2,
                label: "For Charging",
                link: "/office/for-charging",
                parentId: 2,
                display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'For Charging' && x.AccessList.Type.toLowerCase() === 'my') ? true : false,
              },
            ],
          },
          {
            id: 3,
            label: "Purchase Request",
            link: "/office/pr",
            parentId: 2,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'Purchase Request' && x.AccessList.Type.toLowerCase() === 'my') ? true : false,
          },
          {
            id: 4,
            label: "Department Allocation",
            link: "/office/department-allocation",
            parentId: 2,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'department allocation' && x.AccessList.Type.toLowerCase() === 'my') ? true : false,
          },
        ],
      },
      {
        id: 3,
        label: "Responsibility Center",
        parentId: 2,
        isUiElement: true,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'responsibility center'  && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
        subItems: [
          {
            id: 1,
            label: "Financial Review",
            link: "/responsibility-center/financial",
            parentId: 3,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'financial review'  && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
          },
          {
            id: 2,
            label: "Technical Review",
            link: "/responsibility-center/technical",
            parentId: 3,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'technical review'  && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Finance",
    icon: "bx bx-money",
    isUiElement: true,
    display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'finance' && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
    subItems: [
      
      {
        id: 1,
        label: "Manage Funds",
        parentId: 3,
        isUiElement: true,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'manage funds' && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
        subItems: [
          {
            id: 1,
            label: "Fund Source", /** Fund source */
            link: "/finance/fund-source",
            parentId: 1,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'fund source' && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
          },
          {
            id: 2,
            label: "Allocations to Object of Expenditure", /** OE */
            link: "/finance/expenditures",
            parentId: 1,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'allocations to object of expenditure' && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
          },
          {
            id: 3,
            label: "Cascaded Funds", /** Office Budget */
            link: "/finance/office-budget",
            parentId: 1,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'cascaded funds' && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
          },
        ]
      },
      {
        id: 2,
        label: "Transactions",
        parentId: 3,
        isUiElement: true,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'transactions' && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
        subItems: [
          {
            id: 1,
            label: "BURS",
            link: "/finance/burs",
            parentId: 2,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'burs' && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
          },
          {
            id: 2,
            label: "Disbursement",
            link: "/finance/disbursement",
            parentId: 2,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'disbursement' && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
          },
        ]
      },
      {
        id: 3,
        label: "Settings",
        parentId: 3,
        isUiElement: true,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'settings' && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
        subItems: [
          {
            id: 1,
            label: "Chart of Accounts",
            link: "/finance/fund-classification",
            parentId: 3,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'chart of accounts' && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
          },
          {
            id: 2,
            label: "Fund Cluster", 
            link: "/finance/fund-cluster",
            parentId: 3,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'fund cluster' && x.AccessList.Type.toLowerCase() === 'finance') ? true : false,
          },
        ]
      },
    ],
  },
  {
    id: 4,
    label: "Administration",
    icon: "bx bx-buildings",
    isUiElement: true,
    display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'administration' && x.AccessList.Type.toLowerCase() === 'administration') ? true : false,
    subItems: [
      {
        id: 1,
        label: "Agencies",
        link: "/administration/agency",
        parentId: 4,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'agency' && x.AccessList.Type.toLowerCase() === 'administration') ? true : false,
      },
      {
        id: 2,
        label: "Employees",
        link: "/administration/employees",
        parentId: 4,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'employees' && x.AccessList.Type.toLowerCase() === 'administration') ? true : false,
      },
      {
        id: 3,
        label: "Settings",
        link: "/administration/settings",
        parentId: 4,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'settings' && x.AccessList.Type.toLowerCase() === 'administration') ? true : false,
      },
    ],
  },
  {
    id: 5,
    label: "Planning",
    icon: "bx bx-notepad",
    isUiElement: true,
    display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'planning' && x.AccessList.Type.toLowerCase() === 'planning') ? true : false,
    subItems: [
      {
        id: 1,
        label: "Outcomes",
        link: "/planning/outcome",
        parentId: 5,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'outcome' && x.AccessList.Type.toLowerCase() === 'planning') ? true : false,
      },
      {
        id: 2,
        label: "KPI List",
        link: "/planning/indicator",
        parentId: 5,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'kpi list' && x.AccessList.Type.toLowerCase() === 'planning') ? true : false,
      },
      {
        id: 8,
        label: "API List",
        link: "/planning/api-list",
        parentId: 5,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'api list' && x.AccessList.Type.toLowerCase() === 'planning') ? true : false,
      },
      {
        id: 5,
        label: "Research",
        link: "/planning/research",
        parentId: 5,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'research' && x.AccessList.Type.toLowerCase() === 'planning') ? true : false,
      },
      {
        id: 8,
        label: "Settings",
        link: "/planning/settings",
        parentId: 5,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'settings' && x.AccessList.Type.toLowerCase() === 'planning') ? true : false,
      },
    ],
  },
  {
    id: 6,
    label: "Procurement",
    icon: "bx bx-copy-alt",
    isUiElement: true,
    display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'procurement' && x.AccessList.Type.toLowerCase() === 'procurement') ? true : false,
    subItems: [
      {
        id: 11,
        label: "List of Procurables",
        link: "/procurement/procurables",
        parentId: 6,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'list of procurables' && x.AccessList.Type.toLowerCase() === 'procurement') ? true : false,
      },
      {
        id: 11,
        label: "Consolidated Procurable Resource",
        link: "/procurement/cpr",
        parentId: 6,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'consolidated procurable resource' && x.AccessList.Type.toLowerCase() === 'procurement') ? true : false,
      },
      {
        id: 7,
        label: "Manage Purchase Request",
        link: "/procurement/manage-pr",
        parentId: 6,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'manage purchase request' && x.AccessList.Type.toLowerCase() === 'procurement') ? true : false,
      },
      {
        id: 4,
        label: "Request For Quotation",
        link: "/procurement/rfq",
        parentId: 6,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'request for quotation' && x.AccessList.Type.toLowerCase() === 'procurement') ? true : false,
      },
      {
        id: 12,
        label: "Purchase Order",
        link: "/procurement/po",
        parentId: 6,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'purchase order' && x.AccessList.Type.toLowerCase() === 'procurement') ? true : false,
      },
      {
        id: 9,
        label: "Settings",
        link: "/procurement/settings",
        parentId: 6,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'settings' && x.AccessList.Type.toLowerCase() === 'procurement') ? true : false,
      },
    ],
  },
  {
    id: 7,
    label: "Supply & Assets",
    icon: "bx bx-box",
    isUiElement: true,
    display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'supply & assets' && x.AccessList.Type.toLowerCase() === 'supply & assets') ? true : false,
    subItems: [
      {
        id: 1,
        label: "IAR",
        link: "/property/iar",
        parentId: 7,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'iar' && x.AccessList.Type.toLowerCase() === 'supply & assets') ? true : false,
      },
      {
        id: 2,
        label: "Properties",
        parentId: 7,
        isUiElement: true,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'properties' && x.AccessList.Type.toLowerCase() === 'supply & assets') ? true : false,
        subItems: [
          {
            id: 1,
            label: "Pending",
            link: "/property/register",
            parentId: 1,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'pending' && x.AccessList.Type.toLowerCase() === 'supply & assets') ? true : false,
          },
          // {
          //   id: 2,
          //   label: "For Review",
          //   link: "/property/review",
          //   parentId: 7,
          // },
          {
            id: 2,
            label: "For Review",
            link: "/property/review",
            parentId: 7,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'for review' && x.AccessList.Type.toLowerCase() === 'supply & assets') ? true : false,
          },
          {
            id: 3,
            label: "Un-assigned",
            link: "/property/unassigned",
            parentId: 2,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'un-assigned' && x.AccessList.Type.toLowerCase() === 'supply & assets') ? true : false,
          },
          {
            id: 3,
            label: "For Disposal",
            link: "/property/dispose",
            parentId: 2,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'for disposal' && x.AccessList.Type.toLowerCase() === 'supply & assets') ? true : false,
          },
          {
            id: 4,
            label: "Properties",
            link: "/property/posted",
            parentId: 2,
            display: true,
          },
        ]
      },
      {
        id: 6,
        label: "Request for Payment",
        link: "/supply-and-assets/request-for-payment",
        parentId: 7,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'request for payment' && x.AccessList.Type.toLowerCase() === 'supply & assets') ? true : false,
      },
      {
        id: 4,
        label: "Settings",
        parentId: 7,
        isUiElement: true,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'settings' && x.AccessList.Type.toLowerCase() === 'supply & assets') ? true : false,
        subItems: [
          {
            id: 1,
            label: "Location",
            link: "/property/location",
            parentId: 1,
            display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'location' && x.AccessList.Type.toLowerCase() === 'supply & assets') ? true : false,
          },
        ]
      },
    ],
  },
  {
    id: 8,
    label: "Inspection",
    icon: "bx bx-search-alt",
    isUiElement: true,
    display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'inspection' && x.AccessList.Type.toLowerCase() === 'inspection') ? true : false,
    subItems: [
      {
        id: 1,
        label: "Incoming",
        link: "/inspection/incoming",
        parentId: 8,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'incoming' && x.AccessList.Type.toLowerCase() === 'inspection') ? true : false,
      },
      {
        id: 2,
        label: "IAR",
        link: "/inspection/iar",
        parentId: 8,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'iar' && x.AccessList.Type.toLowerCase() === 'inspection') ? true : false,
      },
      {
        id: 3,
        label: "Property",
        link: "/inspection/property",
        parentId: 8,
        display: accessList.find(x => x.AccessList.Access.toLowerCase() === 'property' && x.AccessList.Type.toLowerCase() === 'inspection') ? true : false,
      },
    ],
  },
];
function userAccessList(){
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
}