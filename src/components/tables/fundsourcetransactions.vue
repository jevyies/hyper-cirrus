<script>
export default {
  props: {
    transactionTable: null,
    selectedFundSourceName: null,
    fundSourceBalance: null,
    tableBusy: null,
    selectedFundSource: null,
    isExpired: null,
  },
  data() {
    return {
      fields: [
        {
          key: "date",
          label: "Date",
          sortable: true,
          tdClass: "align-middle",
        },
        {
          key: "description",
          sortable: true,
          label: "Description",
          tdClass: "align-middle",
        },
        {
          key: "debit",
          sortable: true,
          label: "Debit",
          tdClass: "align-middle",
        },
        {
          key: "credit",
          sortable: true,
          label: "Credit",
          tdClass: "align-middle align-right",
        },
        {
          key: "balance",
          sortable: true,
          label: "Balance",
          tdClass: "align-middle align-right",
        },
      ],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      sortBy: "age",
      sortDesc: false,
      filter: null,
      filterOn: [],
      alert: {
        show: false,
        type: "",
        message: "",
      },
    };
  },
  computed: {
    rows() {
      return this.transactionTable.length;
    },
  },
  methods: {
    formatCurrency(data) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    addTransaction() {
      if (this.isExpired) {
        this.$swal({
          title: "Expired Fund Source",
          text: "This fund source has expired. You cannot add more transactions.",
          icon: "warning",
          showCancelButton: false,
          confirmButtonText: "OK",
        });
        return;
      }
      this.$emit("addTransaction");
    },
    transferFund() {
      if (this.isExpired) {
        this.$swal({
          title: "Expired Fund Source",
          text: "This fund source has expired. You cannot transfer funds anymore.",
          icon: "warning",
          showCancelButton: false,
          confirmButtonText: "OK",
        });
        return;
      }
      this.$emit("transferFund");
    },
  },
};
</script>

<template>
  <div>
    <div class="d-flex justify-content-between mb-3">
      <div class="pt-3">
        <h6>
          <span class="font-weight-light">Fund Source: </span>
          <span class="text-success">{{ selectedFundSourceName }}</span>
        </h6>
        <h6>
          <span class="font-weight-light">Unallocated Budget: </span>
          <span class="text-success">{{ formatCurrency(fundSourceBalance) }}</span>
        </h6>
      </div>
      <div class="text-end my-2">
        <b-dropdown v-if="selectedFundSource" variant="success" size="sm">
          <template slot="button-content">
            Add Transaction
            <i class="mdi mdi-chevron-down"></i>
          </template>
          <b-dropdown-item @click="addTransaction">
            <i class="bx bx-money font-size-16 align-middle me-2 text-success"></i>
            Add Funds
          </b-dropdown-item>
          <b-dropdown-item
            @click="transferFund"
            :disabled="fundSourceBalance < 1 ? true : false"
          >
            <i class="bx bx-transfer font-size-16 align-middle me-2 text-success"></i>
            Transfer Fund</b-dropdown-item
          >
        </b-dropdown>
      </div>
    </div>
    <div class="table-responsive mb-0">
      <b-table
        class="datatables"
        :items="transactionTable"
        :fields="fields"
        responsive="sm"
        :per-page="perPage"
        :current-page="currentPage"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :filter="filter"
        :filter-included-fields="filterOn"
        :busy="tableBusy"
        bordered
        outlined
        hover
        striped
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
        <template #cell(debit)="row">
          <span>{{ formatCurrency(row.item.debit) }}</span>
        </template>
        <template #cell(balance)="row">
          <span>{{ formatCurrency(row.item.balance) }}</span>
        </template>
        <template #cell(credit)="row">
          <span>{{ formatCurrency(row.item.credit) }}</span>
        </template>
        <template #cell(date)="row">
          <span>{{
            new Date(row.item.date).toLocaleDateString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })
          }}</span>
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
