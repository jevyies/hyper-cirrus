<script>
import { required } from "vuelidate/lib/validators";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";
import { cloneDeep } from "lodash";
import Supplier from "../modals/supplier.vue";
const greaterThanZero = (value) => value.replace(/,/g, "") > 0;

export default {
  props: {
    records: {},
  },
  components: {
    MaskedInput,
    Supplier,
  },
  data() {
    return {
      filter: "",
      payment: {
        id: 0,
        particulars: null,
        cycle: Number(this.$store.state.data.cycle),
        deliveryUnitBudgetItemId: null,
        amount: "0",
        supplierId: "",
        payee: "",
      },
      createModal: false,
      transactionModal: false,
      requestModal: false,
      requestModalTitle: "",
      submitted: false,
      objectOfExpenditures: [],
      payments: [],
      modalAlert: {
        show: false,
        variant: null,
        message: null,
      },
      selectedRecord: null,
      selectedPayment: null,
      previousAmount: 0,
      currencyMask: createNumberMask({
        prefix: "",
        allowDecimal: true,
      }),
      selectedBalance: 0,
    };
  },
  methods: {
    formatCurrency(data) {
      return new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("en-US");
    },
    displayPayment(record) {
      this.reset();
      this.payment.deliveryUnitBudgetItemId = record.id;
      this.selectedBalance = cloneDeep(record.available);
      this.selectedRecord = cloneDeep(record);
      this.createModal = true;
    },
    reset() {
      this.payment = {
        id: 0,
        particulars: null,
        cycle: Number(this.$store.state.data.cycle),
        deliveryUnitBudgetItemId: null,
        amount: "0",
        isPosted: false,
        supplierId: "",
        payee: "",
      };
      this.selectedPayment = null;
      this.previousAmount = 0;
    },
    edit(row) {
      this.selectedPayment = cloneDeep(row);
      this.previousAmount = cloneDeep(row.amount);
      this.payment = cloneDeep(row);
      this.payment.isPosted = row.status.toLowerCase() === "posted" ? true : false;
      this.payment.amount = row.amount.toString();
      this.selectedBalance = cloneDeep(this.selectedRecord.available) + row.amount;
      this.createModal = true;
    },
    saveTransaction(bool) {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.payment.$invalid) {
        return;
      }
      /** Check if amount exceed available payable */
      if (this.payment.amount > this.selectedBalance) {
        this.modalAlert = {
          show: true,
          variant: "danger",
          message: "Amount exceeds the amount requested",
        };
        return;
      }
      this.payment.isPosted = bool;
      const data = cloneDeep(this.payment);
      data.amount = this.getExactAmt(this.payment.amount);
      if (this.payment.id > 0) {
        this.$store
          .dispatch("rfppayment/updatePayment", {
            id: this.payment.id,
            data: data,
          })
          .then((response) => {
            this.payments.splice(
              this.payments.indexOf(this.selectedPayment),
              1,
              response.data
            );
            this.$emit("updateAvailable", {
              action: "update",
              balance: this.computedBalance,
              deliveryUnitBudgetItemId: data.deliveryUnitBudgetItemId,
              response: response.data,
              isPosted: data.isPosted,
            });
            this.$swal({
              icon: "success",
              title: "Success",
              text: "Request for payment successfully updated",
            });
          })
          .catch((e) => {
            this.$swal({
              icon: "error",
              title: "Error",
              text: "Error updating payment. Please contact your administrator",
            });
          });
      } else {
        this.$store
          .dispatch("rfppayment/createPayment", data)
          .then((response) => {
            response.data.payee = data.payee;
            response.data.datePosted = this.getDate(new Date());
            this.$emit("updateAvailable", {
              action: "add",
              balance: this.computedBalance,
              deliveryUnitBudgetItemId: data.deliveryUnitBudgetItemId,
              response: response.data,
              isPosted: data.isPosted,
            });
            this.$swal({
              icon: "success",
              title: "Success",
              text: "Request for payment successfully created",
            });
          })
          .catch((e) => {
            this.$swal({
              icon: "error",
              title: "Error",
              text: "Error creating payment. Please contact your administrator",
            });
          });
      }

      this.createModal = false;
      this.$v.$reset();
    },
    displayPaymentRecords(record) {
      if (record) {
        this.selectedRecord = record;
        this.requestModalTitle = `Requested Payment for ${record.objectOfExpenditure.account.accountName}`;
        this.$store
          .dispatch("rfppayment/getAllPaymentsByExpenditure", {
            id: record.id,
            cycle: this.$store.getters["data/getCycle"],
          })
          .then((response) => {
            this.payments = response.data;
            this.requestModal = true;
          })
          .catch((e) => {
            this.$swal({
              icon: "error",
              title: "Error",
              text: "Error fetching payment records. Please contact your administrator",
            });
          });
      }
    },
    hideCreateModal() {
      this.submitted = false;
      this.objectOfExpenditures = [];
      this.createModal = false;
    },
    deletePayment(record) {
      this.selectedPayment = cloneDeep(record);
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
            .dispatch("rfppayment/deletePayment", this.selectedPayment.id)
            .then(() => {
              this.payments.splice(this.payments.indexOf(this.selectedPayment), 1);
              this.$emit("updateAvailable", {
                action: "delete",
                data: this.selectedPayment,
              });
              this.$swal({
                icon: "success",
                title: "Success",
                text: "Request for payment successfully deleted",
              });
            })
            .catch(() => {
              this.$swal({
                icon: "error",
                title: "Error",
                text: "Error deleting payment. Please contact your administrator",
              });
            });
        }
      });
    },
    dropSupplier(supplier) {
      this.payment.supplierId = supplier.id;
      this.payment.payee = supplier.name;
    },
  },
  validations: {
    payment: {
      amount: { required, greaterThanZero },
      supplierId: { required },
      payee: { required },
    },
  },
  computed: {
    computedBalance() {
      return (
        parseFloat(this.selectedBalance) -
        parseFloat(this.getExactAmt(this.payment.amount))
      );
    },
    filteredAvailable() {
      let data = this.records;
      // var total = this.currentPageItem * this.perPageItem;
      if (this.filter.trim() != "" && this.filter) {
        data = data.filter((item) => {
          return item.searchItem.toUpperCase().includes(this.filter.toUpperCase());
        });
      }
      // data = data.slice(total - this.perPageItem, total);
      return data;
    },
  },
};
</script>

