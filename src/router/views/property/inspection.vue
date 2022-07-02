<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { cloneDeep, groupBy } from "lodash";
import { required } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import Employee from "@/components/modals/employee.vue";

export default {
  page: {
    title: "Inspection",
  },
  components: {
    Layout,
    PageHeader,
    DatePicker,
    Employee,
  },
  data() {
    return {
      title: "Inspection",
      submitted: false,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Posted Property",
          href: "/property/posted",
        },
        {
          text: "Inspection",
          active: true,
        },
      ],
      currencyMask: createNumberMask({
        prefix: "",
        allowDecimal: true,
      }),
      quantityMask: createNumberMask({
        prefix: "",
        includeThousandsSeparator: false,
      }),
      tableData: [],
      modalTitle: "",
      form: {
        propertyId: "",
        inspectionDateTime: "",
        propertyStatus: "",
        assessedValue: "",
        inspectionStatus: "",
        employeeId: "",
        employee: {},
      },
      tableBusy: false,
      employeeName: "",
    };
  },
  validations: {
    form: {
      employeeId: { required },
      position: { required },
      location: { required },
      assignNotes: { required },
      assignmentType: { required },
    },
  },
  created() {
    this.tableBusy = true;
    this.$store
      .dispatch(
        "propertyinspection/GetPropertyInspection",
        this.$route.params.id
      )
      .then((res) => {
        console.log(res);
        this.tableBusy = false;
        this.tableData = res.data;
      })
      .catch(() => {
        this.tableBusy = false;
        this.showToast("Something went wrong getting property data!", "error");
      });
  },
  methods: {
    onAdd() {
      this.submitted = true;
      console.log(this.form)
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        this.$store
          .dispatch("propertyinspection/AddPropertyInspection", this.form)
          .then((res) => {
            if (res.data.error) {
              return this.showToast(res.data.errorMessage, "error");
            }
            this.showToast("Successfully created!", "success");
            this.onReset();
            this.hideModal();
          })
          .catch((err) => {
            this.showToast("Something went wrong adding inspection!", "error");
          });
        this.submitted = false;
      }
    },
    onReset() {
      this.form = {
        propertyId: "",
        inspectionDateTime: "",
        propertyStatus: "",
        assessedValue: "",
        inspectionStatus: "",
        employeeId: "",
        employee: {},
      };
      this.employeeName = "";
    },
    onInspect() {
      this.form.propertyId = this.$route.params.id;
      this.modalTitle = "Add Inspection";
      this.$bvModal.show("modal-standard");
    },
    hideModal() {
      this.$bvModal.hide("modal-standard");
    },
    disposeItem(props) {
      var index = this.tableData.indexOf(props);
      this.$swal({
        title: "Are you sure?",
        text: "You are about to set this item for disposal.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#5c636a",
        confirmButtonText: "Yes, dispose it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("property/DisposeProperty", props.id)
            .then((res) => {
              this.tableData.splice(index, 1);
              this.showToast("Successfully disposed", "success");
            })
            .catch((err) => {
              this.showToast("Cannot be disposed!", "error");
            });
        }
      });
    },
    getEmployee() {
      this.$bvModal.show("employee-modal");
    },
    dropEmployee(data) {
      var firstname = data.firstName;
      var lastname = data.lastName;
      this.form.employeeId = data.id;
      this.form.employee = data;
      this.employeeName = firstname.concat(" ", lastname);
    },
    showDtls(row) {
      row.item.rotateChevy = !row.item.rotateChevy;
      if (row.item.showDetails) {
        row.item.showDetails = !row.item.showDetails;
        setTimeout(() => {
          row.toggleDetails();
        }, 600);
      } else {
        row.toggleDetails();
        setTimeout(() => {
          row.item.showDetails = !row.item.showDetails;
        }, 50);
      }
    },
    formatDate(date) {
      const nDate = new Date(
        new Date(date).getTime() -
          new Date(date).getTimezoneOffset() * 60 * 1000
      );
      return nDate.toISOString();
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />

    <b-modal
      id="modal-standard"
      :title="modalTitle"
      size="md"
      title-class="font-18"
      hide-footer
    >
      <form @submit.prevent="onAdd" class="needs-validation" ref="fcForm">
        <div class="mb-3">
          <label for="inspectionDateTime">Inspection Date</label>
          <date-picker
            v-model="form.inspectionDateTime"
            :first-day-of-week="1"
            lang="en"
            placeholder="Enter Inspection Date..."
            :class="{
              'is-invalid': submitted && $v.form.inspectionDateTime.$error,
            }"
          ></date-picker>
          <div
            v-if="submitted && $v.form.inspectionDateTime.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.form.inspectionDateTime.required"
              >This value is required.</span
            >
          </div>
        </div>
        <div class="mb-3">
          <label for="propertyStatus">Property Status</label>
          <input
            id="propertyStatus"
            type="text"
            v-model="form.propertyStatus"
            placeholder="Enter Property Status..."
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.form.propertyStatus.$error,
            }"
            autocomplete="off"
          />
          <div
            v-if="submitted && $v.form.propertyStatus.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.form.propertyStatus.required"
              >This value is required.</span
            >
          </div>
        </div>
        <div class="mb-3">
          <label for="assessedValue">Assessed Value</label>
          <input
            id="assessedValue"
            type="text"
            v-model="form.assessedValue"
            placeholder="Enter Assessed Value..."
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.form.assessedValue.$error,
            }"
            autocomplete="off"
          />
          <div
            v-if="submitted && $v.form.assessedValue.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.form.assessedValue.required"
              >This value is required.</span
            >
          </div>
        </div>
        <div class="mb-3">
          <label for="inspectionStatus">Inspection Status</label>
          <input
            id="inspectionStatus"
            type="text"
            v-model="form.inspectionStatus"
            placeholder="Enter Property Status..."
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.form.inspectionStatus.$error,
            }"
            autocomplete="off"
          />
          <div
            v-if="submitted && $v.form.inspectionStatus.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.form.inspectionStatus.required"
              >This value is required.</span
            >
          </div>
        </div>
        <div class="mb-3">
          <label for="employee">Employee</label>
          <b-input-group>
            <template #append>
              <b-button @click="getEmployee" variant="outline-info"
                ><i class="mdi mdi-clipboard-text-search-outline"></i
              ></b-button>
            </template>
            <input
              autocomplete="off"
              type="text"
              disabled
              placeholder="Search Employee..."
              class="form-control"
              :class="{
                'is-invalid': submitted && $v.form.employeeId.$error,
              }"
              v-model="employeeName"
            />
          </b-input-group>
          <div
            v-if="submitted && $v.form.employeeId.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.form.employeeId.required"
              >This value is required.</span
            >
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Save changes</button>
        </div>
      </form>
    </b-modal>
    <div
      class="
        card
        border-4 border-top border-start-0 border-end-0 border-primary
      "
    >
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <h4 class="card-title m-0">Inspection History</h4>
          <!-- <button
            type="button"
            @click="onInspect()"
            class="btn btn-md btn-info d-flex align-items-center"
          >
            <i class="bx bx-plus fs-6"></i>Add New
          </button> -->
        </div>
        <div
          class="h-50vh d-flex align-items-center justify-content-center"
          v-if="tableData.length == 0"
        >
          <h5 class="text-muted">
            <i class="fas fa-exclamation-triangle me-2"></i>No Data Found
          </h5>
        </div>
        <div
          class="h-50vh d-flex align-items-center justify-content-center"
          v-if="tableBusy"
        >
          <div class="preloader-component me-2">
            <div class="status">
              <div class="spinner-chase w-25px h-25px">
                <div class="chase-dot"></div>
                <div class="chase-dot"></div>
                <div class="chase-dot"></div>
                <div class="chase-dot"></div>
                <div class="chase-dot"></div>
                <div class="chase-dot"></div>
              </div>
            </div>
          </div>
          <h5 class="mb-0">Loading...</h5>
        </div>
      </div>
    </div>
    <Employee @dropData="dropEmployee($event)"></Employee>
  </Layout>
</template>
