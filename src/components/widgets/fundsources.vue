<script>
export default {
  props: {
    tableData: null,
  },
  data() {
    return {
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortDesc: false,
      fields: [
        // {
        //   key: "id",
        //   sortable: true,
        // },
        {
          key: "fundSource",
          label: "Fund Source",
          sortable: true,
        },
        {
          key: "expiryDate",
          label: "Expiry Date",
          sortable: true,
        },
        {
          key: "account",
          label: "Account",
          sortable: true,
        },
        {
          key: "budget",
          label: "Budget",
          sortable: true,
        },
        {
          key: "actions",
        },
      ],
    };
  },
  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    viewTransactions(data) {
      this.$emit("view-transactions", data);
    },
    updateItem(data) {
      this.$emit("update-item", data);
    },
    deleteItem(data) {
      this.$emit("delete-item", data);
    },
    viewOE(id) {
      this.$emit("view-oe", id);
    },
    formatCurrency(data) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("en-US");
    },
    checkExpiry(data) {
      return new Date() < new Date(data) ? true : false;
    },
    print(id) {
      this.$emit("print", id);
    },
  },
  computed: {
    rows() {
      return this.tableData.length;
    },
  },
};
</script>

<template>
  <div>
    <div id="datatable_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
      <div class="row">
        <div class="col-sm-12 col-md-6">
          <div id="tickets-table_length" class="dataTables_length">
            <label class="d-inline-flex align-items-center">
              Show&nbsp;
              <b-form-select
                class="form-select form-select-sm mx-1"
                v-model="perPage"
                size="sm"
                :options="pageOptions"
              ></b-form-select
              >&nbsp;entries
            </label>
          </div>
        </div>
        <!-- Search -->
        <div class="col-sm-12 col-md-6">
          <div id="tickets-table_filter" class="dataTables_filter text-md-end">
            <label class="d-inline-flex align-items-center">
              Search:
              <b-form-input
                v-model="filter"
                type="search"
                placeholder="Search..."
                class="form-control form-control-sm ms-2"
              ></b-form-input>
            </label>
          </div>
        </div>
        <!-- End search -->
      </div>
      <div class="row">
        <!-- table data -->
        <div class="col-lg-12">
          <div class="table-responsive mb-0">
            <b-table
              class="table project-list-table table-nowrap align-middle table-borderless"
              :items="tableData"
              :fields="fields"
              :per-page="perPage"
              :current-page="currentPage"
              :sort-desc.sync="sortDesc"
              :filter="filter"
              :filter-included-fields="filterOn"
              @filtered="onFiltered"
              show-empty
            >
              <template #empty="scope">
                <div class="text-center">
                  <h5 class="text-secondary">{{ scope.emptyText }}</h5>
                </div>
              </template>
              <template #table-busy>
                <div class="d-flex justify-content-center align-items-center">
                  <div class="preloader-component me-2">
                    <div class="status">
                      <div class="spinner-chase w-20px h-20px">
                        <div class="chase-dot"></div>
                        <div class="chase-dot"></div>
                        <div class="chase-dot"></div>
                        <div class="chase-dot"></div>
                        <div class="chase-dot"></div>
                        <div class="chase-dot"></div>
                      </div>
                    </div>
                  </div>
                  <strong>Loading...</strong>
                </div>
              </template>
              <template #cell(fundSource)="row">
                <h5 class="font-size-15 ps-0 pb-0 mb-1">{{ row.item.sourceName }}</h5>
                <span class="text-muted ps-0 font-size-11">{{
                  row.item.description
                }}</span>
              </template>
              <template #cell(account)="row">
                <p class="ps-0">
                  <span class="text-muted font-size-13"
                    >Bank: <strong>{{ row.item.bankName }}</strong></span
                  >
                  <br />
                  <span class="text-muted font-size-13"
                    >Account: <strong>{{ row.item.accountNumber }}</strong></span
                  >
                </p>
              </template>
              <template #cell(budget)="row">
                <p class="ps-0">
                  <i class="bx bx-money me-1 text-info font-size-15"></i>
                  <span class="text-warning font-size-15">{{
                    formatCurrency(row.item.balance)
                  }}</span>
                </p>
              </template>
              <template #cell(expiryDate)="row">
                <span
                  class="badge ms-1 align-bottom font-size-12"
                  :class="[checkExpiry(row.item.expiry) ? 'bg-success' : 'bg-danger']"
                  >{{ formatDate(row.item.expiry) }}</span
                >
              </template>
              <template #cell(actions)="row">
                <b-dropdown
                  id="dropdown-dropleft"
                  right
                  variant="link"
                  toggle-class="text-decoration-none"
                  menu-class="dropdown-menu-end"
                >
                  <template #button-content>
                    <i class="fas fa-ellipsis-v"></i>
                  </template>
                  <b-dropdown-item @click="viewTransactions(row.item)" variant="secondary"
                    ><i class="mdi mdi-bank-transfer font-size-18 align-middle me-2"></i
                    >View Details</b-dropdown-item
                  >
                  <b-dropdown-item @click="print(row.item.id)" variant="secondary"
                    ><i class="bx bx-printer font-size-18 align-middle me-2"></i
                    >Reports</b-dropdown-item
                  >
                  <b-dropdown-item @click="viewOE(row.item.id)" variant="secondary"
                    ><i class="mdi mdi-view-list font-size-18 align-middle me-2"></i>View
                    Accounts</b-dropdown-item
                  >
                  <b-dropdown-item @click="updateItem(row.item)" variant="secondary">
                    <i class="bx bx-edit fofont-size-18 align-middle me-2"></i
                    >Edit</b-dropdown-item
                  >
                  <b-dropdown-item @click="deleteItem(row.item)" variant="danger"
                    ><i class="mdi mdi-trash-can font-size-18 align-middle me-2"></i
                    >Delete</b-dropdown-item
                  >
                </b-dropdown>
              </template>
            </b-table>
          </div>
        </div>
        <!-- table data -->
      </div>
      <div class="row">
        <div class="col">
          <div class="dataTables_paginate paging_simple_numbers float-end">
            <ul class="pagination pagination-rounded mb-0">
              <!-- pagination -->
              <b-pagination
                v-model="currentPage"
                :total-rows="rows"
                :per-page="perPage"
              ></b-pagination>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
