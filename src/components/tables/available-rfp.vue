<script>
export default {
  props: {
    records: {},
    type: null,
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
        {
          key: "id",
          sortable: true,
          tdClass: "col-md-1",
        },
        {
          key: "rfpNumber",
          sortable: true,
          tdClass: "col-md-1",
        },
        {
          key: "type",
          sortable: true,
          tdClass: "col-md-1",
        },
        {
          key: "payee",
          label: "Payee/Supplier",
          sortable: true,
          tdClass: "col-md-2",
        },
        {
          key: "rfpDate",
          label: "RFP Date",
          sortable: true,
          tdClass: "col-md-1",
        },
        {
          key: "details",
          label: "Details",
          sortable: true,
          tdClass: "col-md-4",
        },
        {
          key: "actions",
          tdClass: "col-md-2",
        },
      ],
      alert: {
        show: false,
        type: "",
        message: "",
      },
      tableBusy: false,
    };
  },
  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("en-US");
    },
    formatCurrency(data) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    createBurs(record) {
      this.$emit("create", record);
    },
  },
  computed: {
    rows() {
      return this.records.length;
    },
  },
};
</script>
<template>
  <div>
    <div class="row mb-2">
      <div class="col-lg-12">
        <b-alert :variant="alert.variant" :show="alert.show">{{ alert.message }}</b-alert>
      </div>
    </div>
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
          <div class="table-responsive">
            <b-table
              class="table project-list-table table-nowrap align-middle table-borderless"
              :items="records"
              :fields="fields"
              :per-page="perPage"
              :current-page="currentPage"
              :sort-desc.sync="sortDesc"
              :filter="filter"
              :filter-included-fields="filterOn"
              :busy="tableBusy"
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
              <template #cell(payee)="row">
                <p class="mb-0 text-info">
                  {{ row.item.rfpPaymentItem.rfp.supplier.name }}
                </p>
                <p class="mb-0">
                  <small>TIN: {{ row.item.rfpPaymentItem.rfp.supplier.tin }}</small>
                </p>
                <p class="mb-0">
                  <small>{{ row.item.rfpPaymentItem.rfp.supplier.vatType }}</small>
                </p>
              </template>
              <template #cell(details)="row">
                <a v-b-toggle="`collapse-${row.item.id}`" href="javascript:void(0)"
                  ><i class="bx bx-chevron-down"></i> View Details</a
                >
                <b-collapse :id="`collapse-${row.item.id}`" class="mt-2">
                  <b-card>
                    <p class="card-text">RFP Details</p>
                    <hr />

                    <p class="mb-2">
                      <strong>Payee: </strong>
                      <span>{{ row.item.rfpPaymentItem.rfp.payee }}</span>
                    </p>
                    <p class="mb-2">
                      <strong>Amount: </strong>
                      <span>{{ formatCurrency(row.item.amount) }}</span>
                    </p>
                    <p class="mb-2">
                      <strong>Particulars: </strong>
                      <span>{{ row.item.rfpPaymentItem.rfp.particulars }}</span>
                    </p>
                    <p class="mb-2">
                      <strong>Delivery Unit: </strong>
                      <span>{{
                        row.item.rfpPaymentItem.deliveryUnitBudgetItem.deliveryUnit.name
                      }}</span>
                    </p>
                  </b-card>
                </b-collapse>
              </template>
              <template #cell(rfpDate)="row">
                {{ formatDate(row.item.rfpDate) }}
              </template>
              <template #cell(actions)="row">
                <div class="d-flex flex-wrap gap-2">
                  <b-button
                    size="sm"
                    variant="outline-warning"
                    class="w-sm inline-block m-auto"
                    @click="createBurs(row.item)"
                  >
                    <i class="bx bx-file align-middle me-1"></i> Create BURS
                  </b-button>
                </div>
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
