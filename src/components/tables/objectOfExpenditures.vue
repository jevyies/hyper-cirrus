<script>
export default {
  props: {
    objectOfExpenditures: null,
  },
  data() {
    return {
      fields: [
        {
          key: "uacs",
          label: "UACS",
          sortable: true,
        },
        {
          key: "account",
          label: "Accout name",
          sortable: true,
        },
        {
          key: "group",
          label: "Accout group",
          sortable: true,
        },
        {
          key: "balance",
          label: "Balance",
          sortable: true,
          tdClass: "text-warning",
        },
        {
          key: "actions",
          label: "Actions",
          sortable: true,
        },
      ],
      totalRows: 1,
      currentPage: 1,
      perPage: 25,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "account",
      sortDesc: false,
      tableBusy: false,
    };
  },
  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    checkExpiry(data) {
      return new Date() < new Date(data) ? true : false;
    },
    formatCurrency(data) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    viewTransactions(row) {
      this.$emit("viewTransactions", row);
    },
    deleteItem(row) {
      this.$emit("deleteItem", row);
    },
    filterTable(row, filter) {
      if (row.account.accountName.toLowerCase().includes(filter)) {
        return true;
      } else {
        return false;
      }
    },
  },
  computed: {
    rows() {
      return this.objectOfExpenditures.length;
    },
  },
};
</script>

<template>
  <div>
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
              placeholder="Search account name..."
              class="form-control form-control-sm ms-2"
            ></b-form-input>
          </label>
        </div>
      </div>
      <!-- End search -->
    </div>
    <div class="table-responsive mb-0">
      <b-table
        class="datatable table-sm"
        :items="objectOfExpenditures"
        :fields="fields"
        responsive="sm"
        :per-page="perPage"
        :current-page="currentPage"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :filter="filter"
        :filter-function="filterTable"
        :busy="tableBusy"
        @filtered="onFiltered"
        bordered
        outlined
        striped
        show-empty
        selected-variant="success"
      >
        <template #empty="scope">
          <div class="text-center">{{ scope.emptyText }}</div>
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
        <template #cell(uacs)="row">
          {{ row.item.account.uacs }}
        </template>
        <template #cell(balance)="row">
          {{ row.item.balance ? formatCurrency(row.item.balance) : formatCurrency(0) }}
        </template>
        <template #cell(account)="row">
          {{ row.item.account.accountName }}
        </template>
        <template #cell(group)="row">
          {{ row.item.account.accountGroup.groupName }}
        </template>
        <template #cell(actions)="row">
          <div class="float-end" v-if="checkExpiry(row.item.fundSource.expiry)">
            <b-dropdown
              id="dropdown-dropleft"
              right
              variant="link"
              toggle-class="text-decoration-none"
              menu-class="dropdown-menu-end"
              no-caret
            >
              <template #button-content>
                <i class="fas fa-ellipsis-v"></i>
              </template>
              <b-dropdown-item @click="viewTransactions(row)" variant="secondary"
                ><i class="mdi mdi-format-list-checks font-size-18 me-1"></i>View
                Transactions</b-dropdown-item
              >
              <b-dropdown-item @click="deleteItem(row)" variant="danger"
                ><i class="mdi mdi-trash-can font-size-18 me-1"></i
                >Delete</b-dropdown-item
              >
            </b-dropdown>
          </div>
        </template>
      </b-table>
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
</template>
