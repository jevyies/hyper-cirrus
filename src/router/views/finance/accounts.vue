<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { required } from "vuelidate/lib/validators";
import { sortBy } from "lodash";
import PrintOptions from "@/components/modals/print-options.vue";

export default {
  page: {
    title: "Accounts",
  },
  components: {
    Layout,
    PageHeader,
    PrintOptions,
  },
  data() {
    return {
      title: "Accounts",
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
          href: `/finance/account-groups/${this.$route.params.group}`,
        },
        {
          text: "Accounts",
          active: true,
        },
      ],
      accountGroup: null,
      accountGroups: [],
      accounts: [],
      account: {
        id: 0,
        uacs: null,
        accountName: null,
        uacsSubCode: null,
        coveringPpsas: null,
        accountGroupId: this.$route.params.id ? Number(this.$route.params.id) : null,
      },
      selectedAG: null,
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "accountName",
      sortDesc: false,
      fields: [
        // {
        //   key: "id",
        //   sortable: true,
        // },
        {
          key: "uacs",
          label: "UACS",
          sortable: true,
        },
        {
          key: "uacsSubCode",
          label: "UACS Subcode",
          sortable: true,
        },
        {
          key: "accountName",
        },

        {
          key: "coveringPpsas",
          label: "Covering Ppsas",
          sortable: true,
        },
        {
          key: "actions",
        },
      ],
      alert: {
        show: false,
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
    account: {
      accountName: { required },
      accountGroupId: { required },
    },
  },
  async created() {
    const response = await this.$store.dispatch("accountgroups/getAllAccountGroup");

    this.accountGroups = response.data.map((fc) => {
      return {
        value: fc.id,
        text: `${fc.fundClassification.shortName} - ${fc.groupName}`,
      };
    });
    this.accountGroups = sortBy(this.accountGroups, ["text"]);
    this.accountGroups.unshift({
      value: null,
      text: "All",
    });
    if (this.$route.params.id) {
      const fc = await this.$store.dispatch(
        "accountgroups/getAccountGroup",
        Number(this.$route.params.id)
      );
      this.accountGroup = fc.data.groupName;
      this.title = `${this.accountGroup} - Accounts`;
      this.selectedAG = this.$route.params.id;
      const { data } = await this.$store.dispatch(
        "accounts/getAccountByAccountGroup",
        this.selectedAG
      );
      this.acounts = data;
    } else {
      const { data } = await this.$store.dispatch("accounts/getAllAccounts");
      this.accounts = data;
    }
  },
  methods: {
    async fetchData() {
      this.tableBusy = true;
      if (this.selectedAG) {
        this.$store
          .dispatch("accounts/getAccountByAccountGroup", this.selectedAG)
          .then((response) => {
            this.accounts = response.data;
            this.tableBusy = false;
          });
        const fc = await this.$store.dispatch(
          "accountgroups/getAccountGroup",
          this.selectedAG
        );
        this.accountGroup = fc.data.groupName;

        this.title = `${this.accountGroup} - Accounts`;
      } else {
        this.$store.dispatch("accounts/getAllAccounts").then((response) => {
          this.accounts = response.data;
          this.tableBusy = false;
        });
        this.title = "All Accounts";
      }
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    viewAccounts(item) {
      // console.log(item);
    },
    addAG() {
      this.onReset();
      this.modalOptions.title = "Add New Account";
      this.modalOptions.show = true;
    },
    closeAdd() {
      this.onReset();
      this.modalOptions.show = false;
      this.modalOptions.title = "";
    },
    updateItem(item) {
      this.account = JSON.parse(JSON.stringify(item));
      this.modalOptions.title = "Update Account";
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
          try {
            this.$store
              .dispatch("accounts/deleteAccount", item.id)
              .then(() => {
                this.fetchData();
                this.accounts.splice(this.accounts.indexOf(item), 1);
                this.alert.show = true;
                this.alert.type = "success";
                this.alert.message = "Account successfully deleted.";
                this.tableBusy = false;
              })
              .catch((error) => {
                this.tableBusy = false;
                this.alert.show = true;
                this.alert.type = "danger";
                this.alert.message =
                  "Something went wrong. Please ask your admin for help.";
              });
          } catch (error) {
            // console.log(error.data);
          }
        }
      });
    },
    onSubmit() {
      this.tableBusy = true;
      this.submitted = true;
      this.$v.account.$touch();
      if (this.$v.account.$invalid) {
        return;
      } else {
        // this.accountGroup.fundClassificationId = this.selectedAG;

        if (this.account.id === 0) {
          // console.log(this.account);
          /** Add new Record */
          this.$store
            .dispatch("accounts/createAccounts", this.account)
            .then((response) => {
              this.alert.show = true;
              this.alert.type = "success";
              this.alert.message = "Account Added Successfully";
              this.accounts.push(response.data);
              this.modalOptions.show = false;
              this.onReset();
              this.closeAdd();
              this.fetchData();
              this.modalOptions.title = "";

              this.tableBusy = false;
              this.submitted = false;
            })
            .catch((error) => {
              this.tableBusy = false;
              this.submitted = false;
              this.alert.show = true;
              this.alert.type = "danger";
              this.alert.message =
                "Something went wrong. Cannot create record. Please ask your admin for help.";
            });
          //   console.log(this.accountGroup);
        } else {
          /** Update Record */
          this.$store
            .dispatch("accounts/updateAccount", {
              id: this.account.id,
              data: this.account,
            })
            .then((response) => {
              this.alert.show = true;
              this.alert.type = "success";
              this.alert.message = "Account Updated Successfully";
              this.accounts.find(
                (item) => item.id === this.account.id
              ).accountName = this.account.accountName;
              this.accounts.find(
                (item) => item.id === this.account.id
              ).uacs = this.account.uacs;
              this.accounts.find(
                (item) => item.id === this.account.id
              ).uacsSubCode = this.account.uacsSubCode;
              this.accounts.find(
                (item) => item.id === this.account.id
              ).coveringPpsas = this.account.coveringPpsas;
              this.accounts.find(
                (item) => item.id === this.account.id
              ).accountGroupId = this.account.accountGroupId;
              this.modalOptions.show = false;
              this.onReset();
              this.closeAdd();
              this.fetchData();
              this.modalOptions.title = "";

              this.tableBusy = false;
              this.submitted = false;
            });
        }
      }
    },
    onReset() {
      this.account = {
        id: 0,
        accountName: null,
        uacs: null,
        uacsSubCode: null,
        coveringPpsas: null,
        accountGroupId: this.$route.params.id ? Number(this.$route.params.id) : null,
      };
    },
    async printAccounts() {
      this.$refs.printOpt.putOptions({
        apiUrl: "/Finance/Accounts/Print",
        routeVariables: [],
      });
      this.$bvModal.show("print-options-modal");
    },
  },
  computed: {
    rows() {
      return this.accounts.length;
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
          :show="alert.show"
          dismissible
          @dismissed="alert.type = ''"
          :variant="alert.type"
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
            <div class="row">
              <div class="col-lg-6">
                <h4 class="card-title m-0">Table List</h4>
              </div>
              <div class="col-lg-6">
                <div class="d-flex justify-content-end align-items-center flex-wrap">
                  <b-button
                    variant="outline-primary"
                    size="sm"
                    class="me-3"
                    @click="printAccounts"
                  >
                    <i class="bx bx-printer align-middle me-1"></i>Print Accounts
                  </b-button>
                  <b-button type="button" @click="addAG()" size="sm" variant="info">
                    <i class="bx bx-plus align-middle me-1 fs-6"></i>Create New
                  </b-button>
                </div>
              </div>
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
                  Account Group:
                  <b-form-select
                    class="form-select form-control form-control-sm ms-2"
                    v-model.number="selectedAG"
                    size="sm"
                    :options="accountGroups"
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
                :items="accounts"
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
                <template #cell(uacs)="row">
                  <span class="badge rounded-pill bg-success font-size-12">{{
                    row.item.uacs
                  }}</span>
                </template>
                <template #cell(uacsSubCode)="row">
                  <span class="badge rounded-pill bg-warning font-size-12">{{
                    row.item.uacsSubCode
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
                      <!-- <b-dropdown-item
                        @click="viewAccounts(row.item)"
                        variant="secondary"
                      >
                        <i class="mdi mdi-view-list font-size-18 me-1"></i> View Accounts
                      </b-dropdown-item> -->
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
        <label for="accountName">Account Name</label>
        <b-form-input
          id="accountName"
          v-model="account.accountName"
          placeholder="Enter Account Name..."
          :class="{
            'is-invalid': submitted && $v.account.accountName.$error,
          }"
        >
        </b-form-input>
        <div v-if="submitted && $v.account.accountName.$error" class="invalid-feedback">
          <span v-if="!$v.account.accountName.required">This value is required.</span>
        </div>
      </div>
      <div class="mb-3">
        <label for="accountName">UACS</label>
        <b-form-input id="accountName" v-model="account.uacs" placeholder="Enter UACS...">
        </b-form-input>
      </div>
      <div class="mb-3">
        <label for="uacsSubCode">UACS Subcode</label>
        <b-form-input
          id="uacsSubCode"
          v-model="account.uacsSubCode"
          placeholder="Enter UACS Subcode..."
        >
        </b-form-input>
      </div>

      <div class="mb-3">
        <label for="coveringPpsas">Covering Ppsas</label>
        <b-form-input
          id="coveringPpsas"
          v-model="account.coveringPpsas"
          placeholder="Enter Covering Ppsas..."
        >
        </b-form-input>
      </div>
      <div class="mb-3">
        <label for="fundClassificaton">Account Group</label>
        <b-form-select
          class="form-select form-control form-control-sm"
          v-model.number="account.accountGroupId"
          size="sm"
          :options="accountGroups"
          :class="{
            'is-invalid': submitted && $v.account.accountGroupId.$error,
          }"
        ></b-form-select>
        <div
          v-if="submitted && $v.account.accountGroupId.$error"
          class="invalid-feedback"
        >
          <span v-if="!$v.account.accountGroupId.required">This value is required.</span>
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
    <print-options ref="printOpt"></print-options>
  </Layout>
</template>
