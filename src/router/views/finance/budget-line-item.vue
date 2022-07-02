<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import simplebar from "simplebar-vue";
import cloneDeep from "lodash/cloneDeep";
import last from "lodash/last";
import filter from "lodash/filter";
import { required, minValue, decimal } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";

export default {
  page: {
    title: "Budget Line Item",
  },
  components: {
    Layout,
    PageHeader,
    simplebar,
    DatePicker,
  },
  data() {
    return {
      title: "Budget Line Item",
      routeID: this.$route.params.id,
      mfo: {},
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Fund Source",
          href: "/finance/fund-source",
        },
        {
          text: "MFO",
        },
        {
          text: "Budget Line Item",
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
          key: "objectCode",
          sortable: true,
          label: "Object Code",
        },
        {
          key: "description",
          sortable: true,
          label: "Description",
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
      transField: [
        {
          key: "date",
          sortable: true,
          label: "Date",
        },
        {
          key: "description",
          sortable: true,
          label: "Description",
        },
        {
          key: "debit",
          sortable: true,
          label: "Debit",
        },
        {
          key: "credit",
          sortable: true,
          label: "Credit",
        },
        {
          key: "balance",
          sortable: true,
          label: "Balance",
        },
      ],
      form: {
        id: 0,
        objectCode: "",
        mfoId: this.$route.params.id,
        uacs: "",
        description: "",
      },
      transaction: {
        type: null,
        description: null,
        date: null,
        amount: 0,
        budgetLineItemId: null,
        mfoId: null,
      },
      alert: {
        type: "",
        message: "",
      },
      indexSelected: -1,
      submitted: false,
      tableBusy: false,
      selectedBudgetLineItem: null,
      budgetLineItem: null,
      budgetLineItemBalance: 0,
      transferBLIOptions: [],
      blis: [],
      transactionTable: [],
      allMFO: [],
      allFundSources: [],
      transferType: null,
      showAllocateFundsModal: false,
      transactionModalTitle: null,
      transactionType: null,
      transactionModal: false,
      isErrorBLI: false,
    };
  },
  validations: {
    form: {
      objectCode: { required },
      uacs: { required },
      description: { required },
    },
    transaction: {
      type: { required },
      description: { required },
      date: { required },
      amount: { required, decimal, minValue: minValue(1) },
    },
  },
  computed: {
    rows() {
      return this.transactionTable.length;
    },
  },
  async created() {
    this.totalRows = this.items.length;
    this.transaction.mfoId = Number(this.routeID);
    this.tableBusy = true;
    this.$store
      .dispatch("mfo/GetSingleMfo", this.routeID)
      .then((res) => {
        this.mfo = res.data;
        this.items[2]["href"] = `/finance/mfo-list/${res.data.fundSourceId}`;
        this.title = `${res.data.mfoName} Budget Line Items`;
      })
      .catch(() => {
        this.alert = { type: "danger", message: "Something went wrong!" };
      });

    const mfo = await this.$store.dispatch("mfo/GetSingleMfo", this.routeID);
    this.$store.commit("mfo/SET_MFO", mfo.data);

    const mfoBalance = await this.$store.dispatch("mfo/GetMfoTransactions", this.routeID);
    let balance = mfoBalance.data.length ? last(mfoBalance.data).balance : 0;
    this.$store.commit("mfo/SET_MFO_BALANCE", balance);

    if (this.$store.getters["mfo/getMFOBalance"] < 1) {
      this.alert = {
        type: "warning",
        message: "MFO Balance is less than 1.00. You cannot allocate funds to Budget Line Item",
      };
    }

    console.log("mfo", this.$store.getters["mfo/getMFO"]);
    console.log("balance", this.$store.getters["mfo/getMFOBalance"]);

    this.$store
      .dispatch("budgetlineitem/GetBudgetLineItemByMfo", this.routeID)
      .then((res) => {
        this.tableBusy = false;
        this.tableData = res.data;
        this.blis = res.data.map((data) => ({
          value: data.id,
          text: `${data.objectCode} - ${data.description}`,
        }));
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
    onResetTransaction() {
      this.transaction.amount = 0;
      this.transaction.date = null;
      this.transaction.description = "";
      this.transaction.mfoId = null;
      this.transaction.budgetLineItemId = null;
      this.transaction.type = null;
    },
    formatCurrency(data) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    allocateFund(data) {
      if (this.$store.getters["mfo/getMFOBalance"] < 1) {
        this.alert = {
          type: "danger",
          message: `Fund Source Balance is ${this.formatCurrency(0)}. Please make sure to add funds on fund source before allocating budget for MFO`,
        };
        return;
      }
      this.modalTitle = "Allocate Funds";

      this.transaction.budgetLineItemId = data.id;
      this.transaction.mfoId = this.$store.getters["mfo/getMFO"].id;
      this.transaction.amount = this.$store.getters["mfo/getMFOBalance"];
      this.showAllocateFundsModal = true;
    },
    addFund() {
      if (this.transaction.amount > this.$store.getters["mfo/getMFOBalance"]) {
        this.alert = {
          type: "danger",
          message: `MFO Balance is ${this.formatCurrency(this.$store.getters["mfo/getMFOBalance"])}. Please make sure to add funds on fund source before allocating budget for Budget Line Item`,
        };
        this.showAllocateFundsModal = false;
        return;
      }
      this.submitted = true;
      this.$v.$touch();
      this.transaction.type = "credit";
      if (this.$v.transaction.$invalid) {
        return;
      } else {
        this.transaction.date = new Date(this.transaction.date).toISOString();
        const mfo = JSON.parse(JSON.stringify(this.transaction));
        const bli = JSON.parse(JSON.stringify(this.transaction));
        bli.type = "debit";
        mfo.type = "credit";
        delete bli.mfoId;
        delete mfo.budgetLineItemId;

        console.log(mfo);
        console.log(bli);

        /** Do credit - use mfo id */
        this.$store
          .dispatch("mfo/CreateMfoTransaction", mfo)
          .then(async () => {
            const mfoBalance = await this.$store.dispatch("mfo/GetMfoTransactions", this.routeID);
            let balance = mfoBalance.data.length ? last(mfoBalance.data).balance : 0;
            this.$store.commit("mfo/SET_MFO_BALANCE", balance);
          })
          .catch((e) => {
            this.showAllocateFundsModal = false;
            this.alert = { type: "danger", message: e };
          });

        /** Do debit -  use budget line item id */

        this.$store
          .dispatch("budgetlineitem/CreateBudgetLineItemTransaction", bli)
          .then(async () => {
            const response = await this.$store.dispatch("budgetlineitem/GetBudgetLineItemTransaction", bli.budgetLineItemId);
            this.transactionTable = response.data;
            this.budgetLineItemBalance = response.data.length ? last(response.data).balance : 0;
            this.alert = {
              type: "success",
              message: "Funds Successfully allocated!",
            };
          })
          .catch((e) => {
            this.showAllocateFundsModal = false;
            this.alert = { type: "danger", message: e };
          });
        this.showAllocateFundsModal = false;
        this.onResetTransaction();
        this.$v.$reset();
      }
    },
    showRevert() {
      this.transactionModalTitle = "Revert Funds";
      this.transactionType = "revert";
      this.transaction.amount = this.budgetLineItemBalance;
      this.transactionModal = true;
    },
    showTransfer() {
      this.transactionModalTitle = "Transfer Funds";
      this.transactionType = "transfer";
      this.transaction.amount = this.budgetLineItemBalance;
      this.transactionModal = true;
    },
    hideAllocationModal() {
      this.transaction.budgetLineItemId = null;
      this.transaction.amount = 0;
      this.showAllocateFundsModal = false;
    },
    hideTransactionModal() {
      this.transaction.budgetLineItemId = null;
      this.transaction.amount = 0;
      this.transactionModal = false;
    },
    async saveTransactions() {
      this.submitted = true;
      this.isErrorMFO = false;
      this.transaction.type = "credit";
      /** check if amount exceeds */
      if (this.transaction.amount > this.budgetLineItemBalance) {
        this.alert = {
          type: "danger",
          message: "Amount exceeds fund source balance!",
        };
        this.tableBusy = false;
        this.transactionModal = false;
        this.hideAllocationModal();
        return;
      }

      if (this.transactionType === "transfer") {
        //check if select is empty

        if (!this.transaction.budgetLineItemId) {
          console.log(this.transaction.budgetLineItemId);
          this.isErrorBLI = true;
        }
      }
      this.tableBusy = true;
      this.$v.$touch();
      if (this.$v.transaction.$invalid || this.isErrorBLI) {
        this.tableBusy = false;
        return false;
      } else {
        this.transaction.date = new Date(this.transaction.date).toISOString();
        this.transaction.amount = Number.parseFloat(this.transaction.amount);
        const mfo = JSON.parse(JSON.stringify(this.transaction));
        const bli = JSON.parse(JSON.stringify(this.transaction));

        /** Do transfer transaction use - bli */
        if (this.transactionType === "transfer") {
          /** Delete  mfoId*/
          delete bli.mfoId;
          /** do debit to other BLI */
          bli.type = "debit";
          await this.$store.dispatch("budgetlineitem/CreateBudgetLineItemTransaction", JSON.parse(JSON.stringify(bli)));
          /** do credit to own BLI */
          bli.type = "credit";
          bli.budgetLineItemId = this.selectedBudgetLineItem;
          this.$store
            .dispatch("budgetlineitem/CreateBudgetLineItemTransaction", JSON.parse(JSON.stringify(bli)))
            .then(() => {
              /** update transaction table */
              /** update mfo balance (fundSourceBalance) */
              this.$store
                .dispatch("budgetlineitem/GetBudgetLineItemTransaction", bli.budgetLineItemId)
                .then((res) => {
                  this.transactionTable = res.data;
                  this.tableBusy = false;
                  this.budgetLineItemBalance = this.transactionTable.length > 0 ? last(this.transactionTable).balance : 0;
                  this.onResetTransaction();
                  this.alert = {
                    type: "success",
                    message: "Funds Successfully Transfered!",
                  };
                })
                .catch(() => {
                  this.tableBusy = false;
                  this.alert = {
                    type: "danger",
                    message: "Something went wrong!",
                  };
                });
            })
            .catch((e) => {
              this.tableBusy = false;
              this.alert = {
                type: "danger",
                message: e,
              };
            });
        }

        /** Do revert transaction use mfo */
        if (this.transactionType === "revert") {
          /** delete transaction.budgetLineItemId */
          delete mfo.budgetLineItemId;
          /** add transaction.fundSourceId */
          mfo.mfoId = this.$store.getters["mfo/getMFO"].id;
          /** do debit on mfo source */
          mfo.type = "debit";
          this.$store
            .dispatch("mfo/CreateMfoTransaction", JSON.parse(JSON.stringify(mfo)))
            .then(async () => {
              const mfo = await this.$store.dispatch("mfo/GetSingleMfo", Number(this.routeID));
              this.$store.commit("mfo/SET_MFO", mfo.data);
              const mfoBalance = await this.$store.dispatch("mfo/GetMfoTransactions", this.routeID);
              let balance = mfoBalance.data.length ? last(mfoBalance.data).balance : 0;
              this.$store.commit("mfo/SET_MFO_BALANCE", balance);
            })
            .catch((e) => {
              this.tableBusy = false;
              this.alert = {
                type: "danger",
                message: e,
              };
            });
          /** do credit on BLI */
          bli.budgetLineItemId = this.selectedBudgetLineItem;
          bli.type = "credit";
          this.$store
            .dispatch("budgetlineitem/CreateBudgetLineItemTransaction", JSON.parse(JSON.stringify(bli)))
            .then(() => {
              /** update transaction table */
              /** update mfo balance (fundSourceBalance) */
              this.$store
                .dispatch("budgetlineitem/GetBudgetLineItemTransaction", bli.budgetLineItemId)
                .then((res) => {
                  this.transactionTable = res.data;
                  this.tableBusy = false;
                  this.budgetLineItemBalance = this.transactionTable.length > 0 ? last(this.transactionTable).balance : 0;
                  this.onResetTransaction();
                })
                .catch(() => {
                  this.tableBusy = false;
                  this.alert = {
                    type: "danger",
                    message: "Something went wrong!",
                  };
                });
              this.alert = {
                type: "success",
                message: "Funds Successfully Reverted!",
              };
            })
            .catch((e) => {
              this.tableBusy = false;
              this.alert = {
                type: "danger",
                message: e,
              };
            });
        }
        this.transactionModal = false;
        this.isErrorBLI = false;
        this.$v.$reset();
      }
    },
    viewTransactions(data) {
      // this.transaction.budgetLineItemId = data.id;
      this.selectedBudgetLineItem = data.id;
      this.budgetLineItem = data;
      this.budgetLineItemBalance = 0;
      this.$store
        .dispatch("budgetlineitem/GetBudgetLineItemTransaction", data.id)
        .then((res) => {
          if (res.data) {
            this.transactionTable = res.data;
            this.budgetLineItemBalance = this.transactionTable.length > 0 ? last(this.transactionTable).balance : 0;

            const options = JSON.parse(JSON.stringify(this.blis));
            this.transferBLIOptions = filter(options, (rec) => {
              return rec.value !== data.id;
            });
            console.log(this.transferBLIOptions);
            this.transferBLIOptions.unshift({
              value: null,
              text: "Select Item...",
            });
          }
        })
        .catch(() => {
          this.alert = { type: "danger", message: "Something went wrong!" };
        });
    },
    addMFO() {
      this.onReset();
      this.modalTitle = "Create New Budget Line Item";
      this.$bvModal.show("modal-standard");
    },
    onCreate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.form.$invalid) {
        return;
      } else {
        if (this.form.id > 0) {
          this.$store
            .dispatch("budgetlineitem/UpdateBudgetLineItem", this.form)
            .then((res) => {
              this.tableData.splice(this.indexSelected, 1, res.data);
              this.$bvModal.hide("modal-standard");
              this.onReset();
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
            .dispatch("budgetlineitem/CreateBudgetLineItem", this.form)
            .then((res) => {
              this.tableData.push(res.data);
              this.$bvModal.hide("modal-standard");
              this.onReset();
              this.alert = {
                type: "success",
                message: "Successfully created!",
              };
            })
            .catch(() => {
              this.alert = { type: "danger", message: "Something went wrong!" };
            });
        }
      }
    },
    onReset() {
      this.submitted = false;
      this.form = {
        id: 0,
        objectCode: "",
        mfoId: this.$route.params.id,
        uacs: "",
        description: "",
      };
    },
    updateItem(props) {
      this.form = cloneDeep(props.item);
      this.indexSelected = this.tableData.indexOf(props.item);
      this.modalTitle = "Update Budget Line Item";
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
            .dispatch("budgetlineitem/DeleteBudgetLineItem", props.item.id)
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
        <b-alert :show="alert.type === 'success'" dismissible @dismissed="alert.type = ''" variant="success"> <i class="mdi mdi-check-all me-2"></i>{{ alert.message }} </b-alert>
        <b-alert :show="alert.type === 'danger'" dismissible @dismissed="alert.type = ''" variant="danger"> <i class="mdi mdi-block-helper me-2"></i>{{ alert.message }} </b-alert>
        <b-alert :show="alert.type === 'warning'" dismissible @dismissed="alert.type = ''" variant="warning"> <i class="mdi mdi-alert-outline me-2"></i>{{ alert.message }} </b-alert>
        <!-- New Budget line item -->
        <b-modal id="modal-standard" :title="modalTitle" size="md" title-class="font-18" hide-footer>
          <form @submit.prevent="onCreate" @reset="onReset" ref="mfoForm" autocomplete="off">
            <div class="mb-3">
              <label for="objectCode">Object Code </label>
              <b-form-input
                id="objectCode"
                type="text"
                v-model="form.objectCode"
                placeholder="Enter Object Code..."
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.form.objectCode.$error,
                }"
              ></b-form-input>
              <div v-if="submitted && $v.form.objectCode.$error" class="invalid-feedback">
                <span v-if="!$v.form.objectCode.required">This value is required.</span>
              </div>
            </div>
            <div class="mb-3">
              <label for="mfoName">MFO Name </label>
              <b-form-input id="mfoName" type="text" v-model="mfo.mfoName" placeholder="Enter MFO Name..." class="form-control" disabled></b-form-input>
            </div>
            <div class="mb-3">
              <label for="description">Description </label>
              <b-form-input
                id="description"
                type="text"
                v-model="form.description"
                placeholder="Enter Description..."
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.form.description.$error,
                }"
              ></b-form-input>
              <div v-if="submitted && $v.form.description.$error" class="invalid-feedback">
                <span v-if="!$v.form.description.required">This value is required.</span>
              </div>
            </div>
            <div class="mb-3">
              <label for="uacs">UACS </label>
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
              <div v-if="submitted && $v.form.uacs.$error" class="invalid-feedback">
                <span v-if="!$v.form.uacs.required">This value is required.</span>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary">
                Save changes
              </button>
              <button type="button" class="btn btn-secondary" @click="hideModal">
                Close
              </button>
            </div>
          </form>
        </b-modal>
        <!-- Allocation Modal -->
        <b-modal v-model="showAllocateFundsModal" id="modal-allocate" :title="modalTitle" size="md" title-class="font-18" hide-footer>
          <div v-if="$store.getters['mfo/getMFO']" class="mb-3">
            <p class="mb-1">
              <strong>MFO: </strong>
              <span class="text-success">{{ $store.getters["mfo/getMFO"].mfoName }}</span>
            </p>
            <p>
              <strong>Balance: </strong>
              <span class="text-success">{{ formatCurrency($store.getters["mfo/getMFOBalance"]) }}</span>
            </p>
            <hr />
          </div>
          <!-- Fund allocatoin trans date -->
          <div class="mb-3">
            <label for="date">Transaction Date</label>
            <date-picker
              v-model="transaction.date"
              :first-day-of-week="1"
              lang="en"
              confirm
              type="datetime"
              value-type="timestamp"
              :class="{
                'is-invalid': submitted && $v.transaction.date.$error,
              }"
            ></date-picker>
            <div v-if="submitted && $v.transaction.date.$error" class="invalid-feedback">
              <span v-if="!$v.transaction.date.required">This value is required.</span>
            </div>
          </div>
          <!-- Fund allocation description -->
          <div class="mb-3">
            <label for="description">Description</label>
            <b-form-input
              v-model="transaction.description"
              id="description"
              placeholder="Enter description"
              class="form-control"
              autocomplete="off"
              :class="{
                'is-invalid': submitted && $v.transaction.description.$error,
              }"
            >
            </b-form-input>
            <div v-if="submitted && $v.transaction.description.$error" class="invalid-feedback">
              <span v-if="!$v.transaction.description.required">This value is required.</span>
            </div>
          </div>
          <!-- Fund allocation amount -->
          <div class="mb-3">
            <label for="amount">Amount</label>
            <b-form-input
              v-model="transaction.amount"
              placeholder="Enter amount"
              :class="{
                'is-invalid': submitted && $v.transaction.amount.$error,
              }"
            >
            </b-form-input>
            <div v-if="submitted && $v.transaction.amount.$error" class="invalid-feedback">
              <span v-if="!$v.transaction.amount.required">This value is required.</span>

              <span v-if="!$v.transaction.amount.decimal">This value must be numeric.</span>
              <span v-if="!$v.transaction.amount.minValue">This value must be greater than 0.</span>
            </div>
          </div>
          <!-- modal footer buttons -->
          <div class="modal-footer">
            <b-button variant="primary" @click="addFund">Add Fund</b-button>
            <b-button variant="link" @click="hideAllocationModal">Close</b-button>
          </div>
        </b-modal>

        <!-- Transaction Modal -->
        <b-modal v-model="transactionModal" id="modal-allocate" :title="transactionModalTitle" size="md" title-class="font-18" hide-footer>
          <div class="mb-3" v-if="budgetLineItem">
            <p class="mb-1">
              <strong>Budget Line Item: </strong>
              <span class="text-success">{{ budgetLineItem.uacs }} | {{ budgetLineItem.objectCode }} - {{ budgetLineItem.description }}</span>
            </p>
            <p>
              <strong>Balance: </strong>
              <span class="text-success">{{ formatCurrency(budgetLineItemBalance) }}</span>
            </p>
            <hr />
          </div>
          <div class="mb-3" v-if="transactionType === 'transfer'">
            <div id="mfo">
              <label for="date">Budget Line Item: </label>
              <b-form-select
                v-model="transaction.budgetLineItemId"
                :options="transferBLIOptions"
                placeholder="Select Line Item..."
                class="form-select form-select-sm"
                :class="{
                  'custom-invalid': submitted && isErrorBLI,
                }"
              ></b-form-select>
              <div v-if="submitted && isErrorBLI" class="custom-invalid-feedback mt-1">
                <span>This value is required.</span>
              </div>
            </div>
          </div>
          <!--  Trans date -->
          <div class="mb-3">
            <label for="date">Transaction Date</label>
            <date-picker
              v-model="transaction.date"
              :first-day-of-week="1"
              lang="en"
              confirm
              type="datetime"
              value-type="timestamp"
              :class="{
                'is-invalid': submitted && $v.transaction.date.$error,
              }"
            ></date-picker>
            <div v-if="submitted && $v.transaction.date.$error" class="invalid-feedback">
              <span v-if="!$v.transaction.date.required">This value is required.</span>
            </div>
          </div>
          <!-- Fund allocation description -->
          <div class="mb-3">
            <label for="description">Description</label>
            <b-form-input
              v-model="transaction.description"
              id="description"
              placeholder="Enter description"
              class="form-control"
              autocomplete="off"
              :class="{
                'is-invalid': submitted && $v.transaction.description.$error,
              }"
            >
            </b-form-input>
            <div v-if="submitted && $v.transaction.description.$error" class="invalid-feedback">
              <span v-if="!$v.transaction.description.required">This value is required.</span>
            </div>
          </div>
          <!-- Fund allocation amount -->
          <div class="mb-3">
            <label for="amount">Amount</label>
            <b-form-input
              v-model="transaction.amount"
              placeholder="Enter amount"
              :class="{
                'is-invalid': submitted && $v.transaction.amount.$error,
              }"
            >
            </b-form-input>
            <div v-if="submitted && $v.transaction.amount.$error" class="invalid-feedback">
              <span v-if="!$v.transaction.amount.required">This value is required.</span>

              <span v-if="!$v.transaction.amount.decimal">This value must be numeric.</span>
              <span v-if="!$v.transaction.amount.minValue">This value must be greater than 0.</span>
            </div>
          </div>
          <!-- modal footer buttons -->
          <div class="modal-footer">
            <b-button variant="primary" @click="saveTransactions">{{ transactionType === "transfer" ? "Transfer" : "Revert" }} </b-button>
            <b-button variant="link" @click="hideTransactionModal">Close</b-button>
          </div>
        </b-modal>
        <div class="row">
          <div class="col-md-12" v-if="$store.getters['mfo/getMFO']">
            <div class="col-md-12">
              <b-card class="border-4 border-top border-start-0 border-end-0 border-bottom-0 border-primary">
                <b-card-text>
                  <div class="row">
                    <div class="col-md-4">
                      <p class="mb-1">
                        <strong>MFO: </strong><span class="text-success">{{ $store.getters["mfo/getMFO"].mfoName }}</span>
                      </p>
                      <p class="mb-1">
                        <strong>UACS: </strong>
                        <span class="text-success">{{ $store.getters["mfo/getMFO"].uacs }}</span>
                      </p>
                    </div>
                    <div class="col-md-4">
                      <p class="mb-1">
                        <strong>Fund Source: </strong>
                        <span class="text-success">{{ $store.getters["mfo/getMFO"].fundSource.sourceName }}</span>
                      </p>
                      <p class="mb-1">
                        <strong>Fund Classification: </strong>
                        <span class="text-success">{{ $store.getters["mfo/getMFO"].fundClassification }}</span>
                      </p>
                    </div>
                    <div class="col-md-4">
                      <p>
                        <strong>Balance: </strong>
                        <span class="text-success">{{ formatCurrency($store.getters["mfo/getMFOBalance"]) }}</span>
                      </p>
                    </div>
                  </div>
                </b-card-text>
              </b-card>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4">
            <b-card class="border-4 border-top border-start-0 border-end-0 border-bottom-0 border-primary">
              <b-card-title>Items</b-card-title>
              <b-card-text class="my-3">
                <div class="d-flex justify-content-between mb-3">
                  <div class="dataTables_filter">
                    <label class="d-inline-flex align-items-center">
                      <b-form-input v-model="filter" type="search" placeholder="Search..." class="form-control form-control-sm"></b-form-input>
                    </label>
                  </div>
                  <div class="text-end">
                    <button type="button" @click="addMFO()" class="btn btn-sm btn-info d-flex align-items-center"><i class="bx bx-plus fs-6"></i>Create New</button>
                  </div>
                </div>
                <simplebar style="max-height: 330px">
                  <div class="table-responsive mb-0">
                    <b-table
                      class="datatables"
                      :items="tableData"
                      :fields="fields"
                      responsive="sm"
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
                          <b-dropdown id="dropdown-dropleft" right variant="link" toggle-class="text-decoration-none" menu-class="dropdown-menu-end" no-caret>
                            <template #button-content>
                              <i class="fas fa-ellipsis-v"></i>
                            </template>
                            <b-dropdown-item @click="viewTransactions(row.item)" variant="secondary"><i class="mdi mdi-bank-transfer font-size-18 me-1"></i>View Transactions</b-dropdown-item>
                            <b-dropdown-item @click="allocateFund(row.item)" variant="secondary" v-if="$store.getters['mfo/getMFOBalance'] > 0"
                              ><i class="mdi mdi-cash-plus font-size-18 me-1"></i>Allocate Funds</b-dropdown-item
                            >
                            <b-dropdown-item @click="updateItem(row)" variant="secondary"><i class="mdi mdi-update font-size-18 me-1"></i>Edit</b-dropdown-item>
                            <b-dropdown-item @click="deleteItem(row)" variant="danger"><i class="mdi mdi-trash-can font-size-18 me-1"></i>Delete</b-dropdown-item>
                          </b-dropdown>
                        </div>
                      </template>
                    </b-table>
                  </div>
                </simplebar>
              </b-card-text>
            </b-card>
          </div>
          <div class="col-md-8">
            <b-card class="border-4 border-top border-start-0 border-end-0 border-bottom-0 border-primary">
              <b-card-title class="mb-3">Details and Transactions</b-card-title>
              <b-card-text>
                <div class="d-flex justify-content-between" v-if="budgetLineItem">
                  <div class="pt-3">
                    <h6>
                      <span class="font-weight-light">Line Item: </span>
                      <span class="text-success">{{ budgetLineItem.description }}</span>
                    </h6>
                    <h6>
                      <span class="font-weight-light">UACS: </span>
                      <span class="text-success">{{ budgetLineItem.uacs }}</span>
                    </h6>
                    <h6>
                      <span class="font-weight-light">Unallocated Budget: </span>
                      <span class="text-success">Php {{ budgetLineItemBalance }}</span>
                    </h6>
                  </div>
                  <div class="text-end my-2">
                    <b-dropdown variant="info" v-if="this.budgetLineItemBalance > 0" :disabled="$store.getters['mfo/getMFOBalance'] < 1 ? true : false">
                      <template slot="button-content">
                        Add Transaction
                        <i class="mdi mdi-chevron-down"></i>
                      </template>
                      <b-dropdown-item @click="showTransfer">
                        <i class="bx bx-money font-size-16 align-middle me-2 text-success"></i>
                        Transfer
                      </b-dropdown-item>
                      <b-dropdown-item @click="showRevert" :disabled="$store.getters['mfo/getMFOBalance'] < 1 ? true : false">
                        <i class="bx bx-transfer font-size-16 align-middle me-2 text-success"></i>
                        Revert</b-dropdown-item
                      >
                    </b-dropdown>
                  </div>
                </div>
                <div class="table-responsive mb-0 mt-2">
                  <b-table
                    class="datatables"
                    :items="transactionTable"
                    :fields="transField"
                    responsive="sm"
                    :per-page="perPage"
                    :current-page="currentPage"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :busy="tableBusy"
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
                    <template #cell(date)="row">
                      <span>{{
                        new Date(row.item.date).toLocaleDateString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })
                      }}</span>
                    </template>
                  </b-table>
                </div>
                <div class="row">
                  <div class="col">
                    <div class="dataTables_paginate paging_simple_numbers float-end">
                      <ul class="pagination pagination-rounded mb-0">
                        <!-- pagination -->
                        <b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage"></b-pagination>
                      </ul>
                    </div>
                  </div>
                </div>
              </b-card-text>
            </b-card>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style>
.custom-invalid-feedback {
  font-size: 80%;
  color: #f46a6a;
}
.custom-invalid {
  border: 1px solid #f46a6a !important;
}
.simplebar-mask,
.simplebar-content-wrapper {
  overflow: visible !important;
}
</style>
