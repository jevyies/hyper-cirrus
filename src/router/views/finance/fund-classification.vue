<script>
import axios from "axios";
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import _ from "lodash";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Fund Classification",
  },
  components: {
    Layout,
    PageHeader,
  },
  data() {
    return {
      title: "Fund Classification",
      submitted: false,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Fund Classification",
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
          key: "id",
          sortable: true,
        },
        {
          key: "classification",
          sortable: true,
        },
        {
          key: "actions",
        },
      ],
      form: {
        id: 0,
        classification: "",
        shortName: "",
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
      classification: { required },
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
      .dispatch("finance/GetFundClassification")
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
      this.modalTitle = "Create New Fund Classification";
      this.$bvModal.show("modal-standard");
    },
    onCreate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        if (this.form.id > 0) {
          this.$store
            .dispatch("finance/UpdateFundClassification", this.form)
            .then((res) => {
              this.tableData.splice(this.indexSelected, 1, res.data);
              this.$bvModal.hide("modal-standard");
              this.onReset();
              this.alert = {
                type: "success",
                message: "Successfully updated!",
              };
            })
            .catch((err) => {
              console.log(err);
              this.alert = { type: "danger", message: "Something went wrong!" };
            });
        } else {
          this.$store
            .dispatch("finance/CreateFundClassification", this.form)
            .then((res) => {
              this.tableData.push(res.data);
              this.$bvModal.hide("modal-standard");
              this.onReset();
              this.alert = {
                type: "success",
                message: "Successfully created!",
              };
            })
            .catch((err) => {
              console.log(err);
              this.alert = { type: "danger", message: "Something went wrong!" };
            });
        }
        this.submitted = false;
      }
    },
    onReset() {
      this.form = {
        id: 0,
        classification: "",
      };
    },
    updateItem(props) {
      this.form = _.cloneDeep(props.item);
      this.indexSelected = this.tableData.indexOf(props.item);
      this.modalTitle = "Update Fund Classification";
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
            .dispatch("finance/DeleteFundClassification", props.item.id)
            .then((res) => {
              if (res.status == 204) {
                this.tableData.splice(index, 1);
                this.alert = {
                  type: "success",
                  message: "Successfully deleted",
                };
              }
            })
            .catch((err) => {
              console.log(err);
              this.alert = { type: "danger", message: "Cannot be deleted!" };
            });
        }
      });
    },
    viewAccountGroups(item) {
      this.$router.push({ name: "Account Group", params: { id: item.id } });
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
                    <label for="classification">Classification</label>
                    <input
                      id="classification"
                      type="text"
                      v-model="form.classification"
                      placeholder="Enter Classification..."
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.classification.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.form.classification.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.form.classification.required"
                        >This value is required.</span
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="classification">Short Name</label>
                    <input
                      id="shortName"
                      type="text"
                      v-model="form.shortName"
                      placeholder="Enter Short name..."
                      class="form-control"
                    />
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
                <template #cell(classification)="row">
                  <div>
                    <strong>{{ row.value }}</strong>
                  </div>
                  <div>
                    <small>Short Name: {{ row.item.shortName }}</small>
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
                      <b-dropdown-item
                        @click="viewAccountGroups(row.item)"
                        variant="secondary"
                      >
                        <i class="mdi mdi-view-list font-size-18 me-1"></i> View Account
                        Groups
                      </b-dropdown-item>
                      <b-dropdown-item @click="updateItem(row)" variant="info"
                        ><i class="bx bx-edit font-size-18 me-1"></i
                        >Update</b-dropdown-item
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
