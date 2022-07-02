<script>
// import last from "lodash/last";
import { required, minValue, decimal } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import { last } from "lodash";
import MaskedInput from "vue-text-mask";
import createNumberMask from "text-mask-addons/dist/createNumberMask";

export default {
  components: {
    DatePicker,
    MaskedInput,
  },
  props: {
    transactionTable: {},
    obj: null,
    selectedFundSourceName: null,
    fundSourceBalance: null,
  },
  data() {
    return {
      fields: [
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
      currencyMask: createNumberMask({
        prefix: "",
        allowDecimal: true,
      }),
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      sortBy: "age",
      sortDesc: false,
      filter: null,
      filterOn: [],
      transaction: {
        description: null,
        date: Date.now(),
        amount: "0",
        objectOfExpenditureId: null,
      },
      revert: {
        amount: "0",
        description: null,
        objectOfExpenditureId: null,
        fundSourceId: null,
      },
      tableBusy: false,
      OEBalance: 0,
      // FSBalance: this.obj.prexc.fundSource.balance,
      transactionModal: false,
      transferModal: false,
      transferType: false,
      submitted: false,
      alert: {
        show: false,
        variant: "",
        message: "",
      },
      alertModal: {
        show: false,
        variant: "",
        message: "",
      },
    };
  },
  computed: {
    rows() {
      return this.transactionTable.length;
    },
  },
  methods: {
    formatCurrency(data) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    addTransaction() {
      this.transaction.objectOfExpenditureId = this.obj.id;
      this.transaction.description = "Add funds: ";
      this.transactionModal = true;
    },
    transferFund() {
      if (this.transactionTable.length == 0 || last(this.transactionTable).balance == 0) {
        this.alert = {
          show: true,
          variant: "danger",
          message: "No funds to revert. Make sure to add funds first.",
        };
        this.transferModal = false;
        return;
      }
      this.revert.fundSourceId = this.obj.fundSourceId;
      this.revert.objectOfExpenditureId = this.obj.id;
      this.revert.amount = last(this.transactionTable).balance.toString();
      this.revert.description = "Revert funds to: ";
      this.transferModal = true;
      // console.log(this.transaction);
    },

    hideTransactionModal() {
      this.onReset();
      this.transactionModal = false;
    },
    saveTransactions() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.transaction.$invalid) {
        return;
      } else {
        if (Number(this.getExactAmt(this.transaction.amount)) > this.fundSourceBalance) {
          this.alertModal = {
            show: true,
            variant: "danger",
            message: `Insufficient Fund Source Balance. Amount should not exceed ${this.formatCurrency(
              this.fundSourceBalance
            )}`,
          };
          return false;
        }
        this.tableBusy = true;
        const nDate = new Date(
          new Date(this.transaction.date).getTime() -
            new Date(this.transaction.date).getTimezoneOffset() * 60 * 1000
        );
        this.transaction.date = nDate.toISOString();
        let nData = JSON.parse(JSON.stringify(this.transaction));
        nData.amount = Number(this.getExactAmt(nData.amount));
        this.$store
          .dispatch("objectOfExpenditures/addFund", nData)
          .then(() => {
            // console.log(response.data);
            const newData = {
              date: this.transaction.date,
              description: this.transaction.description,
              debit: nData.amount,
              credit: 0,
              balance:
                this.transactionTable.length > 0
                  ? last(this.transactionTable).balance + nData.amount
                  : nData.amount,
            };

            this.transactionTable.push(newData);
            this.tableBusy = false;
            this.transactionModal = false;
            const newBalance = this.fundSourceBalance - nData.amount;
            this.$emit("updatedFS", {
              newBalance: newBalance,
              id: this.transaction.objectOfExpenditureId,
              amount: nData.amount,
              type: "transfer",
              prexcId: this.obj.prexc.id,
            });
            this.onReset();
            this.showToast(
              "Funds successfully added to Object of Expenditure",
              "success"
            );
            // this.alert = {
            //   show: true,
            //   variant: "success",
            //   message: "Funds successfully added to Object of Expenditure",
            // };
          })
          .catch(() => {
            this.tableBusy = false;
            this.transactionModal = false;
            this.alert = {
              show: true,
              variant: "danger",
              message:
                "Something went wrong. Cannot add funds as of the moment. Please contact your system administrator.",
            };
          });
      }
      this.submitted = false;
    },
    onReset() {
      this.$v.$reset();
      this.submitted = false;
      this.transaction = {
        type: null,
        description: null,
        date: Date.now(),
        objectOfExpenditureId: null,
      };
    },
    saveRevert() {
      if (
        Number(this.getExactAmt(this.revert.amount)) > last(this.transactionTable).balance
      ) {
        this.alert = {
          show: true,
          variant: "danger",
          message: "Cannot proceed. Amount to be reverted exceeds balance.",
        };
        this.transferModal = false;
        return;
      }
      if (Number(this.getExactAmt(this.revert.amount)) < 1) {
        this.alert = {
          show: true,
          variant: "danger",
          message: "Cannot proceed. Amount should be greater than 0.",
        };
        this.transferModal = false;
        return;
      }
      this.submitted = true;
      this.$v.revert.$touch();
      if (this.$v.revert.$invalid) {
        return;
      } else {
        let nData = JSON.parse(JSON.stringify(this.revert));
        nData.amount = Number(this.getExactAmt(nData.amount));
        this.$store
          .dispatch("objectOfExpenditures/revertFund", nData)
          .then((response) => {
            const newData = response.data;
            newData.balance = last(this.transactionTable).balance - nData.amount;
            this.transactionTable.push(newData);
            const newBalance = this.fundSourceBalance + nData.amount;
            this.$emit("updatedFS", {
              newBalance: newBalance,
              id: this.revert.objectOfExpenditureId,
              amount: nData.amount,
              type: "revert",
            });

            this.revert = {
              amount: "0",
              description: null,
              objectOfExpenditureId: null,
              fundSourceId: null,
            };
            this.transferModal = false;
            this.alert = {
              show: true,
              variant: "success",
              message: "Funds successfully reverted.",
            };
          })
          .catch(() => {
            // console.log(error);
            this.alert = {
              show: true,
              variant: "danger",
              message:
                "Something went wrong. Cannot revert funds as of the moment. Please contact your system administrator.",
            };
          });
      }
    },
    getLastBalance() {
      return this.formatCurrency(
        this.transactionTable.length > 0 ? last(this.transactionTable).balance : 0
      );
    },
  },
  validations: {
    transaction: {
      description: { required },
      date: { required },
      amount: { required },
    },
    revert: {
      amount: { required, decimal, minValue: minValue(1) },
      description: { required },
    },
  },
};
</script>

