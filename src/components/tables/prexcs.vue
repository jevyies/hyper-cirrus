<script>
import ObjectOfExpenditures from "@/components/tables/objectOfExpenditures.vue";
export default {
  props: {
    prexcs: null,
    cycle: null,
    fundSource: null,
  },
  components: {
    ObjectOfExpenditures,
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
          thStyle: { width: "30px" },
        },
        {
          key: "id",
          thStyle: { width: "5%" },
        },
        {
          key: "uacs",
          sortable: true,
          thStyle: { width: "15%" },
        },
        {
          key: "prexcName",
          sortable: true,
          thStyle: { width: "62%" },
        },
        {
          key: "balance",
          sortable: true,
          thStyle: { width: "15%" },
        },
      ],
    };
  },
  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
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
    showDtls(row) {
      row.item.rotateChevy = !row.item.rotateChevy;
      if (row.item.showDetails) {
        row.item.showDetails = !row.item.showDetails;
        setTimeout(() => {
          row.toggleDetails();
        }, 600);
      } else {
        this.fetchOE(row);
        row.toggleDetails();
        setTimeout(() => {
          row.item.showDetails = !row.item.showDetails;
        }, 50);
      }
    },
    fetchOE(row) {
      this.$store
        .dispatch("objectOfExpenditures/getObjectOfExpendituresByPrexcAndCycle", {
          prexcId: row.item.id,
          cycle: Number(this.cycle),
          fundSourceId: this.fundSource,
        })
        .then((response) => {
          row.item.expenditures = response.data;
        })
        .catch(() => {
          this.showToast(
            "Something went wrong. Cannot fetch Object of Expenditures",
            "danger"
          );
        });
    },
    viewTransactions(row) {
      this.$emit("viewTransactions", row);
    },
    deleteItem(row) {
      this.$emit("deleteItem", row);
    },
    addNew(id) {
      this.$emit("addNew", id);
    },
  },
  computed: {
    rows() {
      return this.prexcs.length;
    },
  },
};
</script>

<template>
  <div class="row">
    <div class="col-lg-12 mb-3">
      <h5 class="card-title">PREXC List</h5>
    </div>
    <div class="col-lg-12">
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
                class="table table-bordered dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                :items="prexcs"
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
                <template #cell(classification)="row">
                  <p class="mb-0">
                    {{ row.item.prexcClassification.classification }}
                  </p>
                  <p class="mb-0 text-warning">
                    <small
                      ><b>{{ row.item.prexcClassification.priority }}</b></small
                    >
                  </p>
                </template>
                <template #cell(balance)="row">
                  <span class="text-info">{{ formatCurrency(row.item.balance) }}</span>
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
                <template #row-details="row">
                  <transition name="max-height">
                    <div class="card border border-info" v-if="row.item.showDetails">
                      <div class="row">
                        <div class="col-md-6">
                          <div class="card-header bg-transparent border-success mt-2">
                            <h5 class="my-0 text-info">
                              <i class="mdi mdi-bullseye-arrow me-3"></i>Object of
                              Expenditures
                            </h5>
                          </div>
                        </div>
                        <div class="col-md-6 text-end">
                          <b-button
                            class="mt-3 me-3"
                            size="sm"
                            variant="primary"
                            @click="addNew(row.item.id)"
                          >
                            <i class="bx bx-plus"></i> Add New</b-button
                          >
                        </div>
                      </div>

                      <div class="card-body">
                        <ObjectOfExpenditures
                          :objectOfExpenditures="row.item.expenditures"
                          @viewTransactions="viewTransactions"
                          @deleteItem="deleteItem"
                        />
                      </div>
                    </div>
                  </transition>
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
  </div>
</template>
