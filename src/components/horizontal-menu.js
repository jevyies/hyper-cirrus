export const menuItems = [
  {
    id: 1,
    label: "Dashboards",
    icon: "bx bxs-dashboard",
    link: "/",
  },
  {
    id: 2,
    label: "My",
    icon: "bx bx-user-pin",
    isUiElement: true,
    subItems: [
      {
        id: 1,
        label: "Delivery Unit",
        isUiElement: true,
        subItems: [
          {
            id: 1,
            label: "Targets",
            link: "/office/targets",
            parentId: 2,
          },
          {
            id: 2,
            label: "OPCR",
            link: "/office/api",
            parentId: 2,
          },
          {
            id: 2,
            label: "Budget Item",
            isUiElement: true,
            subItems: [
              {
                id: 1,
                label: "Resources",
                link: "/office/budget-item",
                parentId: 2,
              },
              {
                id: 2,
                label: "For Charging",
                link: "/office/for-charging",
                parentId: 2,
              },
            ],
          },
          {
            id: 3,
            label: "Purchase Request",
            link: "/office/pr",
            parentId: 2,
          },
          {
            id: 4,
            label: "Department Allocation",
            link: "/office/department-allocation",
            parentId: 2,
          },
        ],
      },
      // {
      //   id: 2,
      //   label: "Department",
      //   isUiElement: true,
      //   subItems: [
      //     {
      //       id: 1,
      //       label: "PPMP",
      //       link: "/department/ppmp",
      //       parentId: 2,
      //     },
      //   ],
      // },
      {
        id: 3,
        label: "Responsibility Center",
        parentId: 2,
        isUiElement: true,
        subItems: [
          {
            id: 1,
            label: "Financial Review",
            link: "/responsibility-center/financial",
            parentId: 3,
          },
          {
            id: 2,
            label: "Technical Review",
            link: "/responsibility-center/technical",
            parentId: 3,
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
    subItems: [
      
      {
        id: 1,
        label: "Manage Funds",
        parentId: 3,
        isUiElement: true,
        subItems: [
          {
            id: 1,
            label: "Fund Source", /** Fund source */
            link: "/finance/fund-source",
            parentId: 1,
          },
          {
            id: 2,
            label: "Allocations to Object of Expenditure", /** OE */
            link: "/finance/expenditures",
            parentId: 1,
          },
          {
            id: 3,
            label: "Cascaded Funds", /** Office Budget */
            link: "/finance/office-budget",
            parentId: 1,
          },
        ]
      },
      {
        id: 2,
        label: "Transactions",
        parentId: 3,
        isUiElement: true,
        subItems: [
          {
            id: 1,
            label: "BURS",
            link: "/finance/burs",
            parentId: 2,
          },
          {
            id: 2,
            label: "Disbursement",
            link: "/finance/disbursement",
            parentId: 2,
          },
        ]
      },
      {
        id: 3,
        label: "Settings",
        parentId: 3,
        isUiElement: true,
        subItems: [
          {
            id: 1,
            label: "Chart of Accounts",
            link: "/finance/fund-classification",
            parentId: 3,
          },
          {
            id: 2,
            label: "Fund Cluster", 
            link: "/finance/fund-cluster",
            parentId: 3,
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
    subItems: [
      {
        id: 1,
        label: "Agencies",
        link: "/administration/agency",
        parentId: 4,
      },
      {
        id: 2,
        label: "Employees",
        link: "/administration/employees",
        parentId: 4,
      },
      {
        id: 3,
        label: "Settings",
        link: "/administration/settings",
        parentId: 4,
      },
    ],
  },
  {
    id: 5,
    label: "Planning",
    icon: "bx bx-notepad",
    isUiElement: true,
    subItems: [
      {
        id: 1,
        label: "Outcomes",
        link: "/planning/outcome",
        parentId: 5,
      },
      {
        id: 2,
        label: "KPI List",
        link: "/planning/indicator",
        parentId: 5,
      },
      {
        id: 8,
        label: "API List",
        link: "/planning/api-list",
        parentId: 5,
      },
      {
        id: 4,
        label: "Company",
        link: "/planning/company",
        parentId: 5,
      },
      {
        id: 5,
        label: "Research",
        link: "/planning/research",
        parentId: 5,
      },
      {
        id: 8,
        label: "Settings",
        link: "/planning/settings",
        parentId: 5,
      },
    ],
  },
  {
    id: 6,
    label: "Procurement",
    icon: "bx bx-copy-alt",
    isUiElement: true,
    subItems: [
      {
        id: 11,
        label: "List of Procurables",
        link: "/procurement/procurables",
        parentId: 6,
      },
      {
        id: 11,
        label: "Consolidated Procurable Resource",
        link: "/procurement/cpr",
        parentId: 6,
      },
      {
        id: 7,
        label: "Manage Purchase Request",
        link: "/procurement/manage-pr",
        parentId: 6,
      },
      {
        id: 4,
        label: "Request For Quotation",
        link: "/procurement/rfq",
        parentId: 6,
      },
      {
        id: 12,
        label: "Purchase Order",
        link: "/procurement/po",
        parentId: 6,
      },
      {
        id: 9,
        label: "Settings",
        link: "/procurement/settings",
        parentId: 6,
      },
    ],
  },
  {
    id: 7,
    label: "Supply & Assets",
    icon: "bx bx-box",
    isUiElement: true,
    subItems: [
      {
        id: 1,
        label: "IAR",
        link: "/property/iar",
        parentId: 7,
        // isUiElement: true,
        // subItems: [
        //   {
        //     id: 1,
        //     label: "Pending",
        //     link: "/property/register",
        //     parentId: 1,
        //   },
        //   {
        //     id: 2,
        //     label: "For Review",
        //     link: "/property/review",
        //     parentId: 7,
        //   },
        // ]
      },
      {
        id: 2,
        label: "Properties",
        parentId: 7,
        isUiElement: true,
        subItems: [
          {
            id: 1,
            label: "Pending",
            link: "/property/register",
            parentId: 1,
          },
          {
            id: 2,
            label: "For Review",
            link: "/property/review",
            parentId: 7,
          },
          {
            id: 3,
            label: "Un-assigned",
            link: "/property/unassigned",
            parentId: 2,
          },
          {
            id: 4,
            label: "For Disposal",
            link: "/property/dispose",
            parentId: 2,
          },
          {
            id: 5,
            label: "Properties",
            link: "/property/posted",
            parentId: 2,
          },
        ]
      },
      {
        id: 6,
        label: "Request for Payment",
        link: "/supply-and-assets/request-for-payment",
        parentId: 7,
      },
      // {
      //   id: 6,
      //   label: "For Inspection",
      //   link: "/property/inspection",
      //   parentId: 7,
      // },
    ],
  },
  {
    id: 8,
    label: "Inspection",
    icon: "bx bx-search-alt",
    isUiElement: true,
    subItems: [
      {
        id: 1,
        label: "Incoming",
        link: "/inspection/incoming",
        parentId: 8,
      },
      {
        id: 2,
        label: "IAR",
        link: "/inspection/iar",
        parentId: 8,
      },
      {
        id: 3,
        label: "Property",
        link: "/inspection/property",
        parentId: 8,
      },
    ],
  },
];
