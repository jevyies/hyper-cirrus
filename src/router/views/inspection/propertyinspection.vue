<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { cloneDeep, groupBy } from "lodash";
import { required } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import Employee from "@/components/modals/employee.vue";
import UploadPopover from "@/components/widgets/upload-popover.vue";

export default {
  page: {
    title: "Inspection History",
  },
  components: {
    Layout,
    PageHeader,
    DatePicker,
    Employee,
    UploadPopover,
  },
  data() {
    return {
      title: "Inspection History",
      submitted: false,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Property",
          href: "/inspection/property",
        },
        {
          text: "Inspection History",
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
      property: {},
      modalTitle: "",
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: "",
      filterOn: [],
      sortBy: "poNumber",
      sortDesc: false,
      form: {
        propertyId: "",
        inspectionDateTime: "",
        propertyStatus: "",
        assessedValue: "",
        inspectionStatus: "",
        employeeId: "",
        employee: {},
      },
      loading: false,
      employeeName: "",
      editInspection: false,
      uploadOptions: {
        type: "Property Inspection",
        placement: "lefttop",
        folder: "Property",
      },
    };
  },
  validations: {
    form: {
      propertyId: { required },
      inspectionDateTime: { required },
      propertyStatus: { required },
      assessedValue: { required },
      inspectionStatus: { required },
      employeeId: { required },
    },
  },
  // computed: {
  //   filtered() {
  //     let data = this.tableData;
  //     var total = this.currentPage * this.perPage;
  //     if (this.filter.trim() != "" && this.filter) {
  //       data = data.filter((item) => {
  //         if (
  //           this.formatDate(new Date(item.inspectionDateTime))
  //             .toUpperCase()
  //             .includes(this.filter.toUpperCase())
  //         )
  //           return this.formatDate(new Date(item.inspectionDateTime))
  //             .toUpperCase()
  //             .includes(this.filter.toUpperCase());
  //       });
  //     }
  //     var currentData = data.slice(total - this.perPage, total);
  //     if (this.currentPage > 1 && currentData.length == 0) {
  //       total = (this.currentPage - 1) * this.perPage;
  //       currentData = data.slice(total - this.perPage, total);
  //     }
  //     return currentData;
  //   },
  //   rows() {
  //     if (this.filter.trim() != "" && this.filter) {
  //       return this.filtered.length;
  //     } else {
  //       return this.tableData.length;
  //     }
  //   },
  // },
  async created() {
    await this.$store
      .dispatch("property/GetSingleProperty", this.$route.params.id)
      .then((res) => {
        this.property = res.data;
        console.log(res.data);
      })
      .catch(() => {
        this.showToast("Something went wrong getting property data!", "error");
      });
    await this.$store
      .dispatch(
        "propertyinspection/GetPropertyInspection",
        this.$route.params.id
      )
      .then((res) => {
        this.loading = false;
        res.data.forEach((item) => {
          item.inspectionFiles = [];
          item.attachmentVisible = false;
          item.addDocu = false;
          item.attachmentLoading = false;
          item.fileSearch = "";
        });
        console.log(res);
        this.tableData = res.data;
      })
      .catch(() => {
        this.loading = false;
        this.showToast("Something went wrong getting property data!", "error");
      });
  },
  methods: {
    onAdd() {
      this.submitted = true;
      this.loading = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        console.log(this.form);
        this.form.inspectionDateTime = this.setDate(
          this.form.inspectionDateTime
        );
        if (this.editInspection === false) {
          this.$store
            .dispatch("propertyinspection/AddPropertyInspection", this.form)
            .then((res) => {
              if (res.data.error) {
                console.log(res);
                return this.showToast(res.data.errorMessage, "error");
              }
              this.showToast("Successfully created!", "success");
              res.data.inspectionFiles = [];
              res.data.attachmentVisible = false;
              res.data.addDocu = false;
              res.data.attachmentLoading = false;
              res.data.fileSearch = "";
              this.tableData.push(res.data);
              this.loading = false;
              this.onReset();
              this.hideModal();
            })
            .catch((err) => {
              this.loading = false;
              this.showToast(
                "Something went wrong adding inspection!",
                "error"
              );
            });
          this.submitted = false;
        } else {
          this.$store
            .dispatch("propertyinspection/UpdatePropertyInspection", this.form)
            .then((res) => {
              if (res.data.error) {
                console.log(res);
                return this.showToast(res.data.errorMessage, "error");
              }
              this.showToast("Successfully created!", "success");
              res.data.inspectionFiles = [];
              res.data.attachmentVisible = false;
              res.data.addDocu = false;
              res.data.attachmentLoading = false;
              res.data.fileSearch = "";
              var index = this.tableData.findIndex(
                (item) => item.id == this.form.id
              );
              this.tableData.splice(index, 1, res.data);
              this.loading = false;
              this.onReset();
              this.hideModal();
            })
            .catch((err) => {
              this.loading = false;
              this.showToast(
                "Something went wrong adding inspection!",
                "error"
              );
            });
          this.submitted = false;
        }
      }
    },
    postItem(props) {
      var index = this.tableData.indexOf(props);
      this.$swal({
        title: "Are you sure?",
        text: "You are about to post this inspection.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        cancelButtonColor: "#5c636a",
        confirmButtonText: "Yes, post it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("propertyinspection/PostPropertyInspection", props.id)
            .then((res) => {
              this.tableData[index].status = "POSTED";
              this.showToast("Successfully Posted", "success");
            })
            .catch((err) => {
              this.showToast("Cannot be Posted!", "error");
            });
        }
      });
    },
    unpostItem(props) {
      var index = this.tableData.indexOf(props);
      this.$swal({
        title: "Are you sure?",
        text: "You are about to unpost this inspection.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        cancelButtonColor: "#5c636a",
        confirmButtonText: "Yes, unpost it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("propertyinspection/UnpostPropertyInspection", props.id)
            .then((res) => {
              this.tableData[index].status = "PENDING";
              this.showToast("Successfully Unposted", "success");
            })
            .catch((err) => {
              this.showToast("Cannot be Unposted!", "error");
            });
        }
      });
    },
    deleteItem(props) {
      var index = this.tableData.indexOf(props);
      this.$swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#5c636a",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store
            .dispatch("propertyinspection/DeletePropertyInspection", props.id)
            .then((res) => {
              if (res.status == 204) {
                this.tableData.splice(index, 1);
                this.showToast("Successfully deleted", "success");
              }
            })
            .catch((err) => {
              this.showToast("Cannot be deleted!", "error");
            });
        }
      });
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
    createInspection() {
      this.form.propertyId = this.$route.params.id;
      this.editInspection = false;
      this.modalTitle = "Add Inspection";
      this.$bvModal.show("modal-standard");
    },
    updateInspection(props) {
      console.log(props);
      this.form = cloneDeep(props);
      this.form.inspectionDateTime = new Date(this.form.inspectionDateTime);
      this.form.employeeId = props.employeeId;
      this.employeeName = props.employee.firstName.concat(
        " ",
        props.employee.lastName
      );
      this.editInspection = true;
      this.modalTitle = "Update Inspection";
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
    setDate(date) {
      const nDate = new Date(
        new Date(date).getTime() -
          new Date(date).getTimezoneOffset() * 60 * 1000
      );
      return nDate.toISOString();
    },
    uploadDocument(response, id) {
      var index = this.tableData.findIndex((x) => x.id == id);
      this.tableData[index].inspectionFiles.push(response);
    },
    openDocument(x) {
      window.open(
        `${this.$store.state.data.rootFileDirectory}${x.folder}/${x.fileName}`
      );
    },
    searchDocu(row) {
      let data = row.inspectionFiles;
      if (row.fileSearch.trim() != "" && row.fileSearch) {
        data = data.filter((item) => {
          return item.description
            .toUpperCase()
            .includes(row.fileSearch.toUpperCase());
        });
      }
      return data;
    },
    getAttachments(row) {
      row.attachmentVisible = !row.attachmentVisible;
      if (row.attachmentVisible) {
        row.inspectionFiles = [];
        row.fileSearch = "";
        row.attachmentLoading = true;
        this.$store
          .dispatch("filemanager/GetFiles", {
            id: row.id,
            type: this.uploadOptions.type,
          })
          .then((res) => {
            row.attachmentLoading = false;
            row.inspectionFiles = res.data;
          })
          .catch(() => {
            row.attachmentLoading = false;
            this.showToast(
              "Something went wrong! - getting documents",
              "error"
            );
          });
      }
    },
    removeFile(id, parentId, type) {
      this.$swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#5c636a",
        confirmButtonText: "Yes, remove it!",
      }).then((result) => {
        if (result.value) {
          this.$store
            .dispatch("filemanager/DeleteFile", id)
            .then((res) => {
              if (res.data.error) {
                return this.showToast(res.data.errorMessage, "error");
              }
              let index = this.tableData.findIndex(
                (item) => item.id == parentId
              );
              let yIndex = this.tableData[index].inspectionFiles.findIndex(
                (item) => item.id == id
              );
              this.tableData[index].inspectionFiles.splice(yIndex, 1);
              this.showToast("Successfully removed!", "success");
            })
            .catch(() => {
              this.showToast("Cannot be deleted!", "error");
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
          <b-form-select
            class="form-select"
            :class="{
              'is-invalid': submitted && $v.form.propertyStatus.$error,
            }"
            v-model="form.propertyStatus"
          >
            <b-form-select-option value="" disabled
              >Select Property Status...</b-form-select-option
            >
            <b-form-select-option value="Serviceable"
              >Serviceable</b-form-select-option
            >
            <b-form-select-option value="Un-Serviceable"
              >Un-Serviceable</b-form-select-option
            >
            <b-form-select-option value="Repairable"
              >Repairable</b-form-select-option
            >
            <b-form-select-option value="End-of-Life"
              >End-of-Life</b-form-select-option
            >
          </b-form-select>
          <!-- <input
            id="propertyStatus"
            type="text"
            v-model="form.propertyStatus"
            placeholder="Enter Property Status..."
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.form.propertyStatus.$error,
            }"
            autocomplete="off"
          /> -->
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
          <b-form-select
            class="form-select"
            :class="{
              'is-invalid': submitted && $v.form.inspectionStatus.$error,
            }"
            v-model="form.inspectionStatus"
          >
            <b-form-select-option value="" disabled
              >Select Property Status...</b-form-select-option
            >
            <b-form-select-option value="Verified"
              >Verified</b-form-select-option
            >
            <b-form-select-option value="Missing">Missing</b-form-select-option>
            <b-form-select-option value="Non-Existent"
              >Non-Existent</b-form-select-option
            >
            <b-form-select-option value="Others">Others</b-form-select-option>
          </b-form-select>
          <!-- <input
            id="inspectionStatus"
            type="text"
            v-model="form.inspectionStatus"
            placeholder="Enter Property Status..."
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.form.inspectionStatus.$error,
            }"
            autocomplete="off"
          /> -->
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
          <label for="employee">Inspected By</label>
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
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="d-flex align-items-center h-100">
              <div>
                <h4 class="mb-1">{{ property.name }}</h4>
                <div class="d-flex align-items-center h-100">
                  Condition:
                  <h6 class="mb-0 ms-2">{{ property.condition }}</h6>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex float-end">
              <button
                type="button"
                @click="createInspection()"
                class="btn btn-md btn-info d-flex align-items-center"
              >
                <i class="bx bx-plus fs-6"></i>Create New
              </button>
            </div>
          </div>
        </div>
        <!-- <div class="row mb-1">
          <div class="col-md-6"></div>
          <div class="col-md-6">
            <div class="d-flex float-end">
              <div id="tickets-table_filter" class="dataTables_filter me-1">
                <label class="d-inline-flex align-items-center">
                  <b-form-input
                    autocomplete="off"
                    v-model="filter"
                    type="search"
                    placeholder="Search Date..."
                    class="form-control"
                  ></b-form-input>
                </label>
              </div>
              <div id="tickets-table_length" class="dataTables_length">
                <label class="d-inline-flex align-items-center mb-0">
                  <b-form-select
                    class="form-select"
                    v-model="perPage"
                    size="sm"
                    :options="pageOptions"
                  >
                  </b-form-select>
                </label>
              </div>
            </div>
          </div>
        </div> -->
        <div
          class="h-50vh d-flex align-items-center justify-content-center"
          v-if="loading"
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
        <div
          class="h-50vh d-flex align-items-center justify-content-center"
          v-else-if="tableData.length == 0"
        >
          <h5 class="text-muted">
            <i class="fas fa-exclamation-triangle me-2"></i>No Data Found
          </h5>
        </div>
        <div
          class="pt-1 pb-1 text-muted"
        >
          <ul
            class="verti-timeline list-unstyled mb-2 ms-4"
            v-for="x in tableData"
            :key="x.id"
          >
            <li
              class="event-list"
              :class="{
                active: x.status == 'PENDING',
              }"
            >
              <div class="event-timeline-dot">
                <i
                  v-if="x.status == 'PENDING'"
                  class="bx bxs-right-arrow-circle font-size-18 bx-fade-right"
                ></i>
                <i v-else class="bx bx-right-arrow-circle font-size-18"></i>
              </div>
              <div class="media ms-3">
                <div class="media-body">
                  <b-card no-body class="mb-1">
                    <b-card-header
                      header-tag="header"
                      class="border"
                      role="tab"
                    >
                      <div class="row mb-2">
                        <div class="col">
                          <b class="font-size-16">
                            {{ formatDate(new Date(x.inspectionDateTime)) }}
                          </b>
                          <div class="font-size-12 mb-1">
                            Property Status:
                            <b class="font-size-14">{{ x.propertyStatus }}</b>
                          </div>
                          <div class="font-size-12 mb-1">
                            Assessed Value:
                            <b class="font-size-14">{{ x.assessedValue }}</b>
                          </div>
                          <div class="font-size-12 mb-1">
                            Inspection Status:
                            <b class="font-size-14">{{ x.inspectionStatus }}</b>
                          </div>
                          <div class="font-size-12 mb-1">
                            Inspected By:
                            <b v-if="x.employee" class="font-size-14">
                              {{
                                x.employee.firstName.charAt(0).toUpperCase() +
                                x.employee.firstName.slice(1)
                              }}
                              {{
                                x.employee.middleName
                                  ? `${x.employee.middleName
                                      .charAt(0)
                                      .toUpperCase()}.`
                                  : ""
                              }}
                              {{
                                x.employee.lastName.charAt(0).toUpperCase() +
                                x.employee.lastName.slice(1)
                              }}</b
                            >
                            <b v-else class="font-size-14">n/a</b>
                          </div>
                          <div class="font-size-16 mb-1">
                            <span
                              v-if="x.status == 'PENDING'"
                              class="badge bg-warning bg-soft text-warning"
                              ><b>{{ x.status }}</b></span
                            >
                            <span
                              v-if="x.status == 'POSTED'"
                              class="badge bg-success"
                              ><b>{{ x.status }}</b></span
                            >
                          </div>
                        </div>
                        <div class="col">
                          <div class="float-end d-flex align-items-top">
                            <b-dropdown
                              id="dropdown-dropleft"
                              right
                              variant="link"
                              toggle-class="text-decoration-none"
                              menu-class="dropdown-menu-end"
                              no-caret
                            >
                              <template #button-content>
                                <i
                                  class="fas fa-ellipsis-v rotate rotate-90"
                                ></i>
                              </template>
                              <b-dropdown-item
                                v-if="x.status == 'PENDING'"
                                @click="updateInspection(x)"
                                variant="info"
                                ><i class="mdi mdi-update font-size-18 me-1"></i
                                >Update Inspection</b-dropdown-item
                              >
                              <b-dropdown-item
                                variant="success"
                                v-if="x.status == 'PENDING'"
                                @click="postItem(x)"
                                ><i
                                  class="bx bx-check-circle font-size-18 me-1"
                                ></i
                                >Post Inspection</b-dropdown-item
                              >
                              <b-dropdown-item
                                variant="warning"
                                v-if="x.status == 'POSTED'"
                                @click="unpostItem(x)"
                                ><i class="bx bx-x-circle font-size-18 me-1"></i
                                >Unpost Inspection</b-dropdown-item
                              >
                              <b-dropdown-item
                                variant="danger"
                                v-if="x.status == 'PENDING'"
                                @click="deleteItem(x)"
                                ><i
                                  class="mdi mdi-trash-can font-size-18 me-1"
                                ></i
                                >Delete</b-dropdown-item
                              >
                            </b-dropdown>
                          </div>
                        </div>
                      </div>
                    </b-card-header>
                    <b-card-body class="border">
                      <div
                        class="
                          d-flex
                          align-items-center
                          justify-content-between
                          cursor-pointer
                        "
                        @click="getAttachments(x)"
                      >
                        <h6 class="mb-0 text-muted">
                          <i class="bx bx-paperclip rotate rotate-90"></i>
                          Attachments
                        </h6>
                        <h5 class="mb-0">
                          <i
                            class="bx bx-chevron-right rotate"
                            :class="{
                              'rotate-90': x.attachmentVisible,
                            }"
                          ></i>
                        </h5>
                      </div>
                    </b-card-body>
                    <b-collapse :visible="x.attachmentVisible" role="tabpanel">
                      <b-card-body class="border">
                        <div
                          class="
                            d-flex
                            align-items-center
                            justify-content-between
                            mb-3
                          "
                        >
                          <div class="d-flex">
                            <p
                              class="mb-0"
                              v-if="x.inspectionFiles.length == 0"
                            >
                              <i>No documents found</i>
                            </p>
                            <input
                              v-if="x.inspectionFiles.length > 0"
                              type="search"
                              class="form-control"
                              v-model="x.fileSearch"
                              placeholder="Search Documents..."
                            />
                          </div>
                          <div class="">
                            <!-- <button
                      type="button"
                      :id="`posted-document${x.id}`"
                      @click="x.addDocu = true"
                      class="
                        btn btn-sm btn-info
                        mb-2
                        me-2
                        d-flex
                        align-items-center
                      "
                    >
                      <i class="bx bx-plus fs-6"></i>Upload Documents
                    </button> -->
                            <a
                              href="javascript:void(0);"
                              class="text-primary border-primary border p-2"
                              :id="`posted-document${x.id}`"
                              @click="x.addDocu = true"
                              ><i class="bx bx-plus"></i>Upload Documents</a
                            >
                            <upload-popover
                              :option="uploadOptions"
                              :sourceId="x.id"
                              @uploaded="uploadDocument($event, x.id)"
                              :showPV="x.addDocu"
                              @closePopover="x.addDocu = false"
                              :dzId="`dropzone-posted${x.id}`"
                              :pvId="`posted-document${x.id}`"
                            ></upload-popover>
                          </div>
                        </div>
                        <div class="mt-2">
                          <b-row>
                            <b-col
                              sm="3"
                              v-for="(y, index) in searchDocu(x)"
                              :key="y.id"
                              class="mb-2"
                            >
                              <div
                                class="position-relative cursor-pointer"
                                :style="`z-index: ${
                                  x.inspectionFiles.length - index
                                }`"
                              >
                                <div class="border p-3">
                                  <div>
                                    <div class="float-end ms-2">
                                      <b-dropdown
                                        id="dropdown-dropleft"
                                        right
                                        variant="link"
                                        toggle-class="text-decoration-none text-dark font-size-16 pt-0"
                                        menu-class="dropdown-menu-end"
                                        no-caret
                                      >
                                        <template #button-content>
                                          <i
                                            class="mdi mdi-dots-horizontal"
                                          ></i>
                                        </template>
                                        <b-dropdown-item
                                          @click="openDocument(y)"
                                          ><i
                                            class="bx bx-link-external me-1"
                                          ></i
                                          >Open</b-dropdown-item
                                        >
                                        <b-dropdown-item
                                          variant="danger"
                                          @click="removeFile(y.id, x.id)"
                                          ><i class="bx bx-trash me-1"></i
                                          >Remove</b-dropdown-item
                                        >
                                      </b-dropdown>
                                    </div>
                                    <div
                                      class="avatar-xs me-3 mb-2"
                                      @click="openDocument(y)"
                                    >
                                      <div
                                        class="
                                          avatar-title
                                          bg-transparent
                                          rounded
                                        "
                                      >
                                        <i
                                          v-if="y.fileType.includes('image')"
                                          class="
                                            mdi mdi-image
                                            font-size-24
                                            text-purple
                                          "
                                        ></i>
                                        <i
                                          v-if="
                                            y.fileType.includes('application')
                                          "
                                          class="
                                            mdi mdi-file-pdf-outline
                                            font-size-24
                                            text-danger
                                          "
                                        ></i>
                                      </div>
                                    </div>
                                    <div
                                      class="d-flex"
                                      @click="openDocument(y)"
                                    >
                                      <div class="overflow-hidden me-auto">
                                        <h5
                                          class="
                                            font-size-14
                                            text-truncate
                                            mb-1
                                          "
                                        >
                                          {{ y.description }}
                                        </h5>
                                        <p class="text-muted mb-0">
                                          {{
                                            formatDateWithTime(
                                              new Date(y.dateTimeUploaded)
                                            )
                                          }}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </b-col>
                          </b-row>
                          <b-row
                            v-if="searchDocu(x).length == 0 && x.fileSearch"
                          >
                            <b-col>Search Not Found</b-col>
                          </b-row>
                        </div>
                      </b-card-body>
                    </b-collapse>
                  </b-card>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <!-- <div
          class="
            dataTables_paginate
            paging_simple_numbers
            d-flex
            flex-row-reverse
            pt-3
            pb-3
          "
        >
          <ul class="pagination pagination-rounded mb-0" style="z-index: -1">
            <b-pagination
              v-model="currentPage"
              :total-rows="rows"
              :per-page="perPage"
            ></b-pagination>
          </ul>
        </div> -->
      </div>
    </div>
    <Employee @dropData="dropEmployee($event)"></Employee>
  </Layout>
</template>
