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
          key: "action",
          label: " ",
          sortable: true,
          thStyle: { width: "3%" },
        },
        {
          key: "rfpNumber",
          sortable: true,
          thStyle: { width: "10%" },
        },
        {
          key: "type",
          sortable: true,
          thStyle: { width: "10%" },
        },
        {
          key: "payee",
          label: "Payee/Supplier",
          sortable: true,
          thStyle: { width: "15%" },
        },
        {
          key: "rfpDate",
          label: "RFP Date",
          sortable: true,
          thStyle: { width: "15%" },
        },
        {
          key: "amount",
          label: "Amount",
          sortable: true,
          thStyle: { width: "15%" },
        },
        {
          key: "actions",
          thStyle: { width: "5%" },
        },
      ],
      alert: {
        show: false,
        type: "",
        message: "",
      },
      tableBusy: false,
      payments: [],
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
    showDtls(row) {
      row.item.rotateChevy = !row.item.rotateChevy;
      if (row.item.showDetails) {
        row.toggleDetails();
        row.item.showDetails = !row.item.showDetails;
      } else {
        row.toggleDetails();
        row.item.showDetails = !row.item.showDetails;
      }
    },
  },
  computed: {
    rows() {
      return this.records.length;
    },
  },
  created() {
    this.payments = this.records.filter((item) => item.type.toLowerCase() === this.type);
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
              <template #cell(action)="row">
                <div
                  class="d-flex align-items-center justify-content-center"
                  @click="showDtls(row)"
                >
                  <i
                    class="bx bx-chevron-right rotate font-size-16 cursor-pointer"
                    :class="{
                      'rotate-90': row.item.rotateChevy,
                    }"
                  ></i>
                </div>
              </template>
              <template #cell(payee)="row">
                <p class="mb-0 text-info">
                  {{ row.item.supplier.name }}
                </p>
                <p class="mb-0">
                  <small>TIN: {{ row.item.supplier.tin }}</small>
                  <i v-if="row.item.supplier.vatType">
                    - <small>{{ row.item.supplier.vatType }}</small></i
                  >
                </p>
              </template>
              <template #row-details="row">
                <transition>
                  <b-card v-if="row.item.showDetails">
                    <div class="row">
                      <div class="col-md-4">
                        <h5 class="card-title mb-3">Details</h5>

                        <p class="mb-2">
                          <strong>Payee: </strong>
                          <span>{{ row.item.payee }}</span>
                        </p>
                        <p class="mb-2">
                          <strong>Amount: </strong>
                          <span class="text-warning">{{
                            formatCurrency(row.item.amount)
                          }}</span>
                        </p>
                        <p class="mb-2">
                          <strong>Particulars: </strong>
                          <span>{{ row.item.particulars }}</span>
                        </p>
                        <p class="mb-2" v-if="row.item.type.toLowerCase() === 'payment'">
                          <strong>Delivery Unit: </strong>
                          <span>{{
                            row.item.rfpPaymentItem.deliveryUnitBudgetItem.deliveryUnit
                              .name
                          }}</span>
                        </p>
                      </div>
                      <div v-if="row.item.type.toLowerCase() === 'po'" class="col-md-4">
                        <h5 class="card-title mb-3">Purchase Order Details</h5>

                        <p class="mb-1">
                          <strong>PO No. </strong
                          ><span>{{ row.item.rfpPoItems[0].iar.po.poNumber }}</span>
                        </p>
                        <p class="mb-1">
                          <strong>Description: </strong
                          ><span>{{ row.item.rfpPoItems[0].iar.po.description }}</span>
                        </p>
                        <p class="mb-1">
                          <strong>Date Receieved: </strong
                          ><span>{{
                            formatDate(row.item.rfpPoItems[0].iar.po.poDateReceived)
                          }}</span>
                        </p>
                      </div>
                      <div v-if="row.item.type.toLowerCase() === 'po'" class="col-md-4">
                        <h5 class="card-title mb-3">IAR Details</h5>

                        <p class="mb-1">
                          <strong>IAR No: </strong
                          ><span>{{ row.item.rfpPoItems[0].iar.iarNumber }}</span>
                        </p>
                        <p class="mb-1">
                          <strong>Delivery Receipt No: </strong
                          ><span>{{ row.item.rfpPoItems[0].iar.drNumber }}</span>
                        </p>
                        <p class="mb-1">
                          <strong>Delivery Date: </strong
                          ><span>{{
                            formatDate(row.item.rfpPoItems[0].iar.dateOfDelivery)
                          }}</span>
                        </p>
                        <p class="mb-1">
                          <strong>Inspection Date: </strong
                          ><span>{{
                            formatDate(row.item.rfpPoItems[0].iar.dateInspected)
                          }}</span>
                        </p>
                        <p class="mb-2">
                          <strong>Amount: </strong
                          ><span class="text-warning">{{
                            formatCurrency(row.item.rfpPoItems[0].amount)
                          }}</span>
                        </p>
                      </div>
                    </div>
                  </b-card>
                </transition>
              </template>
              <template #cell(amount)="row">
                <span class="text-warning">{{ formatCurrency(row.item.amount) }}</span>
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