<template>
  <div>
    <div class="d-flex justify-content-between mb-3">
      <!-- <div class="mb-3"> -->
      <div class="pt-3">
        <h6>
          <span class="font-weight-light">Prexc Name: </span>
          <span class="text-info">{{ obj.prexc.prexcName }}</span>
        </h6>
        <h6>
          <span class="font-weight-light">Fund Source: </span>
          <span class="text-info">{{ obj.fundSource.sourceName }}</span>
        </h6>
        <h6>
          <span class="font-weight-light">Fund Source Balance: </span>
          <span class="text-info">{{ formatCurrency(fundSourceBalance) }}</span>
        </h6>
        <h6>
          <span class="font-weight-light">Account Name: </span>
          <span class="text-info">{{ obj.account.accountName }}</span>
        </h6>
      </div>
      <div class="text-end my-2">
        <b-dropdown variant="success" size="sm" class="float-right">
          <template slot="button-content">
            Add Transaction
            <i class="mdi mdi-chevron-down"></i>
          </template>
          <b-dropdown-item @click="addTransaction">
            <i class="bx bx-money font-size-16 align-middle me-2 text-success"></i>
            Add Funds
          </b-dropdown-item>
          <b-dropdown-item @click="transferFund">
            <i class="bx bx-transfer font-size-16 align-middle me-2 text-success"></i>
            Revert Funds</b-dropdown-item
          >
        </b-dropdown>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-12">
        <b-alert dismissible :show="alert.show" :variant="alert.variant">{{
          alert.message
        }}</b-alert>
      </div>
    </div>
    <div class="table-responsive mb-0">
      <b-table
        class="datatables"
        :items="transactionTable"
        :fields="fields"
        responsive="sm"
        :per-page="perPage"
        :current-page="currentPage"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :filter="filter"
        :filter-included-fields="filterOn"
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
        <template #cell(debit)="row">
          <span>{{ formatCurrency(row.item.debit) }}</span>
        </template>
        <template #cell(balance)="row">
          <span>{{ formatCurrency(row.item.balance) }}</span>
        </template>
        <template #cell(credit)="row">
          <span>{{ formatCurrency(row.item.credit) }}</span>
        </template>
        <template #cell(date)="row">
          <span>{{ new Date(row.item.date).toLocaleDateString("en-US") }}</span>
        </template>
      </b-table>
      <div class="row mb-3">
        <div class="col-md-12 text-end font-size-16">
          <i class="bx bx-money text-warning me-1"></i
          ><strong class="me-2">Balance: </strong>

          <span class="text-warning">{{ getLastBalance() }}</span>
        </div>
      </div>
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
    <!-- Modals -->
    <!-- transaction modal -->
    <b-modal
      v-model="transactionModal"
      id="modal-allocate"
      title="Add Funds"
      size="md"
      title-class="font-18"
      hide-footer
    >
      <div class="row">
        <div class="col-lg-12">
          <b-alert dismissible :show="alertModal.show" :variant="alertModal.variant">{{
            alertModal.message
          }}</b-alert>
        </div>
      </div>
      <!--  Trans date -->
      <div class="mb-3">
        <label for="date">Transaction Date</label>
        <date-picker
          v-model="transaction.date"
          :first-day-of-week="1"
          lang="en"
          type="date"
          value-type="timestamp"
          format="YYYY-MM-DD hh:mm a"
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
        <div
          v-if="submitted && $v.transaction.description.$error"
          class="invalid-feedback"
        >
          <span v-if="!$v.transaction.description.required">This value is required.</span>
        </div>
      </div>
      <!-- Fund allocation amount -->
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
        <div v-if="submitted && $v.transaction.amount.$error" class="invalid-feedback">
          <span v-if="!$v.transaction.amount.required">This value is required.</span>
        </div>
        <!-- <b-form-input
          v-model.number="transaction.amount"
          placeholder="Enter amount"
          :class="{
            'is-invalid': submitted && $v.transaction.amount.$error,
          }"
        >
        </b-form-input>
        <div v-if="submitted && $v.transaction.amount.$error" class="invalid-feedback">
          <span v-if="!$v.transaction.amount.required">This value is required.</span>

          <span v-if="!$v.transaction.amount.decimal">This value must be numeric.</span>
          <span v-if="!$v.transaction.amount.minValue"
            >This value must be greater than 0.</span
          >
        </div> -->
      </div>
      <!-- modal footer buttons -->
      <div class="modal-footer">
        <b-button variant="primary" @click="saveTransactions">Save </b-button>
        <b-button variant="link" @click="hideTransactionModal">Close</b-button>
      </div>
    </b-modal>
    <!-- transaction modal -->
    <!-- Transfer modal -->
    <b-modal
      v-model="transferModal"
      title="Revert Funds"
      size="md"
      title-class="font-18"
      hide-footer
    >
      <div class="row">
        <div class="col-lg-12">
          <b-alert dismissible :show="alertModal.show" :variant="alertModal.variant">{{
            alertModal.message
          }}</b-alert>
        </div>
      </div>
      <div class="mb-3">
        <p>
          <strong>Reverting Funds to: </strong
          ><span class="text-success">{{ obj.fundSource.sourceName }}</span>
        </p>
      </div>
      <div class="mb-3">
        <label for="amount">Amount</label>
        <masked-input
          autocomplete="off"
          type="text"
          v-model="revert.amount"
          placeholder="Enter Amount..."
          class="form-control"
          :class="{
            'is-invalid': submitted && $v.revert.amount.$error,
          }"
          :mask="currencyMask"
        ></masked-input>
        <div v-if="submitted && $v.revert.amount.$error" class="invalid-feedback">
          <span v-if="!$v.revert.amount.required">This value is required.</span>
        </div>
        <!-- <b-form-input
          v-model.number="revert.amount"
          placeholder="Enter amount"
          :class="{
            'is-invalid': submitted && $v.revert.amount.$error,
          }"
        >
        </b-form-input>
        <div v-if="submitted && $v.revert.amount.$error" class="invalid-feedback">
          <span v-if="!$v.revert.amount.required">This value is required.</span>

          <span v-if="!$v.revert.amount.decimal">This value must be numeric.</span>
          <span v-if="!$v.revert.amount.minValue"
            >This value must be greater than 0.</span
          >
        </div> -->
      </div>
      <div class="mb-3">
        <label for="description">Description</label>
        <b-form-input
          v-model="revert.description"
          id="description"
          placeholder="Enter description"
          class="form-control"
          autocomplete="off"
          :class="{
            'is-invalid': submitted && $v.revert.description.$error,
          }"
        >
        </b-form-input>
        <div v-if="submitted && $v.revert.description.$error" class="invalid-feedback">
          <span v-if="!$v.revert.description.required">This value is required.</span>
        </div>
      </div>
      <!-- modal footer buttons -->
      <div class="modal-footer">
        <b-button variant="primary" @click="saveRevert">Save </b-button>
        <b-button variant="link" @click="transferModal = !transferModal">Close</b-button>
      </div>
    </b-modal>
    <!-- Transfer modal -->
    <!-- Modals -->
  </div>
</template>
