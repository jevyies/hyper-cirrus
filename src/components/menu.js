export const menuItems = [
  {
    id: 1,
    label: "Dashboards",
    icon: "bx bxs-dashboard",
    link: "/",
  },
  {
    id: 0,
    label: "Menu",
    isTitle: true,
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
            link: "/office/budget-item",
            parentId: 2,
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
      {
        id: 2,
        label: "Department",
        isUiElement: true,
        subItems: [
          {
            id: 1,
            label: "PPMP",
            link: "/department/ppmp",
            parentId: 2,
          },
        ],
      },
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
        label: "Fund Source",
        link: "/finance/fund-source",
        parentId: 3,
        isUiElement: true,
        subItems: [
          {
            id: 1,
            label: "Fund Source List",
            link: "/finance/fund-source",
            parentId: 1,
          },
          {
            id: 3,
            label: "Fund Classification",
            link: "/finance/fund-classification",
            parentId: 1,
          },
        ],
      },
      {
        id: 2,
        label: "Fund Cluster",
        link: "/finance/fund-cluster",
        parentId: 3,
      },
      {
        id: 3,
        label: "Office Budget",
        link: "/finance/office-budget",
        parentId: 3,
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
        label: "Mode of Procurement",
        link: "/administration/mode-of-procurement",
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
        label: "KPI",
        link: "/planning/indicator",
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
        id: 6,
        label: "Product",
        link: "/planning/product",
        parentId: 5,
      },
      {
        id: 7,
        label: "Academic Programs",
        link: "/planning/program",
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
        id: 1,
        label: "Items",
        link: "/procurement/item-list",
        parentId: 6,
      },
      {
        id: 11,
        label: "List of Procurables",
        link: "/procurement/procurables",
        parentId: 6,
      },
      {
        id: 11,
        label: "Consolidated Procurable Resource",
        link: "/procurement/consolidated-procurable-resource",
        parentId: 6,
      },
      // {
      //   id: 2,
      //   label: "Agency Procurement Plan",
      //   subItems: [
      //     {
      //       id: 1,
      //       label: "Details",
      //       link: "/procurement/app",
      //       parentId: 2,
      //     },
      //     {
      //       id: 2,
      //       label: "Manage",
      //       link: "/procurement/manage-app",
      //       parentId: 2,
      //     },
      //   ],
      // },
      {
        id: 4,
        label: "Request For Quotation",
        link: "/procurement/rfq",
        parentId: 6,
      },
      {
        id: 5,
        label: "Agency Purchase Request",
        subItems: [
          {
            id: 1,
            label: "Details",
            link: "/procurement/apr",
            parentId: 5,
          },
          {
            id: 2,
            label: "Manage",
            link: "/procurement/manage-apr",
            parentId: 5,
          },
        ],
      },
      {
        id: 11,
        label: "Abstract of Bids",
        link: "/procurement/aob",
        parentId: 6,
      },
      {
        id: 12,
        label: "Purchase Order",
        link: "/procurement/po",
        parentId: 6,
      },
      // {
      //   id: 6,
      //   label: "Manage PPMP",
      //   link: "/procurement/manage-ppmp",
      //   parentId: 6,
      // },
      {
        id: 7,
        label: "Manage Purchase Request",
        link: "/procurement/manage-pr",
        parentId: 6,
      },
      {
        id: 10,
        label: "Supplier List",
        link: "/procurement/supplier",
        parentId: 6,
      },
    ],
  },
  {
    id: 7,
    label: "Property",
    icon: "bx bx-box",
    isUiElement: true,
    subItems: [
      {
        id: 1,
        label: "Property Entry",
        link: "/property/entry",
        parentId: 7,
      },
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
        label: "Item List",
        link: "/inspection/items",
        parentId: 7,
      },
    ],
  },
];
