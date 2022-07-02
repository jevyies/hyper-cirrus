<script>
import axios from "axios";
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import Multiselect from "vue-multiselect";
import DatePicker from "vue2-datepicker";
import _ from "lodash";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Fund Cluster Sources",
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
    DatePicker,
  },
  data() {
    return {
      title: `Fund Sources for ${this.clusterName}`,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Fund Sources",
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
      sortBy: "age",
      sortDesc: false,
      agencyID: JSON.parse(localStorage.getItem("user")).deliveryUnit.office
        .campus.agencyId,
      fields: [
        {
          key: "sourceName",
          label: "Source Name",
          sortable: true,
        },
        {
          key: "description",
          sortable: true,
          label: "Description",
        },
        {
          key: "fundCluster.cluster",
          sortable: true,
          label: "Fund Cluster",
        },
        {
          key: "uacs",
          sortable: true,
          label: "UACS",
        },
        {
          key: "actions",
        },
      ],
      clusterName: "",
      form: {
        id: 0,
        uacs: "",
        sourceName: "",
        description: "",
        bankName: "",
        accountNumber: "",
        address: "",
        fundClusterId: "",
        expiry: new Date(),
        hasExpiry: false,
        agencyId: 0,
      },
      alert: {
        type: "",
        message: "",
      },
      indexSelected: -1,
      fcOptions: [],
      cOptions: [],
      sOptions: [],
      fundCluster: "",
      cycle: "",
      cycleSearch: "",
      submitted: true,
      tableBusy: false,
    };
  },
  validations: {
    form: {
      uacs: { required },
      sourceName: { required },
      description: { required },
      bankName: { required },
      accountNumber: { required },
      address: { required },
      expiry: { required },
    },
    fundCluster: { required },
  },
  computed: {
    rows() {
      return this.tableData.length;
    },
  },
  async created() {
    const cluster = await this.$store.dispatch(
      "finance/GetSingleFundCluster",
      this.$route.params.id
    );
    this.clusterName = cluster.data.cluster;
    this.totalRows = this.items.length;
    this.tableBusy = true;
    this.$store
      .dispatch("finance/GetFundCluster")
      .then((res) => {
        this.fcOptions = res.data;
      })
      .catch(() => {
        this.alert = { type: "danger", message: "Something went wrong!" };
      });

    this.$store
      .dispatch("finance/GetFundSourceByCluster", this.$route.params.id)
      .then((res) => {
        this.tableBusy = false;
        this.tableData = res.data;
      })
      .catch(() => {
        this.tableBusy = false;
        this.alert = { type: "danger", message: "Something went wrong!" };
      });
  },
  mounted() {},
  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    addFS() {
      this.modalTitle = "Create New Fund Source";
      this.$bvModal.show("modal-standard");
    },
    onCreate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        this.form.agencyID = this.agencyID;
        if (this.form.id > 0) {
          axios
            .put(`FundSource/${this.form.id}`, this.form)
            .then((res) => {
              this.tableData.splice(this.indexSelected, 1, res.data);
              this.$bvModal.hide("modal-standard");
              this.alert = {
                type: "success",
                message: "Successfully updated!",
              };
              this.onReset();
            })
            .catch(() => {
              this.alert = { type: "danger", message: "Something went wrong!" };
            });
        } else {
          axios
            .post("FundSource/CreateFundSource", this.form)
            .then((res) => {
              this.tableData.push(res.data);
              this.$bvModal.hide("modal-standard");
              this.alert = {
                type: "success",
                message: "Successfully created!",
              };
              this.onReset();
            })
            .catch(() => {
              this.alert = { type: "danger", message: "Something went wrong!" };
            });
        }
      }
    },
    hideModal() {
      this.$bvModal.hide("modal-standard");
    },
    onReset() {
      this.submitted = false;
      this.form = {
        id: 0,
        uacs: "",
        sourceName: "",
        description: "",
        bankName: "",
        accountNumber: "",
        address: "",
        fundClusterId: "",
        expiry: new Date(),
        hasExpiry: false,
      };
      this.fundCluster = "";
    },
    updateItem(props) {
      this.form = _.cloneDeep(props.item);
      this.fundCluster = _.cloneDeep(props.item.fundCluster);
      this.indexSelected = this.tableData.indexOf(props);
      this.modalTitle = "Update Fund Source";
      this.$bvModal.show("modal-standard");
    },
    deleteItem(props) {
      var index = this.tableData.indexOf(props);
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
          axios
            .delete(`FundSource/${props.item.id}`)
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
    onSelectFC(value) {
      this.form.fundClusterId = value.id;
    },
    viewMFO(id) {
      this.$router.push(`/finance/mfo-list/${id}`);
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader
      :title="`Fund Sources for ${this.clusterName}`"
      :items="items"
    />
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

        <div
          class="card border-4 border-top border-start-0 border-end-0  border-primary"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="card-title m-0">Table List</h4>
              <button
                type="button"
                @click="addFS()"
                class="btn btn-md btn-info d-flex align-items-center"
              >
                <i class="bx bx-plus fs-6"></i>Create New
              </button>
              <b-modal
                id="modal-standard"
                :title="modalTitle"
                size="lg"
                title-class="font-18"
                hide-footer
              >
                <form @submit.prevent="onCreate" @reset="onReset" ref="fsForm">
                  <div class="row">
                    <div class="col-6">
                      <div class="mb-3">
                        <label for="sourceName">Source Name</label>
                        <b-form-input
                          id="sourceName"
                          type="text"
                          v-model="form.sourceName"
                          placeholder="Enter Source Name..."
                          class="form-control"
                          :class="{
                            'is-invalid':
                              submitted && $v.form.sourceName.$error,
                          }"
                        ></b-form-input>
                        <div
                          v-if="submitted && $v.form.sourceName.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.form.sourceName.required"
                            >This value is required.</span
                          >
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="description">Description</label>
                        <b-form-input
                          id="description"
                          type="text"
                          v-model="form.description"
                          placeholder="Enter Description..."
                          class="form-control"
                          :class="{
                            'is-invalid':
                              submitted && $v.form.description.$error,
                          }"
                        ></b-form-input>
                        <div
                          v-if="submitted && $v.form.description.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.form.description.required"
                            >This value is required.</span
                          >
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="fundCluster">Fund Cluster</label>
                        <multiselect
                          v-model="fundCluster"
                          @select="onSelectFC"
                          :options="fcOptions"
                          label="cluster"
                          track-by="id"
                          placeholder="Select cluster..."
                          :searchable="false"
                          :allow-empty="false"
                          value="id"
                          :class="{
                            'is-invalid': submitted && $v.fundCluster.$error,
                          }"
                        >
                        </multiselect>
                        <div
                          v-if="submitted && $v.fundCluster.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.fundCluster.required"
                            >This value is required.</span
                          >
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="uacs">UACS</label>
                        <b-form-input
                          id="uacs"
                          type="text"
                          v-model="form.uacs"
                          placeholder="Enter UACS..."
                          class="form-control"
                          :class="{
                            'is-invalid': submitted && $v.form.uacs.$error,
                          }"
                        ></b-form-input>
                        <div
                          v-if="submitted && $v.form.uacs.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.form.uacs.required"
                            >This value is required.</span
                          >
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="mb-3">
                        <label for="bankName">Bank Name</label>
                        <b-form-input
                          id="bankName"
                          type="text"
                          v-model="form.bankName"
                          placeholder="Enter Bank Name..."
                          class="form-control"
                          :class="{
                            'is-invalid': submitted && $v.form.bankName.$error,
                          }"
                        ></b-form-input>
                        <div
                          v-if="submitted && $v.form.bankName.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.form.bankName.required"
                            >This value is required.</span
                          >
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="acctNo">Account Number</label>
                        <b-form-input
                          id="acctNo"
                          type="text"
                          v-model="form.accountNumber"
                          placeholder="Enter Account Number..."
                          class="form-control"
                          :class="{
                            'is-invalid':
                              submitted && $v.form.accountNumber.$error,
                          }"
                        ></b-form-input>
                        <div
                          v-if="submitted && $v.form.accountNumber.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.form.accountNumber.required"
                            >This value is required.</span
                          >
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="address">Address</label>
                        <b-form-input
                          id="address"
                          type="text"
                          v-model="form.address"
                          placeholder="Enter Address..."
                          class="form-control"
                          :class="{
                            'is-invalid': submitted && $v.form.address.$error,
                          }"
                        ></b-form-input>
                        <div
                          v-if="submitted && $v.form.address.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.form.address.required"
                            >This value is required.</span
                          >
                        </div>
                      </div>
                      <div class="mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="horizontalLayout-Check"
                          v-model="form.hasExpiry"
                        />&nbsp;&nbsp;
                        <label
                          class="form-check-label mb-2"
                          for="horizontalLayout-Check"
                          >Has Expiry</label
                        >
                        <date-picker
                          v-if="form.hasExpiry"
                          v-model="form.expiry"
                          :first-day-of-week="1"
                          lang="en"
                          placeholder="Enter Expiry..."
                          :class="{
                            'is-invalid': submitted && $v.form.expiry.$error,
                          }"
                        ></date-picker>
                        <div
                          v-if="submitted && $v.form.expiry.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.form.expiry.required"
                            >This value is required.</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                      Save changes
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      @click="hideModal"
                    >
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
                <div
                  id="tickets-table_filter"
                  class="dataTables_filter text-md-end"
                >
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
                      <b-dropdown-item
                        @click="viewMFO(row.item.id)"
                        variant="secondary"
                        ><i class="mdi mdi-view-list font-size-18 me-1"></i>View
                        MFO List</b-dropdown-item
                      >
                      <b-dropdown-item
                        @click="updateItem(row)"
                        variant="secondary"
                      >
                        <i class="bx bx-edit font-size-18 me-1"></i
                        >Edit</b-dropdown-item
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
                <div
                  class="dataTables_paginate paging_simple_numbers float-end"
                >
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
