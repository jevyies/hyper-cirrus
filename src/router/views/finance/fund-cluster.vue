<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import _ from "lodash";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Fund Cluster",
  },
  components: {
    Layout,
    PageHeader,
  },
  data() {
    return {
      title: "Fund Cluster",
      submitted: false,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Fund Cluster",
          active: true,
        },
      ],
      tableData: [],
      modalTitle: "",
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "cluster",
      sortDesc: false,
      fields: [
        {
          key: "cluster",
          sortable: true,
          tdClass: "align-middle",
        },
        {
          key: "shortName",
          sortable: true,
          label: "Short Name",
          tdClass: "align-middle",
        },
        {
          key: "uacs",
          sortable: true,
          label: "UACS",
          tdClass: "align-middle",
        },
        {
          key: "actions",
          tdClass: "align-middle",
        },
      ],
      form: {
        id: 0,
        cluster: "",
        shortName: "",
        uacs: "",
      },
      alert: {
        type: "",
        message: "",
      },
      indexSelected: -1,
      tableBusy: false,
    };
  },
  validations: {
    form: {
      cluster: { required },
      shortName: { required },
      uacs: { required },
    },
  },
  computed: {
    rows() {
      return this.tableData.length;
    },
  },
  mounted() {
    this.totalRows = this.items.length;
    this.tableBusy = true;
    this.$store
      .dispatch("finance/GetFundCluster")
      .then((res) => {
        this.tableBusy = false;
        this.tableData = res.data;
      })
      .catch(() => {
        this.tableBusy = false;
        this.alert = { type: "danger", message: "Something went wrong!" };
      });
  },
  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    addFC() {
      this.onReset();
      this.modalTitle = "Create New Fund Cluster";
      this.$bvModal.show("modal-standard");
    },
    viewSources(id) {
      this.$router.push(`/finance/fund-cluster/sources/${id}`);
    },
    onCreate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        if (this.form.id > 0) {
          this.$store
            .dispatch("finance/UpdateFundCluster", this.form)
            .then((res) => {
              this.tableData.splice(this.indexSelected, 1, res.data);
              this.$bvModal.hide("modal-standard");
              this.alert = {
                type: "success",
                message: "Successfully updated!",
              };
            })
            .catch(() => {
              this.alert = { type: "danger", message: "Something went wrong!" };
            });
        } else {
          this.$store
            .dispatch("finance/CreateFundCluster", this.form)
            .then((res) => {
              this.tableData.push(res.data);
              this.$bvModal.hide("modal-standard");
              this.alert = {
                type: "success",
                message: "Successfully created!",
              };
            })
            .catch(() => {
              this.alert = { type: "danger", message: "Something went wrong!" };
            });
        }
        this.submitted = false;
      }
    },
    onReset() {
      this.form = {
        id: 0,
        cluster: "",
        shortName: "",
        uacs: "",
      };
    },
    updateItem(props) {
      this.form = _.cloneDeep(props.item);
      this.indexSelected = this.tableData.indexOf(props.item);
      this.modalTitle = "Update Fund Cluster";
      this.$bvModal.show("modal-standard");
    },
    hideModal() {
      this.$bvModal.hide("modal-standard");
    },
    deleteItem(props) {
      var index = this.tableData.indexOf(props.item);
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#5c636a",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.value) {
          this.$store
            .dispatch("finance/DeleteFundCluster", props.item.id)
            .then((res) => {
              if (res.status == 204) {
                this.tableData.splice(index, 1);
                this.alert = {
                  type: "success",
                  message: "Successfully deleted",
                };
              }
            })
            .catch(() => {
              this.alert = { type: "danger", message: "Cannot be deleted!" };
            });
        }
      });
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="row">
      <div class="col-12">
        <b-alert
          :show="alert.type === 'success'"
          dismissible
          @dismissed="alert.type = ''"
          variant="success"
        >
          <i class="mdi mdi-check-all me-2"></i>{{ alert.message }}
        </b-alert>
        <b-alert
          :show="alert.type === 'danger'"
          dismissible
          @dismissed="alert.type = ''"
          variant="danger"
        >
          <i class="mdi mdi-block-helper me-2"></i>{{ alert.message }}
        </b-alert>
        <b-alert
          :show="alert.type === 'warning'"
          dismissible
          @dismissed="alert.type = ''"
          variant="warning"
        >
          <i class="mdi mdi-alert-outline me-2"></i>{{ alert.message }}
        </b-alert>
        <div class="card border-4 border-top border-start-0 border-end-0 border-primary">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="card-title m-0">Table List</h4>
              <button
                type="button"
                @click="addFC()"
                class="btn btn-md btn-info d-flex align-items-center"
              >
                <i class="bx bx-plus fs-6"></i>Create New
              </button>
              <b-modal
                id="modal-standard"
                :title="modalTitle"
                size="md"
                title-class="font-18"
                hide-footer
              >
                <form @submit.prevent="onCreate" class="needs-validation" ref="fcForm">
                  <div class="mb-3">
                    <label for="cluster">Cluster :</label>
                    <input
                      id="cluster"
                      type="text"
                      v-model="form.cluster"
                      placeholder="Enter Cluster..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.cluster.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.form.cluster.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.cluster.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="uacs">UACS :</label>
                    <input
                      id="uacs"
                      type="text"
                      v-model="form.uacs"
                      placeholder="Enter UACS..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.uacs.$error,
                      }"
                    />
                    <div v-if="submitted && $v.form.uacs.$error" class="invalid-feedback">
                      <span v-if="!$v.form.uacs.required">This value is required.</span>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="shortName">Short Name :</label>
                    <input
                      id="shortName"
                      type="text"
                      v-model="form.shortName"
                      placeholder="Enter Short Name..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.shortName.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.form.shortName.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.shortName.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">Save changes</button>
                    <button type="button" class="btn btn-secondary" @click="hideModal">
                      Close
                    </button>
                  </div>
                </form>
              </b-modal>
            </div>
            <div class="row mt-4">
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
            <div class="table-responsive mb-0">
              <b-table
                class="datatables"
                :items="tableData"
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
                <template #cell(actions)="row">
                  <div class="float-end">
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
                      <!-- <b-dropdown-item
                        @click="viewSources(row.item.id)"
                        variant="secondary"
                        ><i class="mdi mdi-view-list font-size-18 me-1"></i>View
                        Fund Sources</b-dropdown-item
                      > -->
                      <b-dropdown-item @click="updateItem(row)" variant="secondary"
                        ><i class="bx bx-edit font-size-18 me-1"></i>Edit</b-dropdown-item
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
        </div>
      </div>
    </div>
  </Layout>
</template>
