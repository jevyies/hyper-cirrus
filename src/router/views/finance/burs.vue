<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import BursTable from "@/components/tables/burs-table";
import { required } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import AvailableRFP from "@/components/tables/available-rfp";
import PrintOptions from "@/components/modals/print-options.vue";

export default {
  page: {
    title: "BURS",
  },
  components: {
    Layout,
    PageHeader,
    BursTable,
    DatePicker,
    AvailableRFP,
    PrintOptions,
  },
  data() {
    return {
      title: "Budget Utilization Request and Status",
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "BURS",
          active: true,
        },
      ],
      cycle: Number(this.$store.getters["data/getCycle"]),
      posted: [],
      pendings: [],
      approved: [],
      incoming: [],
      burs: {
        id: 0,
        rfpId: null,
        particulars: null,
      },

      rfp: [],
      rfpOptions: [],
      selectedRfp: null,
      bursModal: {
        show: false,
        title: "",
      },
      postDateModal: false,
      postData: {
        postDate: Date.now(),
        data: 0,
      },
      alert: {
        show: false,
        type: "",
        message: "",
      },
      submitted: false,
    };
  },
  methods: {
    changeCycle(cycle) {
      this.cycle = cycle;
      this.burs.cycle = Number(cycle);
      this.fetchPosted();
      // this.fetchApproved();
      this.fetchPending();
      this.fetchRfp();
      this.fetchAvailable();
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("en-US");
    },
    /** create burs */
    createBurs(record) {
      this.burs.rfpId = record.id;
      this.selectRfp(record.id);
      // this.onReset();
      this.bursModal.title = "Create Budget Utilization Request and Status";
      this.bursModal.show = true;
    },

    selectRfp(id) {
      this.selectedRfp = this.rfp.find((rfp) => rfp.id == id);
    },

    formatCurrency(data) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    onReset() {
      this.burs.particulars = null;
      this.burs.rfpId = null;
      this.submitted = false;
      this.$v.$reset();
    },
    editBURS(record) {
      this.selectedRfp = this.rfp.find((rfp) => rfp.id == record.rfpId);
      this.burs = record;
      this.bursModal.title = "Edit Budget Utilization Request and Status";
      this.bursModal.show = true;
    },
    removeBURS(record) {
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
            .dispatch("burs/deleteBurs", record.id)
            .then(() => {
              this.pendings.splice(this.pendings.indexOf(record), 1);
              this.$swal({
                title: "Deleted!",
                text: "BURS has been deleted.",
                icon: "success",
              });
            })
            .catch(() => {
              this.$swal({
                title: "Error!",
                text:
                  "Something went wrong. Cannot remove BURS. Please contact your administrator",
                icon: "error",
              });
            });
        }
      });
    },
    saveBURS() {
      if (!this.burs.rfpId) {
        this.$swal({
          title: "Error",
          text: "Cannot proceed. Please select RFP",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
      this.$v.burs.$touch();
      this.submitted = true;
      if (this.$v.burs.$invalid) {
        return;
      } else {
        if (this.burs.id > 0) {
          /** Update */
          this.$store
            .dispatch("burs/updateBurs", { id: this.burs.id, data: this.burs })
            .then(() => {
              this.$swal({
                title: "Success",
                text: "BURS Successfully Updated",
                icon: "success",
                confirmButtonText: "OK",
              });
              this.fetchAvailable();
              this.fetchPending();

              this.bursModal.show = false;
              this.onReset();
            })
            .catch(() => {
              this.bursModal.show = false;
              this.$swal({
                title: "Error",
                text:
                  "Something went wrong. Cannot update BURS. Please contact your administrator",
                icon: "error",
                confirmButtonText: "OK",
              });
            });
        } else {
          /** Create **/
          this.$store
            .dispatch("burs/createBurs", this.burs)
            .then(() => {
              this.$swal({
                title: "Success",
                text: "Burs has been created",
                icon: "success",
                confirmButtonText: "OK",
              });
              this.fetchAvailable();
              this.fetchPending();
              this.bursModal.show = false;
              this.onReset();
            })
            .catch(() => {
              this.bursModal.show = false;
              this.$swal({
                title: "Error!",
                text:
                  "Something went wrong. Cannot create BURS. Please contact your administrator",
                icon: "error",
              });
            });
        }
      }
    },
    postBURS(record) {
      this.postData = {
        data: null,
        postDate: Date.now(),
      };
      this.$swal({
        title: "Are you sure?",
        text: "You are going to post a BURS. You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        confirmButtonText: "Yes, post it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.postData.data = record;
          this.postDateModal = true;
        }
      });
    },
    confirmPost() {
      if (!this.postData.postDate) {
        this.alert = {
          variant: "danger",
          message: "Please select a date",
          show: true,
        };
        return;
      }
      const nDate = new Date(
        new Date(this.postData.postDate).getTime() -
          new Date(this.postData.postDate).getTimezoneOffset() * 60 * 1000
      );
      this.$store
        .dispatch("burs/postBurs", {
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
            text: "BURS has been posted.",
            icon: "success",
          });
        })
        .catch(() => {
          this.postDateModal = false;
          this.$swal({
            title: "Error!",
            text:
              "Something went wrong. Cannot post BURS. Please contact your administrator",
            icon: "error",
          });
        });
    },
    approveBURS(record) {
      this.$swal({
        title: "Are you sure?",
        text: "You are going to approve this BURS. You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        confirmButtonText: "Approve it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("burs/approveBurs", record.id)
            .then(() => {
              this.posted.splice(this.posted.indexOf(record), 1);
              // this.fetchApproved();
              this.$swal({
                title: "Approved!",
                text: "BURS has been approved.",
                icon: "success",
              });
            })
            .catch(() => {
              this.$swal({
                title: "Error!",
                text:
                  "Something went wrong. Cannot approve BURS. Please contact your administrator",
                icon: "error",
              });
            });
        }
      });
    },
    returnBURS(record) {
      this.$swal({
        title: "Are you sure?",
        text: "You are going to return a BURS. Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f1b44c",
        confirmButtonText: "Return it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("burs/returnBurs", record.id)
            .then(() => {
              this.posted.splice(this.posted.indexOf(record), 1);
              this.fetchPending();
              this.$swal({
                title: "Returned!",
                text: "BURS has been returned to Pending.",
                icon: "success",
              });
            })
            .catch(() => {
              this.$swal({
                title: "Error!",
                text:
                  "Something went wrong. Cannot return BURS. Please contact your administrator",
                icon: "error",
              });
            });
        }
      });
    },
    fetchPosted() {
      this.$store
        .dispatch("burs/getPostedBurs", this.cycle)
        .then((response) => {
          this.posted = response.data;
          this.posted = this.posted.map((record) => ({
            ...record,
            viewUpload: false,
          }));
        })
        .catch(() => {
          this.$swal({
            icon: "error",
            text: "Cannot fetch posted BURS. Please contact your administrator",
          });
        });
    },
    fetchPending() {
      this.$store
        .dispatch("burs/getPendingBurs", this.cycle)
        .then((response) => {
          this.pendings = response.data;
        })
        .catch(() => {
          this.$swal({
            icon: "error",
            text: "Cannot fetch pending BURS. Please contact your administrator",
          });
        });
    },
    fetchRfp() {
      this.$store
        .dispatch("rfppayment/getAllPosted", this.cycle)
        .then((response) => {
          this.rfp = JSON.parse(JSON.stringify(response.data));
          this.rfpOptions = response.data.map((item) => ({
            value: item.id,
            text: `${item.rfpNumber} - ${item.rfpPaymentItem.deliveryUnitBudgetItem.objectOfExpenditure.account.accountName}`,
          }));
          this.rfpOptions.unshift({
            value: null,
            text: "Select RFP...",
          });
        })
        .catch(() => {
          this.$swal({
            icon: "error",
            text: "Cannot fetch posted RFP. Please contact your administrator",
          });
        });
    },
    fetchAvailable() {
      this.$store
        .dispatch("burs/getAvailable", this.cycle)
        .then((response) => {
          this.incoming = response.data;
        })
        .catch(() => {
          this.$swal({
            icon: "error",
            text:
              "Cannot fetch available Available RFP. Please contact your administrator",
          });
        });
    },
    async printBurs(id) {
      this.$refs.printOpt.putOptions({
        apiUrl: "/Finance/Burs/Print",
        routeVariables: [id],
      });
      this.$bvModal.show("print-options-modal");
    },
  },
  created() {
    this.fetchPosted();
    // this.fetchApproved();
    this.fetchPending();
    this.fetchRfp();
    this.fetchAvailable();
  },
  validations: {
    burs: {
      particulars: { required },
    },
  },
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
          <span class="d-none d-sm-inline-block">Incoming</span>
        </template>
        <AvailableRFP :records="incoming" @create="createBurs" />
      </b-tab>
      <b-tab>
        <template v-slot:title>
          <span class="d-inline-block d-sm-none">
            <i class="bx bx-home"></i>
          </span>
          <span class="d-none d-sm-inline-block">Pending</span>
        </template>
        <BursTable
          :records="pendings"
          type="pending"
          @update="editBURS"
          @remove="removeBURS"
          @post="postBURS"
          @printBurs="printBurs"
        />
      </b-tab>
      <b-tab>
        <template v-slot:title>
          <span class="d-inline-block d-sm-none">
            <i class="bx bx-home"></i>
          </span>
          <span class="d-none d-sm-inline-block">Posted</span>
        </template>
        <BursTable
          :records="posted"
          @approve="approveBURS"
          @return="returnBURS"
          @printBurs="printBurs"
          type="posted"
        />
      </b-tab>
    </b-tabs>

    <!-- Modals -->
    <b-modal
      v-model="bursModal.show"
      :title="bursModal.title"
      size="lg"
      scrollable
      hide-footer
    >
      <!-- <div class="mb-3">
        <label>Select Approved RFP</label>
        <b-form-select
          class="form-select"
          :options="rfpOptions"
          v-model="burs.rfpId"
          @change="selectRfp"
        >
        </b-form-select>
      </div> -->
      <div class="card border border-info" v-if="burs.rfpId">
        <div class="card-header bg-transparent border-info">
          <h5 class="my-0 text-info">
            <i class="bx bx-info-circle me-3"></i>RFP Information
          </h5>
        </div>
        <div class="card-body py-0" v-if="selectedRfp">
          <div class="card-text">
            <div class="row">
              <div class="col-lg-6">
                <p class="mb-1">
                  <span>RFP Number: </span
                  ><span class="text-warning">{{ selectedRfp.rfpNumber }}</span>
                </p>
              </div>
              <div class="col-lg-6">
                <p class="mb-1">
                  <span>Supplier/Payee: </span
                  ><span class="text-warning">{{ selectedRfp.supplier.name }} </span>
                </p>
              </div>
              <div class="col-lg-6">
                <p class="mb-1">
                  <span>Amount: </span
                  ><span class="text-warning">{{
                    formatCurrency(selectedRfp.amount)
                  }}</span>
                </p>
              </div>
              <div class="col-lg-6">
                <p class="mb-1">
                  <span>Date Posted: </span
                  ><span class="text-warning">{{
                    formatDate(selectedRfp.datePosted)
                  }}</span>
                </p>
              </div>
              <div class="col-lg-6">
                <p>
                  <span>Account: </span
                  ><span class="text-warning">{{
                    selectedRfp.rfpPaymentItem.deliveryUnitBudgetItem.objectOfExpenditure
                      .account.accountName
                  }}</span>
                </p>
              </div>
              <div class="col-lg-6">
                <p>
                  <span>Particulars: </span
                  ><span class="text-warning">{{ selectedRfp.particulars }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-12 mb-3">
          <label>Particulars</label>
          <b-form-textarea
            v-model="burs.particulars"
            placeholder="Enter Particulars..."
            rows="6"
            :class="{
              'is-invalid': submitted && $v.burs.particulars.$error,
            }"
          ></b-form-textarea>
          <div v-if="submitted && $v.burs.particulars.$error" class="invalid-feedback">
            <span v-if="!$v.burs.particulars.required">This value is required.</span>
          </div>
        </div>

        <div class="modal-footer">
          <b-button variant="primary" @click="saveBURS">Save</b-button>
          <b-button variant="link" @click="bursModal.show = !bursModal.show"
            >Close</b-button
          >
        </div>
      </div>
    </b-modal>
    <b-modal v-model="postDateModal" title="Confirm BURS Post" hide-footer>
      <div class="mb-3">
        <b-alert :show="alert.show" :variant="alert.type">{{ alert.message }}</b-alert>
      </div>
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
