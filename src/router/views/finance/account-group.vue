<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Account Groups",
  },
  components: {
    Layout,
    PageHeader,
  },
  data() {
    return {
      title: "Account Groups",
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Fund Classification",
          href: "/finance/fund-classification",
        },
        {
          text: "Account Groups",
          active: true,
        },
      ],
      fundClassification: null,
      accountGroups: [],
      fundClassifications: [],
      accountGroup: {
        id: 0,
        groupName: null,
        fundClassificationId: this.$route.params.id
          ? Number(this.$route.params.id)
          : null,
        rcaCode: null,
        accountType: null,
      },
      accountTypeOptions: [
        "Expenses",
        "Asset",
        "Liabilities",
        "Equity",
        "Revenue/Income",
      ],
      selectedFC: null,
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "groupName",
      sortDesc: false,
      fields: [
        // {
        //   key: "id",
        //   sortable: true,
        // },
        {
          key: "rcaCode",
          label: "RCA Code",
          sortable: true,
        },
        {
          key: "accountType",
          sortable: true,
        },
        {
          key: "groupName",
          sortable: true,
        },
        {
          key: "actions",
        },
      ],
      alert: {
        type: "",
        message: "",
      },
      modalOptions: {
        title: "",
        show: false,
      },
      tableBusy: false,
      submitted: false,
    };
  },
  validations: {
    accountGroup: {
      groupName: { required },
    },
  },
  async created() {
    const response = await this.$store.dispatch(
      "fundclassification/GetFundClassification"
    );
    this.fundClassifications = response.data.map((fc) => {
      return {
        value: fc.id,
        text: fc.classification,
      };
    });
    this.fundClassifications.unshift({
      value: null,
      text: "All",
    });
    if (this.$route.params.id) {
      const fc = await this.$store.dispatch(
        "fundclassification/GetSingleFundClassification",
        Number(this.$route.params.id)
      );
      this.fundClassification = fc.data.classification;
      this.title = `${this.fundClassification} - Account Groups`;
      this.selectedFC = this.$route.params.id;
      const { data } = await this.$store.dispatch(
        "accountgroups/getAccountGroupByFundClassification",
        this.selectedFC
      );
      this.accountGroups = data;
    } else {
      const { data } = await this.$store.dispatch("accountgroups/getAllAccountGroup");
      this.accountGroups = data;
    }
  },
  methods: {
    async fetchData() {
      this.tableBusy = true;
      if (this.selectedFC) {
        this.$store
          .dispatch("accountgroups/getAccountGroupByFundClassification", this.selectedFC)
          .then((response) => {
            this.accountGroups = response.data;
            this.tableBusy = false;
          })
          .catch(() => {
            this.tableBusy = false;
            this.$swal({
              type: "error",
              title: "Error",
              text:
                "Error fetching data. Cannot fetch account groups. Please contact your administrator.",
            });
          });
        const fc = await this.$store.dispatch(
          "fundclassification/GetSingleFundClassification",
          this.selectedFC
        );
        this.fundClassification = fc.data.classification;
        this.title = `${this.fundClassification} - Account Groups`;
      } else {
        this.$store
          .dispatch("accountgroups/getAllAccountGroup")
          .then((response) => {
            this.accountGroups = response.data;
            this.tableBusy = false;
          })
          .catch(() => {
            this.tableBusy = false;
            this.$swal({
              type: "error",
              title: "Error",
              text:
                "Error fetching data. Cannot fetch account groups. Please contact your administrator.",
            });
          });
        this.title = "All Account Groups";
      }
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    viewAccounts(item) {
      // console.log(item);
      this.$router.push(`/finance/accounts/${this.$route.params.id}/${item.id}`);
    },
    addAG() {
      this.onReset();
      this.modalOptions.title = "Add New Account Group";
      this.modalOptions.show = true;
    },
    closeAdd() {
      this.onReset();
      this.modalOptions.show = false;
      this.modalOptions.title = "";
    },
    updateItem(item) {
      this.accountGroup = JSON.parse(JSON.stringify(item));
      this.modalOptions.title = "Update Account Group";
      this.modalOptions.show = true;
    },
    deleteItem(item) {
      this.tableBusy = true;
      this.$swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("accountgroups/deleteAccountGroup", item.id)
            .then(() => {
              this.fetchData();
              this.alert.type = "success";
              this.alert.message = "Account Group successfully deleted.";
              this.tableBusy = false;
            })
            .catch(() => {
              this.alert.type = "danger";
              this.alert.message =
                "Something went wrong. Please ask your admin for help.";
            });
        }
      });
    },
    onSubmit() {
      this.tableBusy = true;
      this.submitted = true;
      this.$v.accountGroup.$touch();
      if (this.$v.accountGroup.$invalid) {
        return;
      } else {
        // this.accountGroup.fundClassificationId = this.selectedFC;

        if (this.accountGroup.id === 0) {
          // console.log(this.accountGroup);
          /** Add new Record */
          this.$store
            .dispatch("accountgroups/createAccountGroup", this.accountGroup)
            .then((response) => {
              this.alert.type = "success";
              this.alert.message = "Account Group Added Successfully";
              this.onReset();
              this.closeAdd();
              this.fetchData();
              this.modalOptions.title = "";
              this.modalOptions.show = false;
              this.tableBusy = false;
              this.submitted = false;
            });
          //   console.log(this.accountGroup);
        } else {
          /** Update Record */
          this.$store
            .dispatch("accountgroups/updateAccountGroup", {
              id: this.accountGroup.id,
              data: this.accountGroup,
            })
            .then((response) => {
              // console.log(response);
              this.alert.type = "success";
              this.alert.message = "Account Group Updated Successfully";
              this.onReset();
              this.closeAdd();
              this.fetchData();
              this.modalOptions.title = "";
              this.modalOptions.show = false;
              this.tableBusy = false;
              this.submitted = false;
            });
        }
      }
    },
    onReset() {
      this.accountGroup = {
        id: 0,
        groupName: null,
        fundClassificationId: this.$route.params.id
          ? Number(this.$route.params.id)
          : null,
        rcaCode: null,
        accountType: null,
      };
    },
  },
  computed: {
    rows() {
      return this.accountGroups.length;
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="row">
      <div class="col-lg-12">
        <!-- Alerts here -->
        <b-alert
          :show="alert.type === 'success'"
          dismissible
          @dismissed="alert.type = ''"
          variant="success"
        >
          <i class="mdi mdi-check-all me-2"></i>{{ alert.message }}
        </b-alert>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-12">
        <!-- Filters and options -->
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="card-title m-0">Table List</h4>
              <b-button
                type="button"
                @click="addAG()"
                size="sm"
                class="btn btn-md btn-info d-flex align-items-center"
              >
                <i class="bx bx-plus fs-6"></i>Create New
              </b-button>
            </div>
            <div class="row mt-4">
              <div class="col-sm-12 col-md-4">
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
              <div class="col-sm-12 col-md-4 text-end">
                <label class="d-inline-flex align-items-center">
                  Classification:
                  <b-form-select
                    class="form-select form-control form-control-sm ms-2"
                    v-model.number="selectedFC"
                    size="sm"
                    :options="fundClassifications"
                    @input="fetchData"
                  ></b-form-select>
                </label>
              </div>
              <!-- Search -->
              <div class="col-sm-12 col-md-4">
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
            </div>
            <div class="table-responsive mb-0">
              <b-table
                class="datatables"
                :items="accountGroups"
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

                <template #cell(rcaCode)="row">
                  <span class="badge rounded-pill bg-success font-size-12">{{
                    row.item.rcaCode
                  }}</span>
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
                        @click="viewAccounts(row.item)"
                        variant="secondary"
                      >
                        <i class="mdi mdi-view-list font-size-18 me-1"></i> View Accounts
                      </b-dropdown-item>
                      <b-dropdown-item @click="updateItem(row.item)" variant="info"
                        ><i class="bx bx-edit font-size-18 me-1"></i
                        >Update</b-dropdown-item
                      >
                      <b-dropdown-item @click="deleteItem(row.item)" variant="danger"
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
    <!-- Modals here -->
    <b-modal
      :title="modalOptions.title"
      title-class="font-18"
      no-close-on-backdrop
      v-model="modalOptions.show"
    >
      <div class="mb-3">
        <label for="groupName">Group name</label>
        <b-form-input
          id="groupName"
          v-model="accountGroup.groupName"
          placeholder="Enter Account Group Name..."
          :class="{
            'is-invalid': submitted && $v.accountGroup.groupName.$error,
          }"
        >
        </b-form-input>
        <div
          v-if="submitted && $v.accountGroup.groupName.$error"
          class="invalid-feedback"
        >
          <span v-if="!$v.accountGroup.groupName.required">This value is required.</span>
        </div>
      </div>
      <div class="mb-3">
        <label for="groupName">RCA Code</label>
        <b-form-input
          id="groupName"
          v-model="accountGroup.rcaCode"
          placeholder="Enter RCA Code..."
        >
        </b-form-input>
      </div>
      <div class="mb-3">
        <label for="fundClassificaton">Fund Classification</label>
        <b-form-select
          class="form-select form-control form-control-sm"
          v-model.number="accountGroup.fundClassificationId"
          size="sm"
          :options="fundClassifications"
        ></b-form-select>
      </div>
      <div class="mb-3">
        <div
          class="form-check form-radio-outline form-radio-success mb-3"
          v-for="(type, index) in accountTypeOptions"
          :key="index"
        >
          <input
            class="form-check-input"
            type="radio"
            name="accountType"
            v-model="accountGroup.accountType"
            :value="type"
            :id="index"
          />
          <label class="form-check-label" :for="index"> {{ type }} </label>
        </div>
      </div>

      <template #modal-footer>
        <b-button @click="closeAdd" variant="light">
          <i class="ri-close-circle-line align-middle mr-1"></i>
          Cancel
        </b-button>
        <b-form-group>
          <b-button variant="primary" class="float-right" @click="onSubmit">
            <i class="ri-save-3-line align-middle mr-1"></i>
            Save
          </b-button>
        </b-form-group>
      </template>
    </b-modal>
  </Layout>
</template>