<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <label class="d-inline-flex align-items-center">
          Search:
          <b-form-input
            autocomplete="off"
            v-model="filter"
            type="search"
            placeholder="Search..."
            class="form-control form-control-sm ms-2"
          ></b-form-input>
        </label>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-md-4" v-for="record in filteredAvailable" :key="record.id">
        <b-card>
          <b-card-text>
            <div class="row">
              <div class="col-lg-8">
                <a
                  href="javascript:void(0)"
                  class="d-block text-primary text-decoration-underline text-truncate font-size-15"
                  @click="displayPaymentRecords(record)"
                >
                  {{ record.objectOfExpenditure.account.accountName }}
                </a>
                <p class="text-truncate mb-1">
                  <strong>Classification: </strong>
                  {{
                    record.objectOfExpenditure.account.accountGroup.fundClassification
                      .shortName
                  }}
                </p>
                <div class="mb-3 mb-lg-4">
                  <span class="badge badge-soft-success font-size-12">
                    {{ record.objectOfExpenditure.fundSource.sourceName }}
                  </span>
                </div>
                <ul class="list-inline mb-0">
                  <li class="list-inline-item me-4">
                    <small>Total: </small>
                    <h5 class="font-size-14">
                      <i class="bx bx-money me-1 text-info"></i>
                      {{ formatCurrency(record.allocated) }}
                    </h5>
                  </li>
                  <li class="list-inline-item">
                    <small>Available: </small>
                    <h5 class="font-size-14">
                      <i class="bx bx-money me-1 text-info"></i>
                      <span class="text-warning">{{
                        formatCurrency(record.available)
                      }}</span>
                    </h5>
                  </li>
                </ul>
              </div>
              <div class="col-lg-4">
                <div class="mt-2 lg-text-end md-text-start">
                  <b-button
                    variant="info"
                    size="sm"
                    class="btn-block"
                    @click="displayPayment(record)"
                  >
                    <i class="mdi mdi-table-arrow-right me-1"></i>
                    Request
                  </b-button>
                  <!-- <b-button size="sm" class="btn-block mt-2">
                    <i class="mdi mdi-view-list me-1"></i> Transactions
                  </b-button> -->
                </div>
              </div>
            </div>
          </b-card-text>
        </b-card>
      </div>
      <b-modal
        :title="
          payment.id > 0 ? 'Edit Request for Payment' : 'Create Request for Payment'
        "
        v-model="createModal"
        hide-footer
      >
        <div class="mb-3">
          <b-alert
            :show="modalAlert.show"
            :variant="modalAlert.variant"
            @dismissed="modalAlert.show = false"
            dismissible
            >{{ modalAlert.message }}</b-alert
          >
        </div>
        <div v-if="selectedRecord">
          <div class="mb-0">
            <p class="mb-0">
              <strong>Object of Expenditure: </strong>
              <span class="text-warning">{{
                selectedRecord.objectOfExpenditure.account.accountName
              }}</span>
            </p>
          </div>
          <div>
            <p>
              <strong>Balance: </strong>
              <span class="text-warning">{{ formatCurrency(computedBalance) }}</span>
            </p>
          </div>
        </div>
        <div class="mb-3">
          <label for="outcome">Amount </label>
          <masked-input
            autocomplete="off"
            type="text"
            v-model="payment.amount"
            placeholder="Enter Amount..."
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.payment.amount.$error,
            }"
            :mask="currencyMask"
          ></masked-input>
          <div v-if="submitted && $v.payment.amount.$error" class="invalid-feedback">
            <span v-if="!$v.payment.amount.required">This value is required. </span>
            <span v-if="!$v.payment.amount.greaterThanZero"
              >This value must be greater than zero.</span
            >
          </div>
        </div>
        <div class="mb-3">
          <label for="outcome">Supplier </label>
          <b-input-group>
            <template #append>
              <b-button @click="$bvModal.show('supplier-modal')" variant="outline-info"
                ><i class="mdi mdi-clipboard-text-search-outline"></i
              ></b-button>
            </template>
            <input
              autocomplete="off"
              type="text"
              placeholder="Search Supplier..."
              class="form-control"
              :class="{
                'is-invalid': $v.payment.payee.$error,
              }"
              v-model="payment.payee"
              :disabled="payment.supplierId === ''"
            />
          </b-input-group>
          <div v-if="submitted && $v.payment.supplierId.$error" class="invalid-feedback">
            <span v-if="!$v.payment.supplierId.required"
              >Must select from supplier list.
            </span>
          </div>
          <div v-if="submitted && $v.payment.payee.$error" class="invalid-feedback">
            <span v-if="!$v.payment.payee.required">This value is required. </span>
          </div>
        </div>
        <div class="mb-3">
          <label for="outcome">Particulars </label>
          <input
            autocomplete="off"
            type="text"
            v-model.number="payment.particulars"
            placeholder="Enter Particulars..."
            class="form-control"
          />
        </div>
        <div class="modal-footer">
          <b-button
            variant="success"
            v-if="payment.id == 0"
            @click="saveTransaction(true)"
            >Save and Post</b-button
          >
          <b-button variant="primary" @click="saveTransaction(false)">{{
            payment.id > 0 ? "Update" : "Save"
          }}</b-button>
          <b-button variant="link" @click="hideCreateModal">Close</b-button>
        </div>
      </b-modal>
      <!-- Create Request Modal -->

      <!-- Tarnsactions Modal -->
      <b-modal :title="requestModalTitle" v-model="requestModal" size="lg" hide-footer>
        <b-card>
          <b-card-text>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>RFP Number</th>
                    <th>RFP Date</th>
                    <th>Supplier</th>
                    <th>Amount</th>
                    <th>Particulars</th>
                    <th>Status</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in payments" :key="payment.id">
                    <td>{{ payment.rfpNumber }}</td>
                    <td>{{ formatDate(payment.rfpDate) }}</td>
                    <td>
                      <p class="mb-0">
                        <strong>{{ payment.payee }}</strong>
                      </p>
                    </td>
                    <td>
                      {{ formatCurrency(payment.amount) }}
                    </td>
                    <td>{{ payment.particulars }}</td>
                    <td
                      :class="[
                        payment.status.toLowerCase() === 'posted'
                          ? 'text-success'
                          : 'text-warning',
                      ]"
                    >
                      <p class="mb-0">{{ payment.status }}</p>
                      <small v-if="payment.status.toLowerCase() === 'posted'"
                        >Date posted: {{ formatDate(payment.datePosted) }}</small
                      >
                    </td>
                    <td class="text-center">
                      <b-dropdown
                        variant="success"
                        size="sm"
                        class="mt-0"
                        v-if="payment.status.toLowerCase() !== 'posted'"
                      >
                        <template slot="button-content">
                          <i class="mdi mdi-chevron-down"></i>
                        </template>
                        <b-dropdown-item @click="edit(payment)">
                          <i
                            class="bx bx-pencil font-size-16 align-middle me-2 text-warning"
                          ></i>
                          Edit</b-dropdown-item
                        >
                        <b-dropdown-item
                          class="text-danger"
                          @click="deletePayment(payment)"
                          ><i
                            class="bx bx-trash font-size-16 align-middle me-2 text-danger"
                          ></i>
                          Delete</b-dropdown-item
                        >
                        <b-dropdown-item v-if="payment.status.toLowerCase() === 'posted'"
                          ><i
                            class="bx bx-check font-size-16 text-success align-middle me-2"
                          ></i
                          >Post</b-dropdown-item
                        >
                      </b-dropdown>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </b-card-text>
        </b-card>
      </b-modal>
      <supplier @dropData="dropSupplier($event)"></supplier>
      <!-- Tarnsactions Modal -->
      <!-- Modals -->
    </div>
    <!-- Modals -->
    <!-- Create Request Modal -->
    <b-modal
      :title="payment.id > 0 ? 'Edit Request for Payment' : 'Create Request for Payment'"
      v-model="createModal"
      hide-footer
    >
      <div class="mb-3">
        <b-alert
          :show="modalAlert.show"
          :variant="modalAlert.variant"
          @dismissed="modalAlert.show = false"
          dismissible
          >{{ modalAlert.message }}</b-alert
        >
      </div>
      <div v-if="selectedRecord">
        <div class="mb-0">
          <p class="mb-0">
            <strong>Object of Expenditure: </strong>
            <span class="text-warning">{{
              selectedRecord.objectOfExpenditure.account.accountName
            }}</span>
          </p>
        </div>
        <div>
          <p>
            <strong>Balance: </strong>
            <span class="text-warning">{{ formatCurrency(computedBalance) }}</span>
          </p>
        </div>
      </div>
      <div class="mb-3">
        <label for="outcome">Amount </label>
        <masked-input
          autocomplete="off"
          type="text"
          v-model="payment.amount"
          placeholder="Enter Amount..."
          class="form-control"
          :class="{
            'is-invalid': submitted && $v.payment.amount.$error,
          }"
          :mask="currencyMask"
        ></masked-input>
        <div v-if="submitted && $v.payment.amount.$error" class="invalid-feedback">
          <span v-if="!$v.payment.amount.required">This value is required. </span>
          <span v-if="!$v.payment.amount.greaterThanZero"
            >This value must be greater than zero.</span
          >
        </div>
      </div>
      <div class="mb-3">
        <label for="outcome">Supplier </label>
        <b-input-group>
          <template #append>
            <b-button @click="$bvModal.show('supplier-modal')" variant="outline-info"
              ><i class="mdi mdi-clipboard-text-search-outline"></i
            ></b-button>
          </template>
          <input
            autocomplete="off"
            type="text"
            placeholder="Search Supplier..."
            class="form-control"
            :class="{
              'is-invalid': $v.payment.payee.$error,
            }"
            v-model="payment.payee"
            :disabled="payment.supplierId === ''"
          />
        </b-input-group>
        <div v-if="submitted && $v.payment.supplierId.$error" class="invalid-feedback">
          <span v-if="!$v.payment.supplierId.required"
            >Must select from supplier list.
          </span>
        </div>
        <div v-if="submitted && $v.payment.payee.$error" class="invalid-feedback">
          <span v-if="!$v.payment.payee.required">This value is required. </span>
        </div>
      </div>
      <div class="mb-3">
        <label for="outcome">Remarks </label>
        <input
          autocomplete="off"
          type="text"
          v-model.number="payment.particulars"
          placeholder="Enter Particulars..."
          class="form-control"
        />
      </div>
      <!-- <div class="form-check form-check-primary mb-3" v-if="payment.id == 0">
        <input
          class="form-check-input"
          type="checkbox"
          id="formCheckcolor1"
          v-model="payment.isPosted"
        />
        <label class="form-check-label" for="formCheckcolor1">
          Mark as posted upon saving
        </label>
      </div> -->
      <div class="modal-footer">
        <b-button variant="primary" @click="saveTransaction(true)" v-if="payment.id == 0">{{
          "Save and Post"
        }}</b-button>
        <b-button variant="primary" @click="saveTransaction(false)">{{
          payment.id > 0 ? "Update" : "Save"
        }}</b-button>
        <b-button variant="link" @click="hideCreateModal">Close</b-button>
      </div>
    </b-modal>
    <!-- Create Request Modal -->

    <!-- Tarnsactions Modal -->
    <b-modal :title="requestModalTitle" v-model="requestModal" size="lg" hide-footer>
      <b-card>
        <b-card-text>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>RFP Number</th>
                  <th>RFP Date</th>
                  <th>Supplier</th>
                  <th>Amount</th>
                  <th>Particulars</th>
                  <th>Status</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in payments" :key="payment.id">
                  <td>{{ payment.rfpNumber }}</td>
                  <td>{{ formatDate(payment.rfpDate) }}</td>
                  <td>
                    <p class="mb-0">
                      <strong>{{ payment.payee }}</strong>
                    </p>
                  </td>
                  <td>
                    {{ formatCurrency(payment.amount) }}
                  </td>
                  <td>{{ payment.particulars }}</td>
                  <td
                    :class="[
                      payment.status.toLowerCase() === 'posted'
                        ? 'text-success'
                        : 'text-warning',
                    ]"
                  >
                    <p class="mb-0">{{ payment.status }}</p>
                    <small v-if="payment.status.toLowerCase() === 'posted'"
                      >Date posted: {{ formatDate(payment.datePosted) }}</small
                    >
                  </td>
                  <td class="text-center">
                    <b-dropdown
                      variant="success"
                      size="sm"
                      class="mt-0"
                      v-if="payment.status.toLowerCase() !== 'posted'"
                    >
                      <template slot="button-content">
                        <i class="mdi mdi-chevron-down"></i>
                      </template>
                      <b-dropdown-item @click="edit(payment)">
                        <i
                          class="bx bx-pencil font-size-16 align-middle me-2 text-warning"
                        ></i>
                        Edit</b-dropdown-item
                      >
                      <b-dropdown-item class="text-danger" @click="deletePayment(payment)"
                        ><i
                          class="bx bx-trash font-size-16 align-middle me-2 text-danger"
                        ></i>
                        Delete</b-dropdown-item
                      >
                      <b-dropdown-item v-if="payment.status.toLowerCase() === 'posted'"
                        ><i
                          class="bx bx-check font-size-16 text-success align-middle me-2"
                        ></i
                        >Post</b-dropdown-item
                      >
                    </b-dropdown>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </b-card-text>
      </b-card>
    </b-modal>
    <supplier @dropData="dropSupplier($event)"></supplier>
    <!-- Tarnsactions Modal -->
    <!-- Modals -->
  </div>
</template>
