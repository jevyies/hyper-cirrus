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
          key: "disbursementNumber",
          label: "Disbursement No.",
          sortable: true,
          tdClass: "col-md-1 font-size-11",
        },
        {
          key: "burs.serialNumber",
          label: "BURS No.",
          sortable: true,
          tdClass: "col-md-1 font-size-11",
        },
        {
          key: "jevNumber",
          label: "JEV No.",
          sortable: true,
          tdClass: "col-md-1 font-size-11",
        },
        {
          key: "payee",
          label: "Payee/Supplier",
          sortable: true,
          tdClass: "col-md-2",
        },
        {
          key: "disbursementDate",
          label: "Disbursement Date",
          sortable: true,
          tdClass: "col-md-1",
        },
        {
          key: "details",
          label: "Details",
          sortable: true,
          tdClass: "col-md-5",
        },
        {
          key: "actions",
          tdClass: "col-md-1",
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
    post(record) {
      this.$emit("post", record);
    },
    update(record) {
      this.$emit("update", record);
    },
    remove(record) {
      this.$emit("remove", record);
    },
    approve(record) {
      this.$emit("approve", record);
    },
    returnBurs(record) {
      this.$emit("return", record);
    },
    printDisbursement(id) {
      this.$emit("printDisbursement", id);
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
          <div class="table-responsive mb-0">
            <b-table
              class="datatables"
              :items="records"
              :fields="fields"
              responsive="sm"
              :per-page="perPage"
              :current-page="currentPage"
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
              <template #cell(disbursementDate)="row">
                {{ formatDate(row.item.disbursementDate) }}
              </template>
              <template #cell(payee)="row">
                <p class="mb-0 text-info">
                  {{ row.item.burs.rfp.rfpPaymentItem.rfp.supplier.name }}
                </p>
                <p class="mb-0">
                  <small
                    >TIN: {{ row.item.burs.rfp.rfpPaymentItem.rfp.supplier.tin }}</small
                  >
                </p>
                <p class="mb-0">
                  <small>{{
                    row.item.burs.rfp.rfpPaymentItem.rfp.supplier.vatType
                  }}</small>
                </p>
              </template>
              <template #cell(details)="row">
                <a v-b-toggle.collapse-1 href="javascript:void(0)"
                  ><i class="bx bx-chevron-down"></i> View Details</a
                >
                <b-collapse id="collapse-1" class="mt-2">
                  <b-card>
                    <p class="card-text">Disbursement Details</p>
                    <hr />
                    <p class="mb-2">
                      <strong>Particulars: </strong>
                      <span>{{ row.item.burs.particulars }}</span>
                    </p>
                    <!-- table here -->
                    <div class="table-responsive my-3">
                      <table
                        class="table table-sm align-middle table-bordered border-primary mb-0 font-size-11"
                      >
                        <thead>
                          <tr>
                            <th>UACS</th>
                            <th>Account Name</th>
                            <th class="text-center">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(item, index) in row.item.disbursementItems"
                            :key="index"
                          >
                            <th scope="row">{{ item.account.uacs }}</th>
                            <td>{{ item.account.accountName }}</td>
                            <td>
                              <span class="text-warning">
                                {{ formatCurrency(item.amount) }}</span
                              >
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <!-- table here -->
                    <p>
                      <strong>Bank: </strong>
                      <span class="text-warning">{{ row.item.bank }}</span>
                    </p>
                    <p>
                      <strong>Mode of Payment: </strong>
                      <span class="text-warning">{{ row.item.modeOfPayment }}</span>
                    </p>
                    <p>
                      <strong>Check No.: </strong>
                      <span class="text-warning">{{ row.item.checkNumber }}</span>
                    </p>
                    <p>
                      <strong>Check Date: </strong>
                      <span class="text-warning">{{
                        formatDate(row.item.checkDate)
                      }}</span>
                    </p>
                  </b-card>
                </b-collapse>
              </template>
              <template #cell(busDate)="row">
                {{ formatDate(row.item.busDate) }}
              </template>
              <template #cell(actions)="row">
                <b-dropdown
                  id="dropdown-dropleft"
                  right
                  variant="link"
                  toggle-class="text-decoration-none"
                  menu-class="dropdown-menu-end"
                  no-caret
                  v-if="type"
                >
                  <template #button-content>
                    <i class="fas fa-ellipsis-v"></i>
                  </template>
                  <b-dropdown-item
                    @click="printDisbursement(row.item.id)"
                    variant="primary"
                    ><i class="bx bx-printer align-middle me-1"></i>
                    Print</b-dropdown-item
                  >
                  <b-dropdown-item
                    v-if="type === 'posted'"
                    @click="approve(row.item)"
                    variant="success"
                    ><i class="bx bx-check-circle align-middle me-2"></i>
                    Approve</b-dropdown-item
                  >
                  <b-dropdown-item
                    v-if="type === 'posted'"
                    @click="returnBurs(row.item)"
                    variant="warning"
                    ><i class="bx bx-left-arrow-alt align-middle me-2"></i>
                    Return</b-dropdown-item
                  >

                  <b-dropdown-item
                    v-if="type === 'pending'"
                    @click="post(row.item)"
                    variant="info"
                    ><i class="bx bx-upload align-middle me-2"></i> Post</b-dropdown-item
                  >
                  <b-dropdown-item
                    v-if="type === 'pending'"
                    @click="update(row.item)"
                    variant="warning"
                    ><i class="bx bxs-pencil align-middle me-2"></i> Edit</b-dropdown-item
                  >
                  <b-dropdown-item
                    v-if="type === 'pending'"
                    @click="remove(row.item)"
                    variant="danger"
                    ><i class="bx bx-trash me-2"></i> Delete</b-dropdown-item
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
