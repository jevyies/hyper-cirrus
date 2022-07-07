<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import DisbursementTable from "@/components/tables/disbursement-table";
// import { required } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import Multiselect from "vue-multiselect";
import AvailableBURS from "@/components/tables/available-burs";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";
import PrintOptions from "@/components/modals/print-options.vue";

export default {
  page: {
    title: "Disbursement",
  },
  components: {
    Layout,
    PageHeader,
    DisbursementTable,
    DatePicker,
    Multiselect,
    AvailableBURS,
    MaskedInput,
    PrintOptions,
  },
  data() {
    return {
      title: "Disbursement",
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Disbursement",
          active: true,
        },
      ],
      cycle: Number(this.$store.getters["data/getCycle"]),
      posted: [],
      pendings: [],
      approved: [],
      accounts: [],
      available: [],
      availablePayment: [],
      availablePO: [],
      selectedAccounts: [],
      disbursement: {
        id: 0,
        bursId: null,
        computations: null,
        particulars: null,
        amount: "0",
        jevNumber: null,
        modeOfPayment: null,
        checkNumber: null,
        checkDate: Date.now(),
        bank: null,
        accountNumber: null,
        disbursementItems: [],
      },

      burs: [],
      bursOptions: [],
      selectedBurs: null,
      disbursementModal: {
        show: false,
        title: "",
      },
      modeOfPayment: [
        { value: null, text: "Select mode of payment", disabled: true },
        { value: "Cash", text: "Cash" },
        { value: "MDS", text: "MDS Check" },
        { value: "Commercial", text: "Commercial Check" },
        { value: "ADA", text: "ADA" },
        { value: "Others", text: "Others" },
      ],
      submitted: false,
      currencyMask: createNumberMask({
        prefix: "",
        allowDecimal: true,
      }),
      total: "0",
      temp: "0",
      tempAmount: "0",
      totalTemp: "0",
      balance: 0,
      bursBalance: 0,
      postDateModal: false,
      postData: {
        postDate: Date.now(),
        data: 0,
      },
    };
  },
  methods: {
    changeCycle(cycle) {
      this.cycle = cycle;
      this.disbursement.cycle = Number(cycle);
      this.fetchPosted();
      // this.fetchApproved();
      this.fetchPending();
      // this.fetchBurs();
      this.fetchAvailable();
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
    checkTotal(event) {
      if (Number(this.getExactAmt(event.target.value)) > this.selectedBurs.balance) {
        this.disbursement.amount = "0";
        this.showToast(
          "Total amount exceeds on allowable amount to be disbursed",
          "error"
        );
        event.preventDefault();
        return false;
      }
      this.balance = Number(this.getExactAmt(event.target.value));
    },
    loopDisbursementAccounts() {
      let val = 0;
      for (let x = 0; x < this.disbursement.disbursementItems.length; x++) {
        val += Number(this.getExactAmt(this.disbursement.disbursementItems[x].amount));
      }
      return val;
    },
    calculateTotal(event, item, index) {
      this.total = 0;
      const before = this.loopDisbursementAccounts();
      if (before > Number(this.getExactAmt(this.disbursement.amount))) {
        this.disbursement.disbursementItems[index].amount = "0";
        let after = this.loopDisbursementAccounts();
        this.total = after.toString();
        this.balance = Number(this.getExactAmt(this.disbursement.amount)) - after;
        this.showToast(
          "Total amount exceeds on allowable amount to be disbursed",
          "error"
        );
        event.preventDefault();
        return false;
      }
      this.total = before.toString();
      this.balance = Number(this.getExactAmt(this.disbursement.amount)) - before;
    },
    /** create burs */
    createDisbursement(record) {
      this.disbursementModal.title = "Create Disbursement";
      this.disbursementModal.show = true;
      this.disbursement.id = 0;
      this.disbursement.bursId = null;
      this.disbursement.disbursementItems = [];
      this.disbursement.particulars = record.record.particulars;
      this.selectBurs(record);
    },
    selectBurs(record) {
      if (record.type === "payment") {
        this.selectedBurs = this.availablePayment.find(
          (rfp) => rfp.id == record.record.id
        );
        this.disbursement.bursId = record.record.id;
      }

      if (record.type === "po") {
        this.selectedBurs = this.availablePO.find((rfp) => rfp.id == record.record.id);
        this.disbursement.bursId = record.record.id;
      }
    },
    formatCurrency(data) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    onReset() {
      this.disbursement.id = 0;
      this.disbursement.bursId = 0;
      this.disbursement.jevNumber = null;
      this.disbursement.modeOfPayment = null;
      this.disbursement.checkNumber = null;
      this.disbursement.checkDate = Date.now();
      this.disbursement.disbursementItems = [];
      this.disbursement.bank = null;
      this.disbursement.amount = "0";
      this.submitted = false;
      this.$v.$reset();
    },
    editDisbursement(record) {
      this.selectedBurs = this.burs.find((burs) => burs.id == record.bursId);
      this.disbursement = record;
      this.disbursement.checkDate = Date.parse(record.checkDate);
      this.disbursementModal.title = "Edit Disbursement";
      this.disbursementModal.show = true;
    },
    removeDisbursement(record) {
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
            .dispatch("disbursement/deleteDisbursement", record.id)
            .then(() => {
              this.pendings.splice(this.pendings.indexOf(record), 1);
              this.$swal({
                title: "Deleted!",
                text: "Disbursement has been deleted.",
                icon: "success",
              });
            })
            .catch(() => {
              this.$swal({
                title: "Error!",
                text:
                  "Something went wrong. Cannot remove Disbursement. Please contact your administrator",
                icon: "error",
              });
            });
        }
      });
    },

    saveDisbursement() {
      if (Number(this.getExactAmt(this.disbursement.amount)) > this.balance) {
        this.showToast(
          "Total amount exceeds on allowable amount to be disbursed",
          "error"
        );
        return;
      }
      if (!this.disbursement.bursId) {
        this.$swal({
          title: "Error",
          text: "Cannot proceed. Please select BURS",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
      // this.$v.disbursement.$touch();
      // this.submitted = true;
      // if (this.$v.disbursement.$invalid) {
      //   return;
      // } else {
      const nDate = new Date(
        new Date(this.disbursement.checkDate).getTime() -
          new Date(this.disbursement.checkDate).getTimezoneOffset() * 60 * 1000
      );
      this.disbursement.checkDate = nDate.toISOString();
      const disbursement = JSON.parse(JSON.stringify(this.disbursement));
      disbursement.disbursementItems = disbursement.disbursementItems.map((item) => ({
        disbursementId: 0,
        accountId: item.accountId,
        amount: Number(this.getExactAmt(item.amount)),
      }));
      disbursement.amount = Number(this.getExactAmt(this.disbursement.amount));
      if (this.disbursement.id > 0) {
        /** Update */
        this.$store
          .dispatch("disbursement/updateDisbursement", {
            id: this.disbursement.id,
            data: disbursement,
          })
          .then((response) => {
            if (response.data.error) {
              this.$swal({
                title: "Error!",
                text: response.data.message,
                icon: "error",
              });
              return;
            }
            this.$swal({
              title: "Success",
              text: "Disbursement Successfully Updated",
              icon: "success",
              confirmButtonText: "OK",
            });
            this.fetchAvailable();
            this.fetchPending();
            this.onReset();
            this.disbursementModal.show = false;
          })
          .catch(() => {
            this.disbursementModal.show = false;
            this.$swal({
              title: "Error",
              text:
                "Something went wrong. Cannot update Disbursement. Please contact your administrator",
              icon: "error",
              confirmButtonText: "OK",
            });
          });
      } else {
        /** Create **/
        this.$store
          .dispatch("disbursement/createDisbursement", disbursement)
          .then((response) => {
            if (response.data.error) {
              this.$swal({
                title: "Error",
                text: response.data.errorMessage,
                icon: "error",
                confirmButtonText: "OK",
              });
            }
            this.$swal({
              title: "Success",
              text: "Disbursement has been created",
              icon: "success",
              confirmButtonText: "OK",
            });
            this.fetchAvailable();
            this.fetchPending();
            this.onReset();
            this.disbursementModal.show = false;
          })
          .catch(() => {
            this.disbursementModal.show = false;
            this.$swal({
              title: "Error!",
              text:
                "Something went wrong. Cannot create Disbursement. Please contact your administrator",
              icon: "error",
            });
          });
      }
      // }
    },

    postDisbursement(record) {
      this.$swal({
        title: "Are you sure?",
        text:
          "You are going to post this disbursement. You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        confirmButtonText: "Yes, post it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.postData.data = record;
          this.postDateModal = true;
          // this.$store
          //   .dispatch("disbursement/postDisbursement", record.id)
          //   .then(() => {
          //     this.pendings.splice(this.pendings.indexOf(record), 1);
          //     this.fetchPosted();
          //     this.$swal({
          //       title: "Posted!",
          //       text: "Disbursement has been posted.",
          //       icon: "success",
          //     });
          //   })
          //   .catch(() => {
          //     this.$swal({
          //       title: "Error!",
          //       text:
          //         "Something went wrong. Cannot post Disbursement. Please contact your administrator",
          //       icon: "error",
          //     });
          //   });
        }
      });
    },
    confirmPost() {
      if (!this.postData.postDate) {
        this.showToast("Please select post date", "error");
        return;
      }
      const nDate = new Date(
        new Date(this.postData.postDate).getTime() -
          new Date(this.postData.postDate).getTimezoneOffset() * 60 * 1000
      );
      this.$store
        .dispatch("disbursement/postDisbursement", {
          id: this.postData.data.id,
          dateApproved: nDate.toISOString(),
        })
        .then(() => {
          this.pendings.splice(this.pendings.indexOf(this.postData.data), 1);
          this.fetchPosted();
          this.postData = {
            data: null,
            postDate: Date.now(),
          };
          this.postDateModal = false;
          this.$swal({
            title: "Posted!",
            text: "Disbursement has been posted.",
            icon: "success",
          });
        })
        .catch(() => {
          this.postDateModal = false;
          this.$swal({
            title: "Error!",
            text:
              "Something went wrong. Cannot post Disbursement. Please contact your administrator",
            icon: "error",
          });
        });
    },
    approveDisbursement(record) {
      this.$swal({
        title: "Are you sure?",
        text:
          "You are going to approve this disbursement. You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        confirmButtonText: "Approve it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("disbursement/approveDisbursement", record.id)
            .then(() => {
              this.posted.splice(this.posted.indexOf(record), 1);
              this.fetchApproved();
              this.$swal({
                title: "Approved!",
                text: "Disbursement has been approved.",
                icon: "success",
              });
            })
            .catch(() => {
              this.$swal({
                title: "Error!",
                text:
                  "Something went wrong. Cannot approve disbursement. Please contact your administrator",
                icon: "error",
              });
            });
        }
      });
    },
    returnDisbursement(record) {
      this.$swal({
        title: "Are you sure?",
        text: "You are going to return a disbursement. Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f1b44c",
        confirmButtonText: "Return it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("disbursement/returnDisbursement", record.id)
            .then(() => {
              this.posted.splice(this.posted.indexOf(record), 1);
              this.fetchPending();
              this.$swal({
                title: "Returned!",
                text: "Disbursement has been returned to Pending.",
                icon: "success",
              });
            })
            .catch(() => {
              this.$swal({
                title: "Error!",
                text:
                  "Something went wrong. Cannot return Disbursement. Please contact your administrator",
                icon: "error",
              });
            });
        }
      });
    },
    fetchPosted() {
      this.$store
        .dispatch("disbursement/getPostedDisbursements", this.cycle)
        .then((response) => {
          this.posted = response.data;
          this.posted = this.posted.map((item) => ({
            ...item,
            viewUpload: false,
            attachments: [],
            rotateChevy: false,
            showDetails: false,
          }));
        })
        .catch(() => {
          this.$swal({
            icon: "error",
            text: "Cannot fetch posted disbursements. Please contact your administrator",
          });
        });
    },
    fetchApproved() {
      this.$store
        .dispatch("disbursement/getApprovedDisbursements", this.cycle)
        .then((response) => {
          this.approved = response.data.map((item) => ({
            ...item,
            viewUpload: false,
            attachments: [],
            rotateChevy: false,
            showDetails: false,
          }));
        })
        .catch(() => {
          this.$swal({
            icon: "error",
            text:
              "Cannot fetch approved disbursements. Please contact your administrator",
          });
        });
    },
    fetchPending() {
      this.$store
        .dispatch("disbursement/getPendingDisbursements", this.cycle)
        .then((response) => {
          this.pendings = response.data;
          this.pendings = this.pendings.map((item) => ({
            ...item,
            viewUpload: false,
            attachments: [],
            rotateChevy: false,
            showDetails: false,
          }));
        })
        .catch(() => {
          this.$swal({
            icon: "error",
            text: "Cannot fetch pending disbursements. Please contact your administrator",
          });
        });
    },
    fetchBurs() {
      this.$store
        .dispatch("burs/getPostedBurs", this.cycle)
        .then((response) => {
          this.burs = JSON.parse(JSON.stringify(response.data));
          this.bursOptions = response.data.map((item) => ({
            value: item.id,
            text: `${item.serialNumber}`,
            supplier: item.rfp.rfpPaymentItem.rfp.supplier.name,
          }));
          this.bursOptions.unshift({
            value: null,
            text: "Select BURS...",
          });
        })
        .catch(() => {
          this.$swal({
            icon: "error",
            text: "Cannot fetch posted RFP. Please contact your administrator",
          });
        });
    },
    fetchAccounts() {
      this.$store
        .dispatch("accounts/getAccountsForDisbursement")
        .then((response) => {
          this.accounts = response.data.map((item) => ({
            value: item.id,
            uacs: item.uacs,
            accountName: item.accountName,
          }));
        })
        .catch(() => {
          this.$swal({
            icon: "error",
            text: "Cannot fetch accounts. Please contact your administrator",
          });
        });
    },
    fetchAvailable() {
      this.$store
        .dispatch("disbursement/getAvailableBurs", this.cycle)
        .then((response) => {
          this.available = response.data.map((item) => ({
            ...item,
            rotateChevy: false,
            showDetails: false,
          }));
          this.availablePayment = this.available.filter(
            (item) => item.rfp.type.toLowerCase() === "payment"
          );
          this.availablePO = this.available.filter(
            (item) => item.rfp.type.toLowerCase() === "po"
          );
        })
        .catch(() => {
          this.$swal({
            icon: "error",
            text:
              "Cannot fetch available disbursements. Please contact your administrator",
          });
        });
    },
    addTag(items) {
      this.selectedAccounts.push(items);
    },
    addSelectedAccounts() {
      /** Remove added items in this.accounts */
      const items = this.selectedAccounts.map((item) => ({
        disbursementId: 0,
        accountId: item.value,
        amount: "0",
        account: {
          uacs: item.uacs,
          accountName: item.accountName,
        },
      }));
      this.disbursement.disbursementItems.push(...items);
      this.selectedAccounts = [];
    },
    deleteItem(item) {
      this.$swal({
        title: "Are you sure?",
        text: "You are going to remove this item. Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f1b44c",
        confirmButtonText: "Remove it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.disbursement.disbursementItems.splice(
            this.disbursement.disbursementItems.indexOf(item),
            1
          );
          const newValue = this.loopDisbursementAccounts();
          this.total = newValue.toString();
          this.balance = Number(this.getExactAmt(this.disbursement.amount)) - newValue;
        }
      });
      // this.disbursement.disbursementItems.splice(
      //   this.disbursement.disbursementItems.indexOf(item),
      //   1
      // );
    },
    customLabel({ uacs, accountName }) {
      return `${uacs} - ${accountName}`;
    },
    async printDisbursement(id) {
      this.$refs.printOpt.putOptions({
        apiUrl: "/Finance/Disbursement/Print",
        routeVariables: [id],
      });
      this.$bvModal.show("print-options-modal");
    },
    pushAttachments(record) {
      if (record.type === "pending") {
        /** push record.attachments to this.pendings */
        this.pendings.find((item) => item.id === record.id).attachments = [];
        this.pendings
          .find((item) => item.id === record.id)
          .attachments.push(...record.attachments);
      }
      if (record.type === "posted") {
        /** push record.attachments to this.posted */
        this.posted.find((item) => item.id === record.id).attachments = [];
        this.posted
          .find((item) => item.id === record.id)
          .attachments.push(...record.attachments);
      }
    },
    handleUpload(record) {
      if (record.type === "pending") {
        /** push record.attachments to this.pendings */
        this.pendings
          .find((item) => item.id === record.id)
          .attachments.push(record.response);
      }
      if (record.type === "posted") {
        /** push record.attachments to this.posted */
        this.posted
          .find((item) => item.id === record.id)
          .attachments.push(record.response);
      }
    },
  },
  created() {
    this.fetchPosted();
    // this.fetchApproved();
    this.fetchPending();
    // this.fetchBurs();
    this.fetchAccounts();
    this.fetchAvailable();
  },
  validations: {},
};
</script>
<template>
  <Layout @changeCycle="changeCycle">
    <PageHeader :title="title" :items="items" />
    <b-tabs content-class="pt-3 pb-3 text-muted" class="mt-4">
      <b-tab>
        <template v-slot:title>
          <span class="d-inline-block d-sm-none">
            <i class="bx bx-home"></i>
          </span>
          <span class="d-none d-sm-inline-block">Available</span>
        </template>
        <b-tabs pills vertical content-class="text-muted ms-4" class="mt-3">
          <b-tab>
            <template v-slot:title>
              <span class="d-inline-block d-sm-none">
                <i class="bx bx-home"></i>
              </span>
              <span class="d-none d-sm-inline-block">Payment</span>
            </template>
            <AvailableBURS
              :records="availablePayment"
              type="payment"
              @create="createDisbursement"
            />
          </b-tab>
          <b-tab>
            <template v-slot:title>
              <span class="d-inline-block d-sm-none">
                <i class="bx bx-home"></i>
              </span>
              <span class="d-none d-sm-inline-block">Purchase Orders</span>
            </template>
            <AvailableBURS
              :records="availablePO"
              type="po"
              @create="createDisbursement"
            />
          </b-tab>
        </b-tabs>
      </b-tab>
      <b-tab>
        <template v-slot:title>
          <span class="d-inline-block d-sm-none">
            <i class="bx bx-home"></i>
          </span>
          <span class="d-none d-sm-inline-block">Pending</span>
        </template>
        <DisbursementTable
          :records="pendings"
          type="pending"
          @update="editDisbursement"
          @remove="removeDisbursement"
          @post="postDisbursement"
          @printDisbursement="printDisbursement"
          @pushAttachments="pushAttachments"
          @handleUpload="handleUpload"
        />
      </b-tab>
      <b-tab>
        <template v-slot:title>
          <span class="d-inline-block d-sm-none">
            <i class="bx bx-home"></i>
          </span>
          <span class="d-none d-sm-inline-block">Posted</span>
        </template>
        <DisbursementTable
          :records="posted"
          @approve="approveDisbursement"
          @return="returnDisbursement"
          @printDisbursement="printDisbursement"
          type="posted"
          @pushAttachments="pushAttachments"
          @handleUpload="handleUpload"
        />
      </b-tab>
      <!-- <b-tab>
        <template v-slot:title>
          <span class="d-inline-block d-sm-none">
            <i class="bx bx-home"></i>
          </span>
          <span class="d-none d-sm-inline-block">Approved</span>
        </template>
        <DisbursementTable
          :records="approved"
          type="approved"
          @printDisbursement="printDisbursement"
        />
      </b-tab> -->
    </b-tabs>

    <!-- Modals -->
    <b-modal
      v-model="disbursementModal.show"
      :title="disbursementModal.title"
      size="lg"
      hide-footer
      scrollable
    >
      <!-- <div class="mb-3" v-if="disbursement.id === 0">
        <label>Select Approved BURS</label>
        <multiselect
          deselect-label="Can't remove this value"
          track-by="value"
          label="text"
          placeholder="Select one"
          :options="bursOptions"
          :searchable="true"
          :allow-empty="false"
          @input="selectBurs"
        >
          <template slot="singleLabel" slot-scope="{ option }"
            ><strong>{{ option.text }}</strong> for
            <strong> {{ option.supplier }}</strong></template
          >
        </multiselect>
      </div> -->
      <div class="card border border-info" v-if="disbursement.bursId">
        <div class="card-header bg-transparent border-info">
          <h5 class="my-0 text-info">
            <i class="bx bx-info-circle me-3"></i>BURS Information
          </h5>
        </div>
        <div class="card-body py-0" v-if="selectedBurs">
          <div class="card-text">
            <div class="row">
              <div class="col-lg-6">
                <p class="mb-1">
                  <span>BURS Number: </span
                  ><span class="text-warning">{{ selectedBurs.serialNumber }}</span>
                </p>
              </div>
              <div class="col-lg-6">
                <p class="mb-1">
                  <span>Supplier/Payee: </span
                  ><span class="text-warning">{{ selectedBurs.rfp.payee }} </span>
                </p>
              </div>
              <div class="col-lg-6">
                <p class="mb-1">
                  <span>Amount: </span
                  ><span class="text-warning">{{
                    formatCurrency(selectedBurs.rfp.amount)
                  }}</span>
                </p>
              </div>
              <div class="col-lg-6">
                <p class="mb-1">
                  <span>Date Posted: </span
                  ><span class="text-warning">{{
                    formatDate(selectedBurs.datePosted)
                  }}</span>
                </p>
              </div>
              <div class="col-lg-6">
                <p class="mb-1">
                  <span>Balance: </span
                  ><span class="text-warning">{{
                    formatCurrency(selectedBurs.balance)
                  }}</span>
                </p>
              </div>
              <div class="col-lg-6">
                <p class="mb-1">
                  <span>Date Approved: </span
                  ><span class="text-warning">{{
                    formatDate(selectedBurs.dateApproved)
                  }}</span>
                </p>
              </div>
              <div class="col-lg-6">
                <p>
                  <span>Particulars: </span
                  ><span class="text-warning">{{ selectedBurs.particulars }}</span>
                </p>
              </div>
              <div class="col-lg-6">
                <p>
                  <span>Disbursement created: </span
                  ><span class="text-warning">{{
                    selectedBurs.disbursements.length
                  }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="disbursement.bursId">
        <div class="row my-3">
          <div class="col-lg-12 mb-3">
            <label>Amount</label>
            <masked-input
              autocomplete="off"
              type="text"
              v-model="disbursement.amount"
              placeholder="Enter Amount..."
              class="form-control"
              :mask="currencyMask"
              @blur="checkTotal($event)"
            ></masked-input>
          </div>
        </div>
        <div class="card border border-info">
          <div class="card-body py-2">
            <div class="card-text">
              <div class="row mt-3">
                <div class="col-lg-10 mb-3">
                  <multiselect
                    v-model="selectedAccounts"
                    track-by="value"
                    label="accountName"
                    placeholder="Select accounts"
                    :custom-label="customLabel"
                    :options="accounts"
                    :searchable="true"
                    :multiple="true"
                    :close-on-select="false"
                  >
                    <template slot="singleLabel" slot-scope="{ option }"
                      ><strong>{{ option.text }}</strong> for
                      <strong> {{ option.supplier }}</strong></template
                    >
                  </multiselect>
                </div>
                <div class="col-lg-2 pt-1">
                  <b-button
                    variant="primary"
                    size="sm"
                    class="btn-block"
                    @click="addSelectedAccounts"
                    >Add</b-button
                  >
                </div>
              </div>
              <div class="row">
                <div class="col-lg-12 mb-3">
                  <div class="table-responsive">
                    <table
                      class="table table-sm align-middle table-bordered border-primary mb-0"
                    >
                      <thead>
                        <tr>
                          <th>UACS</th>
                          <th>Account Name</th>
                          <th class="text-center">Amount</th>
                          <th class="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(item, index) in disbursement.disbursementItems"
                          :key="index"
                        >
                          <th class="col-md-2" scope="row">{{ item.account.uacs }}</th>
                          <td class="col-md-6">{{ item.account.accountName }}</td>
                          <td class="col-md-3">
                            <masked-input
                              autocomplete="off"
                              type="text"
                              v-model="item.amount"
                              placeholder="Enter Amount..."
                              class="form-control"
                              :mask="currencyMask"
                              @blur="calculateTotal($event, item, index)"
                            ></masked-input>
                          </td>
                          <td class="text-center col-md-1">
                            <a href="javascript:void(0)" @click="deleteItem(item)"
                              ><i class="bx bx-trash text-danger"></i
                            ></a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <table
                    class="table table-sm align-middle table-bordered border-primary mt-2 mb-0"
                  >
                    <tr>
                      <td class="col-md-8" colspan="2">
                        <p class="mb-1">
                          <span><strong>Total</strong></span>
                        </p>
                      </td>
                      <td class="col-md-4 text-center" colspan="2">
                        <span class="text-warning mt-2">
                          {{ formatCurrency(total) }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td class="col-md-8" colspan="2">
                        <p class="mb-1">
                          <span><strong>Net</strong></span>
                        </p>
                      </td>
                      <td class="col-md-4 text-center" colspan="2">
                        <span class="text-warning mt-2">
                          {{ formatCurrency(balance) }}
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div class="row">
        <div class="col-lg-6 mb-3">
          <label>JEV No.</label>
          <b-form-input
            v-model="disbursement.jevNumber"
            placeholder="Enter JEV Number..."
          ></b-form-input>
        </div>
        <div class="col-lg-6 mb-3">
          <label>Mode of Payment</label>
          <b-form-select
            v-model="disbursement.modeOfPayment"
            :options="modeOfPayment"
            class="form-select form-select w-100"
          ></b-form-select>
        </div>
        <div class="col-lg-12 mb-3">
          <label>Computations</label>
          <b-form-textarea
            v-model="disbursement.computations"
            placeholder="Enter computations..."
            rows="3"
            max-rows="6"
          ></b-form-textarea>
        </div>
        <div class="col-lg-12 mb-3">
          <label>Particulars</label>
          <b-form-textarea
            v-model="disbursement.particulars"
            placeholder="Enter particulars..."
            rows="2"
            max-rows="6"
          ></b-form-textarea>
        </div>
        <div class="col-lg-6 mb-3">
          <label>Bank</label>
          <b-form-input
            v-model.number="disbursement.bank"
            placeholder="Enter Bank..."
          ></b-form-input>
        </div>
        <div class="col-lg-6 mb-3">
          <label>Account Number</label>
          <b-form-input
            v-model.number="disbursement.accountNumber"
            placeholder="Enter Account no..."
          ></b-form-input>
        </div>
        <div class="col-lg-6 mb-3">
          <label>Check Number</label>
          <b-form-input
            v-model.number="disbursement.checkNumber"
            placeholder="Enter Check Number..."
          ></b-form-input>
        </div>
        <div class="col-lg-6 mb-3">
          <label>Check Date</label>
          <date-picker
            :first-day-of-week="1"
            lang="en"
            value-type="timestamp"
            format="YYYY-MM-DD"
            v-model="disbursement.checkDate"
          ></date-picker>
        </div>

        <div class="modal-footer">
          <b-button variant="primary" @click="saveDisbursement">Save</b-button>
          <b-button
            variant="link"
            @click="disbursementModal.show = !disbursementModal.show"
            >Close</b-button
          >
        </div>
      </div>
    </b-modal>
    <b-modal v-model="postDateModal" title="Confirm Disbursement Post" hide-footer>
      <div class="mb-3">
        <label for="date">Approve Date</label>
        <date-picker
          v-model="postData.postDate"
          :first-day-of-week="1"
          lang="en"
          type="datetime"
          value-type="timestamp"
          format="YYYY-MM-DD hh:mm a"
        ></date-picker>
      </div>
      <div class="modal-footer">
        <b-button variant="primary" @click="confirmPost">Post</b-button>
        <b-button variant="link" @click="postDateModal = !postDateModal">Close</b-button>
      </div>
    </b-modal>
    <print-options ref="printOpt"></print-options>
    <!-- Modals -->
  </Layout>
</template>
