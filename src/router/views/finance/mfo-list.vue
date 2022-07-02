<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import _ from "lodash";
import cloneDeep from "lodash/cloneDeep";
import last from "lodash/last";
import { required, minValue, decimal } from "vuelidate/lib/validators";
import simplebar from "simplebar-vue";
import DatePicker from "vue2-datepicker";
import employmentRecordVue from "../../../components/modals/employment-record.vue";

export default {
  page: {
    title: "MFO List",
  },
  components: {
    Layout,
    PageHeader,
    simplebar,
    DatePicker,
  },
  data() {
    return {
      title: "MFO List",
      year: "",
      routeID: this.$route.params.id,
      fundSource: {},
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "MFO List",
          active: true,
        },
      ],
      tableBusy: false,
      tableData: [],
      transactionTable: [],
      fundSourceBalance: 0,
      selectedFundSource: 0,
      modalTitle: "",
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "cluster",
      sortDesc: false,
      mfos: [],
      fundSources: [],
      transferOption: [],
      fields: [
        {
          key: "mfoName",
          sortable: false,
          label: "MFO Name",
        },
        {
          key: "uacs",
          sortable: false,
          label: "UACS",
        },
        {
          key: "actions",
        },
      ],
      transField: [
        {
          key: "date",
          label: "Date",
          sortable: true,
          tdClass: "align-middle",
        },
        {
          key: "description",
          sortable: true,
          label: "Description",
          tdClass: "align-middle",
        },
        {
          key: "debit",
          sortable: true,
          label: "Debit",
          tdClass: "align-middle",
        },
        {
          key: "credit",
          sortable: true,
          label: "Credit",
          tdClass: "align-middle align-right",
        },
        {
          key: "balance",
          sortable: true,
          label: "Balance",
          tdClass: "align-middle align-right",
        },
      ],
      form: {
        id: 0,
        mfoName: "",
        fundSourceId: this.$route.params.id,
        uacs: "",
        cycle: "",
      },
      transaction: {
        type: "",
        description: "",
        date: null,
        amount: 0,
        mfoId: null,
        fundSourceId: null,
      },
      alert: {
        type: "",
        message: "",
      },
      indexSelected: -1,
      submitted: false,
      isErrorMFO: false,
      isErrorFund: false,
      cycles: [],
      options: [],
      fundClassifications: [],
      multipleForm: [],
      mfoOptions: [],
      fundSourceOptions: [],
      checkFundClass: false,
      isCreate: true,
      transactionModalTitle: null,
      transactionType: null,
      transactionModal: false,
      showAllocateFundsModal: false,
      selectedmfo: null,
      transferMfo: null,
    };
  },
  validations: {
    form: {
      mfoName: { required },
      uacs: { required },
      cycle: { required },
    },
    transaction: {
      type: { required },
      description: { required },
      date: { required },
      amount: { required, decimal, minValue: minValue(1) },
    },
  },
  async created() {
    const fc = await this.$store.dispatch("fundclassification/GetFundClassification");
    this.options = fc.data.map((data) => ({
      text: data.classification,
      value: data.classification,
    }));
    const fs = await this.$store.dispatch("fundsource/GetSingleFundSource", this.routeID);
    this.$store.commit("fundsource/SET_FUND_SOURCE", fs.data);
    const mfo = await this.$store.dispatch("mfo/GetMfoByFS", this.routeID);
    this.mfos = mfo.data.map((data) => ({
      value: data.id,
      text: `${data.mfoName} - ${data.fundClassification}`,
    }));
    const funds = await this.$store.dispatch("fundsource/GetFundSource");
    const allfunds = funds.data.map((data) => ({
      value: data.id,
      text: data.sourceName,
    }));
    this.fundSources = allfunds;
    // this.fundSources = allfunds.filter((e) => e.value !== this.routeID);
    this.fundSources.unshift({
      value: null,
      text: "Select Fund source...",
    });
  },
  computed: {
    rows() {
      return this.transactionTable.length;
    },
  },
  mounted() {
    this.$store
      .dispatch("fundsource/GetSingleFundSource", this.routeID)
      .then((res) => {
        this.fundSource = res.data;
        this.title = `${res.data.sourceName} MFOs`;
        // this.year = res.data.cycle.year;
      })
      .catch((err) => {
        this.alert = { type: "danger", message: "Something went wrong!" };
      });
    var cycles = [{ text: "" }];
    this.$store
      .dispatch("cycle/GetAllCycle")
      .then((res) => {
        res.data.forEach((item) => cycles.push({ text: item.year, value: item.year }));
        this.cycles = cycles;
      })
      .catch((err) => {
        this.alert = { type: "danger", message: "Something went wrong!" };
      });
    this.$store
      .dispatch("mfo/GetMfoByFS", this.routeID)
      .then((res) => {
        this.tableData = res.data;
      })
      .catch((err) => {
        this.alert = { type: "danger", message: err };
      });
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
    selectFundSourceId(value) {
      this.transaction.fundSourceId = value;
    },
    async saveTransaction() {
      this.submitted = true;
      this.isErrorMFO = false;
      this.transaction.type = "credit";
      /** check if amount exceeds */
      if (this.transaction.amount > this.fundSourceBalance) {
        this.alert = {
          type: "danger",
          message: "Amount exceeds fund source balance!",
        };
        this.tableBusy = false;
        this.transactionModal = false;
        this.hideTransaction();
        return;
      }

      if (this.transactionType === "transfer") {
        //check if select is empty
        if (!this.transferMfo) {
          this.isErrorMFO = true;
        }
        this.transaction.mfoId = this.transferMfo;
      }
      this.tableBusy = true;
      this.$v.$touch();
      if (this.$v.transaction.$invalid || this.isErrorMFO) {
        this.tableBusy = false;
        return false;
      } else {
        this.transaction.date = new Date(this.transaction.date).toISOString();
        this.transaction.amount = Number.parseFloat(this.transaction.amount);
        const fs = JSON.parse(JSON.stringify(this.transaction));
        const mfo = JSON.parse(JSON.stringify(this.transaction));

        /** Do transfer transaction */
        if (this.transactionType === "transfer") {
          /** delete fundSourceId */
          delete mfo.fundSourceId;
          /** do debit to other MFO */
          mfo.type = "debit";
          console.log("debit", JSON.parse(JSON.stringify(mfo)));
          await this.$store.dispatch("mfo/CreateMfoTransaction", JSON.parse(JSON.stringify(mfo)));
          /** do credit to own MFO */
          mfo.type = "credit";
          mfo.mfoId = this.selectedFundSource;
          this.$store
            .dispatch("mfo/CreateMfoTransaction", JSON.parse(JSON.stringify(mfo)))
            .then(() => {
              /** update transaction table */
              /** update mfo balance (fundSourceBalance) */
              this.$store
                .dispatch("mfo/GetMfoTransactions", mfo.mfoId)
                .then((res) => {
                  this.transactionTable = res.data;
                  this.tableBusy = false;
                  this.fundSourceBalance = this.transactionTable.length > 0 ? last(this.transactionTable).balance : 0;
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
          console.log("credit", JSON.parse(JSON.stringify(mfo)));
        }
        /** Do revert transaction */
        if (this.transactionType === "revert") {
          /** delete transaction.mfoId */
          delete fs.mfoId;
          /** add transaction.fundSourceId */
          fs.fundSourceId = this.$store.getters["fundsource/getFundSource"].id;
          fs.type = "debit";
          /** do debit on fund source */
          this.$store
            .dispatch("fundsource/CreateFundSourceTransactions", JSON.parse(JSON.stringify(fs)))
            .then(async () => {
              const fs = await this.$store.dispatch("fundsource/GetSingleFundSource", this.routeID);
              this.$store.commit("fundsource/SET_FUND_SOURCE", fs.data);
            })
            .catch((e) => {
              this.tableBusy = false;
              this.alert = {
                type: "danger",
                message: e,
              };
            });

          /** do credit on MFO */
          delete mfo.fundSourceId;
          this.$store
            .dispatch("mfo/CreateMfoTransaction", JSON.parse(JSON.stringify(mfo)))
            .then(() => {
              /** update transaction table */
              /** update mfo balance (fundSourceBalance) */
              this.$store
                .dispatch("mfo/GetMfoTransactions", mfo.mfoId)
                .then((res) => {
                  this.transactionTable = res.data;
                  this.tableBusy = false;
                  this.fundSourceBalance = this.transactionTable.length > 0 ? last(this.transactionTable).balance : 0;
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
      }
      this.transactionModal = false;
      this.isErrorMFO = false;
      this.$v.$reset();
    },
    hideTransaction() {
      this.transactionModal = false;
      this.transaction.date = null;
      this.transaction.description = "";
      this.transaction.amount = 0;
      this.transaction.type = "";
    },
    addMFO() {
      this.isCreate = true;
      this.onReset();
      this.modalTitle = "Create New MFO List";
      this.$bvModal.show("modal-standard");
    },
    addTransaction() {
      this.transactionModalTitle = "Add Transaction";
      this.transactionType = "single";
      this.transaction.mfoId = this.selectedFundSource;
      this.transactionModal = true;
    },
    transferFund() {
      this.transactionModalTitle = "Transfer Fund";
      this.transactionType = "transfer";
      this.transaction.mfoId = null;
      delete this.transaction.fundSourceId;
      this.transaction.amount = this.fundSourceBalance;
      this.transactionModal = true;
    },
    showRevert() {
      this.transactionModalTitle = "Revert Fund to Fund Source";
      this.transactionType = "revert";
      this.transaction.mfoId = this.selectedFundSource;
      this.transaction.amount = this.fundSourceBalance;
      this.transactionModal = true;
    },
    showTransfer() {
      this.transactionModalTitle = "Transfer Fund";
      this.transactionType = "transfer";
      this.transaction.mfoId = this.selectedFundSource;
      this.transaction.amount = this.fundSourceBalance;
      this.transactionModal = true;
    },
    onCreate() {
      this.submitted = true;
      this.checkFundClass = false;
      if (this.fundClassifications.length === 0) this.checkFundClass = true;
      this.$v.$touch();
      if (this.$v.form.$invalid || (this.checkFundClass && this.isCreate === true)) {
        return;
      } else {
        if (this.form.id > 0) {
          this.$store
            .dispatch("mfo/UpdateMfo", this.form)
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
          /** Map each value of fund classification for array */
          this.multipleForm = [];
          this.fundClassifications.forEach((item) => {
            this.multipleForm.push({
              uacs: this.form.uacs,
              mfoName: this.form.mfoName,
              fundClassification: item,
              fundSourceId: Number(this.form.fundSourceId),
              cycle: this.form.cycle,
            });
          });
          this.$store
            .dispatch("mfo/CreateMultipleMfos", this.multipleForm)
            .then((res) => {
              this.tableData.push(...res.data);
              // _.forEach(this.multipleForm, (item) => {
              //   this.tableData.push(item);
              // });
              // this.tableData.push(res.data);
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
    onReset() {
      this.submitted = false;
      this.form = {
        id: 0,
        mfoName: "",
        fundSourceId: this.$route.params.id,
        uacs: "",
      };
      this.fundClassifications = [];
    },
    onResetTransaction() {
      this.transaction.amount = 0;
      this.transaction.date = null;
      this.transaction.description = "";
      this.transaction.fundSourceId = null;
      this.transaction.mfoId = null;
      this.transaction.type = null;
    },
    updateItem(props) {
      this.isCreate = false;
      this.form = cloneDeep(props.item);
      this.indexSelected = this.tableData.indexOf(props);
      this.modalTitle = "Update MFO List";
      this.$bvModal.show("modal-standard");
    },
    hideModal() {
      this.$bvModal.hide("modal-standard");
    },
    deleteItem(props) {
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
            .dispatch("mfo/DeleteMfo", props.id)
            .then((res) => {
              if (res.status == 204) {
                this.tableData.splice(this.tableData.indexOf(props), 1);
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
    viewBLI(id) {
      this.$router.push(`/finance/budget-line-item/${id}`);
    },
    allocateFunds(data) {
      if (this.$store.getters["fundsource/getFundSource"].balance < 1) {
        this.alert = {
          type: "danger",
          message: `Fund Source Balance is ${this.formatCurrency(0)}. Please make sure to add funds on fund source before allocating budget for MFO`,
        };
        return;
      }
      this.modalTitle = "Allocate Funds";

      this.transaction.mfoId = data.id;
      this.transaction.fundSourceId = this.$store.getters["fundsource/getFundSource"].id;
      this.transaction.amount = this.$store.getters["fundsource/getFundSource"].balance;
      this.showAllocateFundsModal = true;
    },
    addFund() {
      if (this.transaction.amount > this.$store.getters["fundsource/getFundSource"].balance) {
        this.alert = {
          type: "danger",
          message: `Fund Source Balance is ${this.formatCurrency(
            this.$store.getters["fundsource/getFundSource"].balance
          )}. Please make sure to add funds on fund source before allocating budget for MFO`,
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
        const fs = JSON.parse(JSON.stringify(this.transaction));
        fs.type = "credit";
        mfo.type = "debit";
        delete fs.mfoId;
        delete mfo.fundSourceId;
        /** Do credit - use fundSource id */
        this.$store
          .dispatch("fundsource/CreateFundSourceTransactions", fs)
          .then(async () => {
            const fs = await this.$store.dispatch("fundsource/GetSingleFundSource", this.routeID);
            this.$store.commit("fundsource/SET_FUND_SOURCE", fs.data);
          })
          .catch((e) => {
            this.showAllocateFundsModal = false;
            this.alert = { type: "danger", message: e };
          });
        /** Do debit -  use MFO id */
        this.$store
          .dispatch("mfo/CreateMfoTransaction", mfo)
          .then(async (data) => {
            const response = await this.$store.dispatch("mfo/GetMfoTransactions", mfo.mfoId);
            this.transactionTable = response.data;
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
    hideAllocationModal() {
      this.transaction.mfoId = null;
      this.transaction.amount = 0;
      this.showAllocateFundsModal = false;
    },
    viewTransactions(data) {
      this.transaction.mfoId = data.id;
      this.selectedFundSource = data.id;
      this.selectedmfo = data.mfoName;
      this.$store
        .dispatch("mfo/GetMfoTransactions", data.id)
        .then((res) => {
          this.transactionTable = res.data;
          console.log(this.transactionTable);
          this.fundSourceBalance = this.transactionTable.length > 0 ? last(this.transactionTable).balance : 0;
        })
        .catch(() => {
          this.alert = { type: "danger", message: "Something went wrong!" };
        });
      this.transferOption = this.mfos.filter((obj) => obj.value != data.id);

      this.transferOption.unshift({
        value: null,
        text: "Select MFO...",
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
        <b-modal id="modal-standard" :title="modalTitle" size="md" title-class="font-18" hide-footer>
          <form @submit.prevent="onCreate" @reset="onReset" ref="mfoForm">
            <div class="mb-3">
              <label for="mfoName">MFO Name</label>
              <b-form-input
                id="mfoName"
                type="text"
                v-model="form.mfoName"
                placeholder="Enter MFO Name..."
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.form.mfoName.$error,
                }"
              >
              </b-form-input>
              <div v-if="submitted && $v.form.mfoName.$error" class="invalid-feedback">
                <span v-if="!$v.form.mfoName.required">This value is required.</span>
              </div>
            </div>
            <div class="mb-3">
              <label for="shortName">Fund Source</label>
              <b-form-input id="shortName" type="text" v-model="fundSource.sourceName" placeholder="Enter Short Name..." class="form-control" disabled> </b-form-input>
            </div>
            <div class="mb-3">
              <label for="fundClassification">Fund Classification</label>
              <div v-if="submitted && checkFundClass" class="invalid-feedback d-block mt-0 mb-3">
                <span>This value is required.</span>
              </div>
              <div class="form-check form-check-success mb-3" v-if="isCreate">
                <b-form-checkbox-group id="fundClassifications" :options="options" v-model="fundClassifications" name="fundClassifications"> </b-form-checkbox-group>
              </div>
              <b-form-input v-if="!isCreate" id="fundClassification" type="text" v-model="form.fundClassification" class="form-control" disabled> </b-form-input>
            </div>
            <div class="mb-3">
              <label for="fundClassification">Cycle</label>
              <b-form-select
                class="form-select form-select-sm"
                v-model="form.cycle"
                size="sm"
                :options="cycles"
                :class="{
                  'is-invalid': submitted && $v.form.cycle.$error,
                }"
              >
              </b-form-select>
              <div v-if="submitted && $v.form.cycle.$error" class="invalid-feedback">
                <span v-if="!$v.form.cycle.required">This value is required.</span>
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
              >
              </b-form-input>
              <div v-if="submitted && $v.form.uacs.$error" class="invalid-feedback">
                <span v-if="!$v.form.uacs.required">This value is required.</span>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary">
                {{ this.form.id === 0 ? "Create" : "Update" }}
              </button>
              <button type="button" class="btn btn-secondary" @click="hideModal">
                Close
              </button>
            </div>
          </form>
        </b-modal>
        <!-- Allocate Funds Modal -->
        <b-modal v-model="showAllocateFundsModal" id="modal-allocate" :title="modalTitle" size="md" title-class="font-18" hide-footer>
          <div v-if="$store.getters['fundsource/getFundSource']" class="mb-3">
            <p class="mb-1">
              <strong>Fund Source: </strong>
              <span class="text-success">{{ $store.getters["fundsource/getFundSource"].sourceName }}</span>
            </p>
            <p>
              <strong>Balance: </strong>
              <span class="text-success">{{ formatCurrency($store.getters["fundsource/getFundSource"].balance) }}</span>
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
        <!-- Transactions Modal-->
        <b-modal title-class="font-18" hide-footer v-model="transactionModal" :title="transactionModalTitle">
          <div class="mb-3">
            <p class="mb-1">
              <strong>MFO Name: </strong>
              <span class="text-success">{{ selectedmfo }}</span>
            </p>
            <p>
              <strong>MFO Balance: </strong>
              <span class="text-success">{{ formatCurrency(fundSourceBalance) }}</span>
            </p>
            <hr />
          </div>
          <div class="mb-3">
            <div v-if="transactionType === 'transfer'" class="mb-3">
              <div id="mfo">
                <label for="date">MFO</label>
                <b-form-select
                  v-model="transferMfo"
                  :options="transferOption"
                  placeholder="Select MFO..."
                  class="form-select form-select-sm"
                  :class="{
                    'custom-invalid': submitted && isErrorMFO,
                  }"
                ></b-form-select>
                <div v-if="submitted && isErrorMFO" class="custom-invalid-feedback mt-1">
                  <span>This value is required.</span>
                </div>
              </div>
            </div>
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
          <div class="modal-footer">
            <b-button variant="primary" @click="saveTransaction">
              Save
            </b-button>
            <b-button variant="link" @click="hideTransaction">
              Close
            </b-button>
          </div>
        </b-modal>
        <div class="row" v-if="$store.getters['fundsource/getFundSource']">
          <div class="col-md-12">
            <b-card class="border-4 border-top border-start-0 border-end-0 border-bottom-0 border-primary">
              <b-card-text>
                <div class="row">
                  <div class="col-md-4">
                    <p class="mb-1">
                      <strong>Fund Source: </strong><span class="text-success">{{ $store.getters["fundsource/getFundSource"].sourceName }}</span>
                    </p>
                    <p class="mb-1">
                      <strong>Description: </strong>
                      <span class="text-success">{{ $store.getters["fundsource/getFundSource"].description }}</span>
                    </p>
                  </div>
                  <div class="col-md-4">
                    <p class="mb-1">
                      <strong>Fund Cluster: </strong>
                      <span class="text-success">{{ $store.getters["fundsource/getFundSource"].fundCluster.cluster }}</span>
                    </p>
                    <p class="mb-1">
                      <strong>Fund Cluster: </strong>
                      <span class="text-success">{{ $store.getters["fundsource/getFundSource"].fundCluster.uacs }}</span>
                    </p>
                  </div>
                  <div class="col-md-4">
                    <p>
                      <strong>Balance: </strong>
                      <span class="text-success">{{ formatCurrency($store.getters["fundsource/getFundSource"].balance) }}</span>
                    </p>
                  </div>
                </div>
              </b-card-text>
            </b-card>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4">
            <b-card class="border-4 border-top border-start-0 border-end-0 border-bottom-0 border-primary">
              <b-card-title>MFO List</b-card-title>
              <b-card-text class="my-3">
                <div class="d-flex justify-content-between">
                  <div class="dataTables_filter">
                    <label class="d-inline-flex align-items-center">
                      <b-form-input v-model="filter" type="search" placeholder="Search..." class="form-control form-control-sm"></b-form-input>
                    </label>
                  </div>

                  <div class="text-end">
                    <button type="button" @click="addMFO()" class="btn btn-sm btn-info d-flex align-items-center"><i class="bx bx-plus fs-6"></i>Create New</button>
                  </div>
                </div>
                <!-- MFO Table -->
                <simplebar style="max-height: 500px">
                  <div class="table-responsive mb-0">
                    <b-table
                      class="table table-centered table-nowrap align-middle"
                      :items="tableData"
                      :fields="fields"
                      responsive="sm"
                      :filter="filter"
                      :filter-included-fields="filterOn"
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
                      <template #cell(mfoName)="row">
                        <p class="my-0 text-success">
                          <strong>{{ row.item.mfoName }}</strong>
                        </p>
                        <small class="text-muted">Classification: {{ row.item.fundClassification }}</small>
                      </template>
                      <template #cell(actions)="row">
                        <div class="float-end">
                          <b-dropdown id="dropdown-dropleft" right variant="link" toggle-class="text-decoration-none" menu-class="dropdown-menu-end" no-caret>
                            <template #button-content>
                              <i class="fas fa-ellipsis-v"></i>
                            </template>

                            <b-dropdown-item @click="viewTransactions(row.item)" variant="secondary"><i class="mdi mdi-bank-transfer font-size-18 me-1"></i>View Transactions</b-dropdown-item>
                            <b-dropdown-item @click="allocateFunds(row.item)" variant="secondary"><i class="mdi mdi-cash-plus font-size-18 me-1"></i>Allocate Funds</b-dropdown-item>
                            <b-dropdown-item @click="viewBLI(row.item.id)" variant="secondary"><i class="mdi mdi-view-list font-size-18 me-1"></i>View Budget Line Item</b-dropdown-item>
                            <b-dropdown-item @click="updateItem(row)" variant="secondary"><i class="bx bx-edit font-size-18 me-1"></i>Update</b-dropdown-item>
                            <b-dropdown-item @click="deleteItem(row.item)" variant="danger"><i class="mdi mdi-trash-can font-size-18 me-1"></i>Delete</b-dropdown-item>
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
              <b-card-title>Details &amp; Transactions</b-card-title>
              <div class="d-flex justify-content-between" v-if="selectedFundSource">
                <div class="pt-3">
                  <h6>
                    <span class="font-weight-light">Unallocated Budget: </span>
                    <span class="text-success">Php {{ fundSourceBalance }}</span>
                  </h6>
                </div>
                <div class="text-end my-2">
                  <b-dropdown variant="info" :disabled="fundSourceBalance < 1 ? true : false">
                    <template slot="button-content">
                      Add Transaction
                      <i class="mdi mdi-chevron-down"></i>
                    </template>
                    <b-dropdown-item @click="showTransfer">
                      <i class="bx bx-money font-size-16 align-middle me-2 text-success"></i>
                      Transfer
                    </b-dropdown-item>
                    <b-dropdown-item @click="showRevert" :disabled="fundSourceBalance < 1 ? true : false">
                      <i class="bx bx-transfer font-size-16 align-middle me-2 text-success"></i>
                      Revert</b-dropdown-item
                    >
                  </b-dropdown>
                </div>
              </div>
              <div class="table-responsive mb-0 mt-3">
                <b-table
                  class="datatables"
                  :items="transactionTable"
                  :fields="transField"
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
