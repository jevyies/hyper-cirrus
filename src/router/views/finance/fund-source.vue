<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import FundSourceTransactions from "@/components/tables/fundsourcetransactions";

import FundSources from "@/components/widgets/fundsources";
import Swal from "sweetalert2";

import DatePicker from "vue2-datepicker";
import { cloneDeep, last } from "lodash";
import { required, decimal, minValue, requiredIf } from "vuelidate/lib/validators";

import PrintOptions from "@/components/modals/print-options.vue";
import MaskedInput from "vue-text-mask";
import createNumberMask from "text-mask-addons/dist/createNumberMask";

export default {
  page: {
    title: "Fund Source",
  },
  components: {
    Layout,
    PageHeader,
    DatePicker,
    FundSourceTransactions,
    FundSources,
    PrintOptions,
    MaskedInput,
  },
  data() {
    return {
      title: "Fund Source",
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Fund Source",
          active: true,
        },
      ],
      transactionType: null,
      transactionModalTitle: "",
      currencyMask: createNumberMask({
        prefix: "",
        allowDecimal: true,
      }),
      selectedCluster: null,
      selectedFundSource: null,
      selectedFundSourceName: null,
      tableData: [],
      alltableData: [],
      transactionTable: [],
      prexcTable: [],
      transferOption: [],
      allTransferOption: [],
      modalTitle: "",
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      clusterOptions: [],
      clusterOptionforTransfer: [],
      filter: null,
      filterOn: [],
      sortBy: "age",
      sortDesc: false,
      transactionModal: false,
      transferModal: false,
      agencyID: JSON.parse(localStorage.getItem("user")).department.deliveryUnit.office
        .campus.agencyId,

      form: {
        id: 0,
        uacs: "",
        sourceName: "",
        shortName: "",
        description: "",
        bankName: "",
        accountNumber: "",
        address: "",
        fundClusterId: null,
        expiry: Date.now(),
        hasExpiry: false,
        agencyId: 0,
      },
      transaction: {
        type: "",
        description: "",
        date: Date.now(),
        amount: "0",
        fundSourceId: null,
      },
      alert: {
        type: "",
        message: "",
      },
      modalAlert: {
        show: false,
        type: "",
        message: "",
      },
      fsModal: {
        show: false,
        title: null,
      },
      indexSelected: -1,
      fcOptions: [],
      cOptions: [],
      sOptions: [],
      fundCluster: "",
      cycle: Number(this.$store.getters["data/getCycle"]),
      cycleSearch: "",
      fundSourceBalance: 0,
      submitted: true,
      tableBusy: false,
      toggleTables: "Transactions",
      active: [],
      expired: [],
      isExpired: false,
    };
  },
  validations: {
    form: {
      uacs: { required },
      sourceName: { required },
      shortName: { required },
      description: { required },
      bankName: { required },
      accountNumber: { required },
      address: { required },
      expiry: { required },
    },
    fundCluster: { required },
    transaction: {
      fundSourceId: { required },
      description: { required },
      date: {
        required: requiredIf(function (data) {
          return data.transactionType === "single";
        }),
      },
      amount: { required },
    },
  },
  computed: {
    rows() {
      return this.transactionTable.length;
    },
  },
  created() {
    this.totalRows = this.items.length;
    this.tableBusy = true;
    this.$store
      .dispatch("fundcluster/GetFundCluster")
      .then((res) => {
        this.fcOptions = res.data;
        this.clusterOptions = this.fcOptions.map((obj) => ({
          value: obj.id,
          text: obj.cluster,
        }));
        this.clusterOptions.unshift({
          value: null,
          text: "Select Fund cluster...",
        });
        this.clusterOptionforTransfer = this.clusterOptions;
      })
      .catch(() => {
        this.alert = {
          type: "danger",
          message:
            "Something went wrong! Cannot fetch fund clusters. Please contact your administrator.",
        };
      });
    this.tableBusy = false;
  },
  methods: {
    changeCycle(cycle) {
      this.cycle = cycle;
    },
    formatCurrency(data) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    checkExpiry(data) {
      return new Date() > new Date(data) ? true : false;
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    hideTransaction() {
      this.transactionModal = false;
      this.transaction.date = Date.now();
      this.transaction.description = "";
      this.transaction.amount = "0";
      this.transaction.type = "";
    },
    saveTransaction() {
      if (this.transactionType === "transfer") {
        if (Number(this.getExactAmt(this.transaction.amount)) > this.fundSourceBalance) {
          this.modalAlert = {
            show: true,
            type: "danger",
            message: "Amount exceeds fund source balance!",
          };
          this.tableBusy = false;
          return;
        }
      }
      if (Number(this.getExactAmt(this.transaction.amount)) < 1) {
        this.modalAlert = {
          show: true,
          type: "danger",
          message: "Amount should be greater than 0!",
        };
        this.tableBusy = false;
        return;
      }
      const selectedFSId = JSON.parse(JSON.stringify(this.selectedFundSource));
      this.tableBusy = true;
      this.$v.$touch();
      if (this.$v.transaction.$invalid) {
        this.tableBusy = false;
        return;
      } else {
        if (this.transactionType === "transfer") {
          const data = {
            fromId: this.selectedFundSource,
            toId: this.transaction.fundSourceId,
            description: this.transaction.description,
            amount: Number(this.getExactAmt(this.transaction.amount)),
          };
          this.$store
            .dispatch("fundsource/transferFundSource", data)
            .then((response) => {
              this.$store.dispatch();
              this.transactionTable = [];
              // const transactions = await this.$store.dispatch(
              //   "fundsource/GetTransactionByFundSource",
              //   selectedFSId
              // );

              this.$store
                .dispatch("fundsource/GetTransactionByFundSource", selectedFSId)
                .then((res) => {
                  this.transactionTable = res.data;
                });

              this.fundSourceBalance = response.data.balance;

              this.active.find((obj) => obj.id === this.selectedFundSource).balance =
                response.data.balance;
              if (this.active.find((obj) => obj.id === data.toId)) {
                this.active.find((obj) => obj.id === data.toId).balance += data.amount;
              }

              this.alert = {
                type: "success",
                message: "Successfully transferred funds",
              };
            })
            .catch((e) => {
              this.tableBusy = false;
              this.alert = {
                type: "danger",
                // message:
                //   "Something went wrong! Failed to transfer funds. Please contact your administrator",
                message: e,
              };
              this.hideTransaction();
              this.transactionModal = false;
            });
        }
        if (this.transactionType === "single") {
          // this.transaction.date = new Date(this.transaction.date).toISOString();
          const nDate = new Date(
            new Date(this.transaction.date).getTime() -
              new Date(this.transaction.date).getTimezoneOffset() * 60 * 1000
          );

          this.transaction.date = nDate.toISOString();
          // this.transaction.amount = Number.parseFloat(this.transaction.amount);
          let nData = JSON.parse(JSON.stringify(this.transaction));
          nData.amount = Number(this.getExactAmt(nData.amount));

          this.$store
            .dispatch("fundsource/CreateFundSourceTransactions", nData)
            .then((response) => {
              this.transactionTable = [];
              // const transactions = await this.$store.dispatch(
              //   "fundsource/GetTransactionByFundSource",
              //   selectedFSId
              // );

              this.$store
                .dispatch("fundsource/GetTransactionByFundSource", selectedFSId)
                .then((res) => {
                  this.transactionTable = res.data;
                });

              this.fundSourceBalance = response.data.balance;
              this.active.find((obj) => obj.id === this.selectedFundSource).balance =
                response.data.balance;
              this.tableBusy = false;
              this.hideTransaction();
              this.alert = {
                type: "success",
                message: "Successfully added funds",
              };
            })
            .catch((e) => {
              this.alert = { type: "danger", message: e };
            });
        }
        this.transaction = {
          amount: 0,
          description: "",
          fundSourceId: null,
          date: Date.now(),
        };
        this.tableBusy = false;
        this.transactionModal = false;

        this.$forceUpdate();
        this.$v.$reset();
      }
    },
    addTransaction() {
      this.transactionModalTitle = "Add Funds";
      this.transactionType = "single";
      this.transaction.fundSourceId = this.selectedFundSource;

      this.transactionModal = true;
    },
    offsetDate(data) {
      return new Date(
        data.getTime() - new Date(data).getTimezoneOffset() * 60 * 1000
      ).toISOString();
    },
    transferFund() {
      this.transactionModalTitle = "Transfer Fund";
      this.transactionType = "transfer";
      this.transaction.fundSourceId = null;

      this.transaction.amount = this.fundSourceBalance.toString();
      this.transactionModal = true;
    },
    addFS() {
      if (!this.selectedCluster) {
        this.$swal({
          icon: "error",
          title: "Oops...",
          text:
            "Cannot proceed on creating new fund source. Please select a fund cluster!",
        });
        return;
      }
      this.onReset();
      this.form.fundClusterId = this.selectedCluster.id;
      this.modalTitle = "Create New Fund Source";
      this.$bvModal.show("modal-standard");
    },
    onCreate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.form.$invalid) {
        return;
      } else {
        this.form.agencyID = this.agencyID;
        if (this.form.id > 0) {
          this.$store
            .dispatch("fundsource/UpdateFundSource", this.form)
            .then((res) => {
              this.active.splice(this.indexSelected, 1, res.data);
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
          // console.log(this.form.fundClusterId);
          this.$store
            .dispatch("fundsource/CreateFundSource", this.form)
            .then((res) => {
              this.active.push(res.data);
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
        shortName: "",
        description: "",
        bankName: "",
        accountNumber: "",
        fundClusterId: null,
        address: "",
        expiry: new Date(),
        hasExpiry: false,
      };
      this.fundCluster = "";
    },
    updateItem(props) {
      this.form = cloneDeep(props);
      if (this.form.expiry) {
        this.form.expiry = new Date(this.form.expiry);
      }
      this.fundCluster = cloneDeep(props.fundCluster);
      this.indexSelected = this.tableData.indexOf(props);
      this.modalTitle = "Update Fund Source";
      this.$bvModal.show("modal-standard");
    },
    deleteItem(props) {
      // console.log(props);
      var index = this.active.indexOf(props);
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
            .dispatch("fundsource/DeleteFundSource", props.id)
            .then((res) => {
              if (res.status == 204) {
                this.active.splice(index, 1);
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
    selectFundSourceId(value) {
      this.transaction.fundSourceId = value;
    },
    async selectCluster(value) {
      this.transaction.fundSourceId = null;
      this.selectedFundSource = null;
      this.fundSourceBalance = 0;
      // this.selectedCluster = value;
      this.form.fundClusterId = value;
      this.transactionTable = [];
      if (!value) {
        // this.tableData = this.alltableData;
        this.active = [];
        this.expired = [];
        this.selectedCluster = null;
        return;
      }
      try {
        const active = await this.$store.dispatch(
          "fundsource/getActiveFundSource",
          value
        );
        this.active = active.data;
        this.allTransferOption = active.data.map((obj) => ({
          value: obj.id,
          text: `${obj.uacs} | ${obj.sourceName}`,
          cluster: obj.fundClusterId,
        }));
        const expired = await this.$store.dispatch(
          "fundsource/getExpiredFundSource",
          value
        );
        this.expired = expired.data;
        const cluster = await this.$store.dispatch(
          "fundcluster/GetSingleFundCluster",
          value
        );
        this.selectedCluster = cluster.data;
        // console.log(this.selectedCluster);
      } catch (e) {
        this.alert = {
          type: "danger",
          message:
            "Something went wrong! Cannot retrieve fund sources. Please contact your administrator",
        };
      }
      // this.$store
      //   .dispatch("fundsource/GetFundSourcePerCluster", value)
      //   .then((res) => {
      //     this.tableData = res.data;
      //   })
      //   .catch(() => {
      //     this.alert = { type: "danger", message: "Something went wrong!" };
      //   });
    },
    selectClustertoTransfer(value) {
      this.$store
        .dispatch("fundsource/getActiveFundSource", value)
        .then((response) => {
          const data = response.data.map((obj) => ({
            value: obj.id,
            text: `${obj.uacs} | ${obj.sourceName}`,
            cluster: obj.fundClusterId,
          }));
          this.transferOption = data.filter(
            (obj) => obj.value != this.selectedFundSource
          );
        })
        .catch(() => {
          this.alert = { type: "danger", message: "Something went wrong!" };
        });
    },
    viewOE(id) {
      this.$router.push(`/finance/expenditures/${id}`);
    },
    viewTransactions(data) {
      this.transferOption = [];
      this.transaction.fundSourceId = data.id;
      this.selectedFundSource = data.id;
      this.selectedFundSourceName = data.sourceName;
      this.fundSourceBalance = data.balance;
      this.isExpired = this.checkExpiry(data.expiry);

      this.$store
        .dispatch("fundsource/GetTransactionByFundSource", data.id)
        .then((res) => {
          this.transactionTable = res.data;
        })
        .catch(() => {
          this.alert = { type: "danger", message: "Something went wrong!" };
        });
      this.fsModal.title = `Transactions and Details for ${data.sourceName}`;
      this.fsModal.show = true;
    },
    toggleTableViews(str) {
      this.toggleTables = str;
    },
    printAllotment(id) {
      this.$refs.printOpt.putOptions({
        apiUrl:
          "/Finance/ObjectOfExpenditures/Print/ObjectOfExpenditure/Allotment/FundSource",
        routeVariables: [id, this.cycle],
      });
      this.$bvModal.show("print-options-modal");
    },
    printUtilization(id) {
      this.$refs.printOpt.putOptions({
        apiUrl: "/api/FundSource/Print/Utilization/Report",
        routeVariables: [id],
      });
      this.$bvModal.show("print-options-modal");
    },
    printObligations(id) {
      this.$refs.printOpt.putOptions({
        apiUrl: "/api/FundSource/Print/Obligations/Report",
        routeVariables: [this.cycle, id],
      });
      this.$bvModal.show("print-options-modal");
    },
    printDisbursement(id) {
      this.$refs.printOpt.putOptions({
        apiUrl: "/api/FundSource/Print/Disbursement/Report",
        routeVariables: [this.cycle, id],
      });
      this.$bvModal.show("print-options-modal");
    },
    printAllocation(id) {
      this.$refs.printOpt.putOptions({
        apiUrl: "/api/FundSource/Print/Object/Allocation/Report",
        routeVariables: [this.cycle, id],
      });
      this.$bvModal.show("print-options-modal");
    },
  },
};
</script>

<template>
  <Layout @changeCycle="changeCycle">
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
        <b-modal
          title-class="font-18"
          hide-footer
          v-model="transactionModal"
          :title="transactionModalTitle"
        >
          <div class="mb-3">
            <b-alert :show="modalAlert.show" :variant="modalAlert.type">{{
              modalAlert.message
            }}</b-alert>
          </div>
          <div v-if="transactionType === 'transfer'">
            <p class="mb-1">
              <span>Transfer from: </span>
              <strong class="text-success">{{ selectedFundSourceName }}</strong>
            </p>
            <p>
              <span>Amount available: </span>
              <strong class="text-success">{{
                formatCurrency(fundSourceBalance)
              }}</strong>
            </p>
            <hr />
          </div>

          <div class="mb-3">
            <div class="mb-3" v-if="transactionType === 'transfer'">
              <label for="date">Select fund cluster</label>
              <b-form-select
                :options="clusterOptionforTransfer"
                @change="selectClustertoTransfer"
                class="form-select form-select-sm"
              >
              </b-form-select>
            </div>
            <div v-if="transactionType === 'transfer'" class="mb-3">
              <label for="date">Transfer to</label>
              <b-form-select
                v-model="transaction.fundSourceId"
                :options="transferOption"
                @change="selectFundSourceId"
                placeholder="Select Fund Source..."
                class="form-select form-select-sm"
                :class="{
                  'is-invalid': submitted && $v.transaction.fundSourceId.$error,
                }"
              ></b-form-select>
              <div
                v-if="submitted && $v.transaction.fundSourceId.$error"
                class="invalid-feedback"
              >
                <span v-if="!$v.transaction.fundSourceId.required"
                  >This value is required.</span
                >
              </div>
            </div>
            <div v-if="transactionType !== 'transfer'">
              <label for="date">Transaction Date</label>
              <date-picker
                v-model="transaction.date"
                :first-day-of-week="1"
                lang="en"
                type="datetime"
                value-type="timestamp"
                format="YYYY-MM-DD hh:mm a"
                :class="{
                  'is-invalid': submitted && $v.transaction.date.$error,
                }"
              ></date-picker>
              <div
                v-if="submitted && $v.transaction.date.$error"
                class="invalid-feedback"
              >
                <span v-if="!$v.transaction.date.required">This value is required.</span>
              </div>
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
            <div
              v-if="submitted && $v.transaction.description.$error"
              class="invalid-feedback"
            >
              <span v-if="!$v.transaction.description.required"
                >This value is required.</span
              >
            </div>
          </div>
          <div class="mb-3">
            <label for="amount">Amount</label>
            <masked-input
              autocomplete="off"
              type="text"
              v-model="transaction.amount"
              placeholder="Enter Amount..."
              class="form-control"
              :class="{
                'is-invalid': submitted && $v.transaction.amount.$error,
              }"
              :mask="currencyMask"
            ></masked-input>
            <div
              v-if="submitted && $v.transaction.amount.$error"
              class="invalid-feedback"
            >
              <span v-if="!$v.transaction.amount.required">This value is required.</span>
            </div>
          </div>
          <div class="modal-footer">
            <b-button variant="primary" @click="saveTransaction"> Save </b-button>
            <b-button variant="link" @click="hideTransaction"> Close </b-button>
          </div>
        </b-modal>
        <b-modal
          id="modal-standard"
          :title="modalTitle"
          size="lg"
          title-class="font-18"
          hide-footer
        >
          <form @submit.prevent="onCreate" @reset="onReset" ref="fsForm">
            <div class="mb-4" v-if="selectedCluster">
              <p>
                <span>Adding New Fund Source for </span>
                <strong class="text-decoration-underline"
                  >{{ selectedCluster.shortName }} - {{ selectedCluster.cluster }}</strong
                >
              </p>
            </div>
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
                      'is-invalid': submitted && $v.form.sourceName.$error,
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
                  <label for="shortName">Short Name</label>
                  <b-form-input
                    id="shortName"
                    type="text"
                    v-model="form.shortName"
                    placeholder="Enter Short Name..."
                    class="form-control"
                    :class="{
                      'is-invalid': submitted && $v.form.shortName.$error,
                    }"
                  ></b-form-input>
                  <div
                    v-if="submitted && $v.form.shortName.$error"
                    class="invalid-feedback"
                  >
                    <span v-if="!$v.form.shortName.required"
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
                      'is-invalid': submitted && $v.form.description.$error,
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
                  <div v-if="submitted && $v.form.uacs.$error" class="invalid-feedback">
                    <span v-if="!$v.form.uacs.required">This value is required.</span>
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
                    <span v-if="!$v.form.bankName.required">This value is required.</span>
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
                      'is-invalid': submitted && $v.form.accountNumber.$error,
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
                    <span v-if="!$v.form.address.required">This value is required.</span>
                  </div>
                </div>
                <div class="mb-3">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="horizontalLayout-Check"
                    v-model="form.hasExpiry"
                  />&nbsp;&nbsp;
                  <label class="form-check-label mb-2" for="horizontalLayout-Check"
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
                  <div v-if="submitted && $v.form.expiry.$error" class="invalid-feedback">
                    <span v-if="!$v.form.expiry.required">This value is required.</span>
                  </div>
                </div>
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
      <div class="col-md-12">
        <b-card>
          <b-card-title>Sources</b-card-title>
          <b-card-text>
            <div class="row my-3">
              <div class="col-md-6">
                <div>
                  <label class="d-inline-flex align-items-center">
                    Cluster:
                    <b-form-select
                      :options="clusterOptions"
                      @change="selectCluster"
                      placeholder="Select cluster..."
                      class="form-select form-select-sm ms-2"
                    >
                    </b-form-select>
                  </label>
                </div>
              </div>
              <div class="col-md-6 text-end">
                <button type="button" @click="addFS()" class="btn btn-sm btn-info">
                  <i class="bx bx-plus fs-6 align-middle me-2"></i>Create New
                </button>
              </div>
            </div>

            <b-tabs content-class="mt-4">
              <b-tab>
                <template #title>
                  <i class="bx bx-calendar-check text-success"></i> Active
                </template>
                <b-alert :show="active.length == 0" variant="info"
                  >No list to be displayed. Please select fund cluster above.</b-alert
                >

                <FundSources
                  v-if="active.length > 0"
                  :tableData="active"
                  @view-transactions="viewTransactions"
                  @update-item="updateItem"
                  @delete-item="deleteItem"
                  @view-oe="viewOE"
                  @printAllotment="printAllotment"
                  @printUtilization="printUtilization"
                  @printObligations="printObligations"
                  @printDisbursement="printDisbursement"
                  @printAllocation="printAllocation"
                />
              </b-tab>
              <b-tab>
                <template #title>
                  <i class="bx bx-calendar-x text-danger"></i> Expired
                </template>
                <b-alert :show="expired.length == 0" variant="info"
                  >No list to be displayed. Please select fund cluster above.</b-alert
                >

                <FundSources
                  v-if="expired.length > 0"
                  :tableData="expired"
                  @view-transactions="viewTransactions"
                  @update-item="updateItem"
                  @delete-item="deleteItem"
                  @view-oe="viewOE"
                />
              </b-tab>
            </b-tabs>
            <!-- Expired -->
          </b-card-text>
        </b-card>
      </div>
      <!-- modal here -->
      <b-modal size="lg" v-model="fsModal.show" :title="fsModal.title" hide-footer>
        <FundSourceTransactions
          :transactionTable="transactionTable"
          :selectedFundSourceName="selectedFundSourceName"
          :fundSourceBalance="fundSourceBalance"
          :tableBusy="tableBusy"
          :selectedFundSource="selectedFundSource"
          :isExpired="isExpired"
          @addTransaction="addTransaction"
          @transferFund="transferFund"
        />
      </b-modal>
      <!-- modal here -->
    </div>
    <print-options ref="printOpt"></print-options>
  </Layout>
</template>

<style>
.style-chooser {
  width: 80%;
  font-size: 11px;
}
.simplebar-mask,
.simplebar-content-wrapper {
  overflow: hidden !important;
}

.ps {
  height: 500px;
}
</style>
