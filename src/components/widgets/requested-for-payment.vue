<script>
export default {
  props: {
    records: {},
  },
  data() {
    return {
      filter: null,
      totalRows: 1,
      currentPage: 1,
      perPage: 25,
      pageOptions: [10, 25, 50, 100],
      filterOn: [],
      sortBy: "company.name",
      sortDesc: false,
      tableBusy: false,
      fields: [
        {
          key: "id",
          sortable: true,
        },
        {
          key: "rfpNumber",
          label: "RFP Number",
          sortable: true,
        },
        {
          key: "payee",
          label: "Payee",
          sortable: true,
        },
        {
          key: "expenditure",
          label: "Expenditure",
          sortable: true,
        },
        {
          key: "rfpDate",
          label: "RFP Date",
          sortable: true,
        },
        {
          key: "rfpDate",
          label: "RFP Date",
          sortable: true,
        },
        {
          key: "amount",
          label: "Amount",
        },
        {
          key: "actions",
          label: "Actions",
        },
      ],
    };
  },
  computed: {
    rows() {
      return this.records.length;
    },
  },
  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    formatCurrency(data) {
      return new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("en-US");
    },
    postPayment(item) {
      this.$swal({
        title: "Are you sure?",
        text: "You are about to post this payment.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, post it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("rfppayment/postPayment", item.id)
            .then((response) => {
              this.$emit("postPayment", item);
              this.$swal({
                title: "Success!",
                text: "Payment has been posted.",
                icon: "success",
              });
            })
            .catch(() => {
              this.$swal({
                title: "Error!",
                text:
                  "There was an error posting this payment. Please contact your administrator",
                icon: "error",
              });
            });
        }
      });
    },
  },
};
</script>

<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <label class="d-inline-flex align-items-center">
          Search:
          <b-form-input
            autocomplete="off"
            v-model="filter"
            type="search"
            placeholder="Search..."
            class="form-control form-control-sm ms-2"
          ></b-form-input>
        </label>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-lg-12">
        <div class="table-responsive mb-0">
          <b-table
            class="datatables"
            :items="records"
            :fields="fields"
            responsive="sm"
            :per-page="perPage"
            :current-page="currentPage"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :filter="filter"
            :filter-included-fields="filterOn"
            :busy="tableBusy"
            @filtered="onFiltered"
            bordered
            outlined
            hover
            striped
            show-empty
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
            <template #cell(actions)="row">
              <div class="text-center" v-if="row.item.status.toLowerCase() === 'posted'">
                <p class="mb-0">
                  <span class="text-success">POSTED </span> on
                  <span> {{ formatDate(row.item.datePosted) }}</span>
                </p>
              </div>
              <div class="text-center" v-if="row.item.status.toLowerCase() === 'pending'">
                <b-button
                  variant="outline-info"
                  size="sm"
                  class="px-3"
                  @click="postPayment(row.item)"
                >
                  <i class="bx bx-log-in me-1"></i> Post</b-button
                >
              </div>
            </template>
            <template #cell(expenditure)="row">
              {{ row.item.rfpPaymentItem.deliveryUnitBudgetItem.objectOfExpenditure.account.accountName }}
              -
              <span class="badge badge-soft-success font-size-12">{{
                row.item.rfpPaymentItem.deliveryUnitBudgetItem.objectOfExpenditure.fundSource.sourceName
              }}</span>
            </template>
            <template #cell(amount)="row">
              <span class="text-warning">{{ formatCurrency(row.item.amount) }}</span>
            </template>
            <template #cell(rfpDate)="row">
              <span>{{ formatDate(row.item.rfpDate) }}</span>
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
    </div>
  </div>
</template>
