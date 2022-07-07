<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { cloneDeep, groupBy } from "lodash";
import { required } from "vuelidate/lib/validators";
import { Carousel, Slide } from "vue-carousel";
import DatePicker from "vue2-datepicker";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import Employee from "@/components/modals/employee.vue";
import UploadPopover from "@/components/widgets/upload-popover.vue";

export default {
  page: {
    title: "Properties",
  },
  components: {
    Layout,
    PageHeader,
    Carousel,
    Slide,
    DatePicker,
    Employee,
    UploadPopover,
  },
  data() {
    return {
      title: "Properties",
      submitted: false,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Properties",
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
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: "",
      filterOn: [],
      sortBy: "poNumber",
      sortDesc: false,
      fields: [
        {
          key: "displayDetails",
          sortable: false,
          label: " ",
          thStyle: { width: "30px" },
        },
        {
          key: "poNumber",
          sortable: true,
          label: "Purchase Order",
        },
      ],
      propertyFields: [
        {
          key: "Name",
          sortable: true,
        },
      ],
      tableBusy: false,
      inspection: false,
      property: {},
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
  computed: {
    grouped() {
      var grouped = groupBy(this.tableData, "poNumber");
      var array = [];
      for (const key in grouped) {
        array.push({
          poNumber: key,
          details: grouped[key],
          showDetails: false,
          rotateChevy: false,
          currentPage: 1,
          filter: "",
          tableBusy: false,
        });
      }
      return array;
    },
    filtered() {
      let data = this.grouped;
      if (this.filter.trim() != "" && this.filter) {
        data = data.filter((x) => {
          if (x.poNumber.toUpperCase().includes(this.filter.toUpperCase()))
            return x.poNumber.toUpperCase().includes(this.filter.toUpperCase());
          else {
            var supplier = 0;
            x.details.forEach((y) => {
              if (y.supplier.toUpperCase().includes(this.filter.toUpperCase()))
                supplier++;
            });
            if (supplier > 0) return true;
          }
        });
      }
      return data;
    },
    rows() {
      if (this.filter.trim() != "" && this.filter) {
        return this.filtered.length;
      } else {
        return this.grouped.length;
      }
    },
  },
  created() {
    this.totalRows = this.items.length;
    this.tableBusy = true;
    this.$store
      .dispatch("property/GetPropertyPosted")
      .then((res) => {
        this.tableBusy = false;
        res.data.forEach((item) => {
          item.visible = false;
          item.itemVisible = false;
          item.assignmentHistory = [];
          item.assignVisible = false;
          item.inspectionVisible = false;
          item.attachmentVisible = false;
          item.addDocu = false;
          item.attachmentLoading = false;
          item.fileSearch = "";
          item.propertyInspections.forEach((inspect) => {
            inspect.inspectionFiles = [];
            inspect.attachmentVisible = false;
            inspect.addDocu = false;
            inspect.attachmentLoading = false;
            inspect.fileSearch = "";
          });
        });
        this.property = res.data[0];
        this.tableData = res.data;
      })
      .catch(() => {
        this.tableBusy = false;
        this.showToast("Something went wrong getting property list!", "error");
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
        this.form.inspectionDateTime = this.setDate(
          this.form.inspectionDateTime
        );
        if (this.editInspection === false) {
          this.$store
            .dispatch("propertyinspection/AddPropertyInspection", this.form)
            .then((res) => {
              if (res.data.error) {
                return this.showToast(res.data.errorMessage, "error");
              }
              this.showToast("Successfully created!", "success");
              res.data.inspectionFiles = [];
              res.data.attachmentVisible = false;
              res.data.addDocu = false;
              res.data.attachmentLoading = false;
              res.data.fileSearch = "";
              this.property.propertyInspections.push(res.data);
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
                return this.showToast(res.data.errorMessage, "error");
              }
              this.showToast("Successfully created!", "success");
              res.data.inspectionFiles = [];
              res.data.attachmentVisible = false;
              res.data.addDocu = false;
              res.data.attachmentLoading = false;
              res.data.fileSearch = "";
              var index = this.property.propertyInspections.findIndex(
                (item) => item.id == this.form.id
              );
              this.property.propertyInspections.splice(index, 1, res.data);
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
      var index = this.property.propertyInspections.indexOf(props);
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
              this.property.propertyInspections[index].status = "POSTED";
              this.showToast("Successfully Posted", "success");
            })
            .catch((err) => {
              this.showToast("Cannot be Posted!", "error");
            });
        }
      });
    },
    unpostItem(props) {
      var index = this.property.propertyInspections.indexOf(props);
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
              this.property.propertyInspections[index].status = "PENDING";
              this.showToast("Successfully Unposted", "success");
            })
            .catch((err) => {
              this.showToast("Cannot be Unposted!", "error");
            });
        }
      });
    },
    deleteItem(props) {
      var index = this.property.propertyInspections.indexOf(props);
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
                this.property.propertyInspections.splice(index, 1);
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
      this.onReset();
      this.form.propertyId = this.$route.params.id;
      this.editInspection = false;
      this.modalTitle = "Add Inspection";
      this.$bvModal.show("modal-standard");
    },
    updateInspection(props) {
      this.onReset();
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
    propertyFiltered(row) {
      let data = row.details;
      if (row.filter.trim() != "" && row.filter) {
        data = data.filter((x) => {
          if (x.name.toUpperCase().includes(row.filter.toUpperCase()))
            return x.name.toUpperCase().includes(row.filter.toUpperCase());
          else if (
            x.propertyNumber.toUpperCase().includes(row.filter.toUpperCase())
          )
            return x.propertyNumber
              .toUpperCase()
              .includes(row.filter.toUpperCase());
        });
      }
      return data;
    },
    propertyRows(row) {
      if (row.filter.trim() != "" && row.filter) {
        return this.propertyFiltered(row).length;
      } else {
        return row.details.length;
      }
    },
    viewInspect(row) {
      // this.$router.push(`/inspection/propertyInspection/${id}`);
      this.property = cloneDeep(row);
      this.property.propertyInspections.forEach((inspect) => {
        inspect.inspectionFiles = [];
        inspect.attachmentLoading = true;
        this.$store
          .dispatch("filemanager/GetFiles", {
            id: inspect.id,
            type: this.uploadOptions.type,
          })
          .then((res) => {
            inspect.attachmentLoading = false;
            inspect.inspectionFiles = res.data;
          })
          .catch(() => {
            inspect.attachmentLoading = false;
            this.showToast(
              "Something went wrong! - getting documents",
              "error"
            );
          });
      });
      this.inspection = true;
      this.$refs.carousel.goToPage(this.$refs.carousel.getNextPage());
    },
    returnToTable() {
      this.inspection = false;
      this.$refs.carousel.goToPage(this.$refs.carousel.getPreviousPage());
    },
    checkLength(array) {
      if (array?.length) return true;
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
    searchDtls(row) {
      row.item.rotateChevy = true;
      if (!row.item.showDetails) {
        row.toggleDetails();
        setTimeout(() => {
          row.item.showDetails = true;
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
    setAmount(amount) {
      return Intl.NumberFormat("ja-JP", {
        currency: "PHP",
        style: "currency",
      }).format(amount);
    },
    getAssignments(row) {
      row.assignVisible = !row.assignVisible;
      if (row.assignVisible) {
        row.assignmentHistory = [];
        this.$store
          .dispatch("propertyassignment/GetPropertyAssignment", row.id)
          .then((res) => {
            row.assignmentHistory = res.data;
          })
          .catch(() => {
            this.showToast(
              "Something went wrong! - getting assignments",
              "error"
            );
          });
      }
    },
    ifCurrent(id, current) {
      if (current) {
        if (id == current.id) return true;
      }
      return false;
    },
    uploadDocument(response, id) {
      var index = this.property.propertyInspections.findIndex(
        (x) => x.id == id
      );
      this.property.propertyInspections[index].inspectionFiles.push(response);
    },
    openDocument(x) {
      window.open(
        `${this.$store.state.data.rootFileDirectory}${x.folder}/${x.fileName}`
      );
    },
    searchDocu(row) {
      let data = row.propertyFiles;
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
        row.propertyFiles = [];
        row.fileSearch = "";
        row.attachmentLoading = true;
        this.$store
          .dispatch("filemanager/GetFiles", {
            id: row.id,
            type: "Property",
          })
          .then((res) => {
            row.attachmentLoading = false;
            row.propertyFiles = res.data;
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
              let index = this.property.propertyInspections.findIndex(
                (item) => item.id == parentId
              );
              let yIndex = this.property.propertyInspections[
                index
              ].inspectionFiles.findIndex((item) => item.id == id);
              this.property.propertyInspections[index].inspectionFiles.splice(
                yIndex,
                1
              );
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
    <div class="row">
      <div class="col-12">
        <carousel
          ref="carousel"
          class="events navs-carousel"
          id="timeline-carousel"
          :navigation-enabled="false"
          :pagination-enabled="false"
          :perPage="1"
          :autoplay="false"
          :minSwipeDistance="0"
          :mouseDrag="false"
        >
          <slide>
            <div v-if="!inspection">
              <div
                class="
                  card
                  border-4 border-top border-start-0 border-end-0 border-primary
                "
              >
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="d-flex align-items-center h-100">
                        <h5 class="mb-0">List of Properties</h5>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="d-flex float-end">
                        <div
                          id="tickets-table_filter"
                          class="dataTables_filter me-1"
                        >
                          <label class="d-inline-flex align-items-center">
                            <b-form-input
                              autocomplete="off"
                              v-model="filter"
                              type="search"
                              placeholder="Search PO / Supplier..."
                              class="form-control"
                            ></b-form-input>
                          </label>
                        </div>
                        <div
                          id="tickets-table_length"
                          class="dataTables_length"
                        >
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
                  </div>
                  <div class="table-responsive mb-0 mt-2">
                    <b-table
                      class="datatables target-table"
                      :items="filtered"
                      :fields="fields"
                      responsive="sm"
                      :per-page="perPage"
                      :current-page="currentPage"
                      :sort-by.sync="sortBy"
                      :sort-desc.sync="sortDesc"
                      :busy="tableBusy"
                      bordered
                      outlined
                      striped
                      show-empty
                    >
                      <template #empty="scope">
                        <div class="text-center">
                          {{ scope.emptyText }}
                        </div>
                      </template>
                      <template #table-busy>
                        <div
                          class="
                            d-flex
                            justify-content-center
                            align-items-center
                          "
                        >
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
                      <template #cell(poNumber)="row">
                        <div
                          class="
                            d-flex
                            justify-content-between
                            align-items-center
                          "
                        >
                          <div>
                            <b class="text-muted">{{ row.value }}</b>
                            <div>
                              {{ row.item.details[0].supplier }}
                            </div>
                          </div>
                          <div>
                            <label
                              class="d-inline-flex align-items-center m-0 p-0"
                            >
                              Search:
                              <b-form-input
                                autocomplete="off"
                                v-model="row.item.filter"
                                type="search"
                                placeholder="Search Property..."
                                @click="searchDtls(row)"
                                class="form-control form-control-sm ms-2"
                              ></b-form-input>
                            </label>
                          </div>
                        </div>
                      </template>
                      <template #cell(actions)="row">
                        <div
                          class="
                            d-flex
                            align-items-center
                            justify-content-end
                            cursor-pointer
                          "
                          @click="showDtls(row)"
                        >
                          <small v-if="!row.item.showDetails"
                            >Click here to expand</small
                          >
                          <i
                            class="bx bx-chevron-right rotate font-size-16"
                            :class="{
                              'rotate-90': row.item.rotateChevy,
                            }"
                          ></i>
                        </div>
                      </template>
                      <template #cell(displayDetails)="row">
                        <div
                          class="
                            mt-2
                            d-flex
                            align-items-center
                            justify-content-center
                          "
                          @click="showDtls(row)"
                        >
                          <i
                            class="
                              bx bx-chevron-right
                              rotate
                              font-size-16
                              cursor-pointer
                            "
                            :class="{
                              'rotate-90': row.item.rotateChevy,
                            }"
                          ></i>
                        </div>
                      </template>
                      <template #row-details="row">
                        <b-collapse :visible="row.item.showDetails">
                          <b-card
                            no-body
                            class="
                              p-3
                              shadow-none
                              mb-0
                              border-5 border-top-0 border-start-0 border-end-0
                            "
                          >
                            <!-- <div
                                  id="tickets-table_filter"
                                  class="dataTables_filter text-md-end"
                                >
                                  <label class="d-inline-flex align-items-center">
                                    Search:
                                    <b-form-input
                                      autocomplete="off"
                                      v-model="row.item.filter"
                                      type="search"
                                      placeholder="Search..."
                                      class="form-control form-control-sm ms-2"
                                    ></b-form-input>
                                  </label>
                                </div> -->
                            <div class="table-responsive mb-0">
                              <b-table
                                class="datatables target-table"
                                thead-class="d-none"
                                :items="propertyFiltered(row.item)"
                                :fields="propertyFields"
                                responsive="sm"
                                :per-page="5"
                                :current-page="row.item.currentPage"
                                sort-by="name"
                                :sort-desc="false"
                                :busy="row.item.tableBusy"
                                show-empty
                              >
                                <template #empty="scope">
                                  <div class="text-center">
                                    {{ scope.emptyText }}
                                  </div>
                                </template>
                                <template #table-busy>
                                  <div
                                    class="
                                      d-flex
                                      justify-content-center
                                      align-items-center
                                    "
                                  >
                                    <div class="preloader-component me-2">
                                      <div class="status">
                                        <div
                                          class="spinner-chase w-20px h-20px"
                                        >
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
                                <template #cell(name)="propertyRow">
                                  <b-card-header
                                    header-tag="header"
                                    role="tab"
                                    class="border"
                                  >
                                    <div
                                      class="
                                        d-flex
                                        justify-content-between
                                        align-items-center
                                      "
                                    >
                                      <div
                                        style="width: 70%"
                                        class="d-flex align-items-center"
                                      >
                                        <div
                                          style="min-width: 30px"
                                          class="
                                            bg-success bg-gradient
                                            text-center
                                            me-2
                                            py-1
                                            position-relative
                                          "
                                        >
                                          <h3 class="mb-0 position-relative">
                                            {{ propertyRow.index + 1 }}
                                          </h3>
                                        </div>
                                        <div class="text-muted">
                                          <h5 class="mb-0">
                                            {{ propertyRow.item.name }}
                                          </h5>
                                          <div>
                                            <small
                                              class="d-flex align-items-center"
                                              >{{
                                                propertyRow.item.propertyNumber
                                              }}
                                              |
                                              <a
                                                href="javascript: void(0);"
                                                class="
                                                  text-success
                                                  d-flex
                                                  align-items-center
                                                  ms-1
                                                "
                                                @click="
                                                  propertyRow.item.visible =
                                                    !propertyRow.item.visible
                                                "
                                              >
                                                {{
                                                  propertyRow.item.visible
                                                    ? "Hide"
                                                    : "Show"
                                                }}
                                                Details
                                                <i
                                                  class="
                                                    bx bx-chevron-right
                                                    rotate
                                                    font-size-14
                                                  "
                                                  :class="{
                                                    'rotate-90':
                                                      propertyRow.item.visible,
                                                  }"
                                                ></i>
                                              </a>
                                            </small>
                                          </div>
                                        </div>
                                      </div>
                                      <div
                                        style="width: 30%"
                                        class="d-flex align-items-center"
                                      >
                                        <div
                                          v-for="assignment in propertyRow.item
                                            .propertyAssignments"
                                          :key="assignment.id"
                                          class="text-muted"
                                        >
                                          <div>
                                            <small
                                              class="d-flex align-items-center"
                                            >
                                              Assigned Officer:
                                            </small>
                                          </div>
                                          <h6 class="mb-0">
                                            {{
                                              assignment.employee.lastName
                                                .charAt(0)
                                                .toUpperCase() +
                                              assignment.employee.lastName.slice(
                                                1
                                              )
                                            }},
                                            {{
                                              assignment.employee.firstName
                                                .charAt(0)
                                                .toUpperCase() +
                                              assignment.employee.firstName.slice(
                                                1
                                              )
                                            }}
                                            {{
                                              assignment.employee.middleName
                                                ? `${assignment.employee.middleName
                                                    .charAt(0)
                                                    .toUpperCase()}.`
                                                : ""
                                            }}
                                          </h6>
                                        </div>
                                      </div>
                                      <div
                                        class="
                                          float-end
                                          d-flex
                                          align-items-center
                                        "
                                      >
                                        <button
                                          type="button"
                                          @click="viewInspect(propertyRow.item)"
                                          style="width: max-content"
                                          class="
                                            btn btn-sm btn-info
                                            d-flex
                                            align-items-center
                                          "
                                        >
                                          View Inspection<i
                                            class="mdi mdi-arrow-right ms-1"
                                          ></i>
                                        </button>
                                      </div>
                                    </div>
                                  </b-card-header>
                                  <b-collapse
                                    :visible="propertyRow.item.visible"
                                    role="tabpanel"
                                  >
                                    <!-- Details -->
                                    <b-card-body class="border">
                                      <div
                                        class="
                                          d-flex
                                          align-items-center
                                          justify-content-between
                                          cursor-pointer
                                        "
                                        @click="
                                          propertyRow.item.itemVisible =
                                            !propertyRow.item.itemVisible
                                        "
                                      >
                                        <h6 class="mb-0">
                                          <i class="bx bx-menu-alt-right"></i>
                                          Property Details
                                        </h6>
                                        <h5 class="mb-0">
                                          <i
                                            class="bx bx-chevron-right rotate"
                                            :class="{
                                              'rotate-90':
                                                propertyRow.item.itemVisible,
                                            }"
                                          ></i>
                                        </h5>
                                      </div>
                                    </b-card-body>
                                    <b-collapse
                                      :visible="propertyRow.item.itemVisible"
                                      role="tabpanel"
                                    >
                                      <b-card-body class="border">
                                        <b-row>
                                          <b-col sm="6">
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Property Name:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item.name
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Property Specification:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item.specification
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Color:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item.color
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Dimension Description:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item
                                                  .dimensionDescription
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Material Used:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item.materialUsed
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Package Description:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item
                                                  .packageDescription
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Property Number:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item.propertyNumber
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Serial Number:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item.serialNumber
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right"
                                                ><b>Date Acquired:</b></b-col
                                              >
                                              <b-col>{{
                                                formatDate(
                                                  new Date(
                                                    propertyRow.item.dateAcquired
                                                  )
                                                )
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Amount:</b>
                                              </b-col>
                                              <b-col>{{
                                                setAmount(
                                                  propertyRow.item.amount
                                                )
                                              }}</b-col>
                                            </b-row>
                                          </b-col>
                                          <b-col
                                            sm="6"
                                            class="border-start border-3"
                                          >
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right"
                                                ><b
                                                  >Life Span in Years:</b
                                                ></b-col
                                              >
                                              <b-col>{{
                                                propertyRow.item.lifespanInYears
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Yearly Depreciation:</b>
                                              </b-col>
                                              <b-col>{{
                                                setAmount(
                                                  propertyRow.item
                                                    .yearlyDepreciation
                                                )
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Salvage Value:</b>
                                              </b-col>
                                              <b-col>{{
                                                setAmount(
                                                  propertyRow.item.salvageValue
                                                )
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right"
                                                ><b>Item Category:</b></b-col
                                              >
                                              <b-col>{{
                                                propertyRow.item.itemCategory
                                                  .name
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Supplier:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item.supplier
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right"
                                                ><b>PO Number:</b></b-col
                                              >
                                              <b-col>{{
                                                propertyRow.item.poNumber
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Notes:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item.note
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Brand:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item.brand
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Property Condition:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item.condition
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Model:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item.model
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right"
                                                ><b>Fund Cluster:</b></b-col
                                              >
                                              <b-col>{{
                                                propertyRow.item.fundCluster
                                              }}</b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                              <b-col sm="4" class="text-right">
                                                <b>Unit:</b>
                                              </b-col>
                                              <b-col>{{
                                                propertyRow.item.unit
                                              }}</b-col>
                                            </b-row>
                                          </b-col>
                                        </b-row>
                                      </b-card-body>
                                    </b-collapse>
                                    <!-- Assignment History -->
                                    <b-card-body class="border">
                                      <div
                                        class="
                                          d-flex
                                          align-items-center
                                          justify-content-between
                                          cursor-pointer
                                        "
                                        @click="
                                          getAssignments(propertyRow.item)
                                        "
                                      >
                                        <h6 class="mb-0">
                                          <i class="bx bx-user"></i>
                                          Assignment History
                                        </h6>
                                        <h5 class="mb-0">
                                          <i
                                            class="bx bx-chevron-right rotate"
                                            :class="{
                                              'rotate-90':
                                                propertyRow.item.assignVisible,
                                            }"
                                          ></i>
                                        </h5>
                                      </div>
                                    </b-card-body>
                                    <b-collapse
                                      :visible="propertyRow.item.assignVisible"
                                      role="tabpanel"
                                    >
                                      <b-card-body
                                        v-if="
                                          propertyRow.item.assignmentHistory
                                            .length == 0
                                        "
                                        class="border"
                                      >
                                        <div
                                          class="
                                            d-flex
                                            align-items-center
                                            justify-content-between
                                            mb-3
                                          "
                                        >
                                          <p class="mb-0">
                                            <i>No prior history</i>
                                          </p>
                                        </div>
                                      </b-card-body>
                                      <b-card-body
                                        v-else
                                        class="text-muted border"
                                      >
                                        <ul
                                          class="
                                            verti-timeline
                                            list-unstyled
                                            ms-4
                                            mb-4
                                          "
                                          v-for="y in propertyRow.item
                                            .assignmentHistory"
                                          :key="y.id"
                                        >
                                          <li
                                            class="event-list"
                                            :class="{
                                              active: ifCurrent(
                                                y.id,
                                                propertyRow.item
                                                  .currentAssignment
                                              ),
                                            }"
                                          >
                                            <div class="event-timeline-dot">
                                              <i
                                                v-if="
                                                  ifCurrent(
                                                    y.id,
                                                    propertyRow.item
                                                      .currentAssignment
                                                  )
                                                "
                                                class="
                                                  bx
                                                  bxs-right-arrow-circle
                                                  font-size-18
                                                  bx-fade-right
                                                "
                                              ></i>
                                              <i
                                                v-else
                                                class="
                                                  bx bx-right-arrow-circle
                                                  font-size-18
                                                "
                                              ></i>
                                            </div>
                                            <div class="media">
                                              <div
                                                class="
                                                  d-flex
                                                  justify-content-between
                                                  align-items-top
                                                  ms-4
                                                  me-3
                                                "
                                                style="width: 200px"
                                              >
                                                <div>
                                                  <div>
                                                    <b class="font-size-16">
                                                      {{
                                                        y.employee.lastName
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                        y.employee.lastName.slice(
                                                          1
                                                        )
                                                      }},
                                                    </b>
                                                  </div>
                                                  <div>
                                                    <b class="font-size-16">
                                                      {{
                                                        y.employee.firstName
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                        y.employee.firstName.slice(
                                                          1
                                                        )
                                                      }}
                                                      {{
                                                        y.employee.middleName
                                                          ? `${y.employee.middleName
                                                              .charAt(0)
                                                              .toUpperCase()}.`
                                                          : ""
                                                      }}
                                                    </b>
                                                  </div>
                                                </div>
                                                <div>
                                                  <i
                                                    class="
                                                      bx bx-right-arrow-alt
                                                      font-size-16
                                                      text-info
                                                      align-middle
                                                      ms-2
                                                    "
                                                  ></i>
                                                </div>
                                              </div>
                                              <div class="media-body">
                                                <div class="font-size-12 mb-1">
                                                  Assignment Type:
                                                  <b class="font-size-14">{{
                                                    y.assignmentType
                                                  }}</b>
                                                </div>
                                                <div class="font-size-12 mb-1">
                                                  Date Assigned:
                                                  <b
                                                    class="
                                                      font-size-14
                                                      text-success
                                                    "
                                                    >{{
                                                      formatDate(
                                                        new Date(y.dateAssigned)
                                                      )
                                                    }}</b
                                                  >
                                                </div>
                                                <div class="font-size-12 mb-1">
                                                  Date Returned:
                                                  <b
                                                    v-if="
                                                      y.dateReturned ==
                                                      '0001-01-01T00:00:00'
                                                    "
                                                    class="font-size-14"
                                                  >
                                                    N/A
                                                  </b>
                                                  <b
                                                    v-else
                                                    class="
                                                      font-size-14
                                                      text-danger
                                                    "
                                                    >{{
                                                      formatDate(
                                                        new Date(y.dateReturned)
                                                      )
                                                    }}</b
                                                  >
                                                </div>
                                                <div class="font-size-12 mb-1">
                                                  Location:
                                                  <b class="font-size-14">{{
                                                    y.propertyLocation.location
                                                  }}</b>
                                                </div>
                                                <div class="font-size-12 mb-1">
                                                  Location Code:
                                                  <b class="font-size-14">{{
                                                    y.propertyLocation
                                                      .locationCode
                                                  }}</b>
                                                </div>
                                              </div>
                                            </div>
                                          </li>
                                        </ul>
                                      </b-card-body>
                                    </b-collapse>
                                    <!-- Attachments -->
                                    <b-card-body class="border">
                                      <div
                                        class="
                                          d-flex
                                          align-items-center
                                          justify-content-between
                                          cursor-pointer
                                        "
                                        @click="
                                          getAttachments(propertyRow.item)
                                        "
                                      >
                                        <h6 class="mb-0">
                                          <i
                                            class="
                                              bx bx-paperclip
                                              rotate rotate-90
                                            "
                                          ></i>
                                          Attachments
                                        </h6>
                                        <h5 class="mb-0">
                                          <i
                                            class="bx bx-chevron-right rotate"
                                            :class="{
                                              'rotate-90':
                                                propertyRow.item
                                                  .attachmentVisible,
                                            }"
                                          ></i>
                                        </h5>
                                      </div>
                                    </b-card-body>
                                    <b-collapse
                                      :visible="
                                        propertyRow.item.attachmentVisible
                                      "
                                      role="tabpanel"
                                    >
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
                                              v-if="
                                                propertyRow.item.propertyFiles
                                                  .length == 0
                                              "
                                            >
                                              <i>No documents found</i>
                                            </p>
                                            <input
                                              v-if="
                                                propertyRow.item.propertyFiles
                                                  .length > 0
                                              "
                                              type="search"
                                              class="form-control"
                                              v-model="
                                                propertyRow.item.fileSearch
                                              "
                                              placeholder="Search Documents..."
                                            />
                                          </div>
                                          <!-- <div class="">
                                            <a href="javascript:void(0);" class="
                                                text-primary
                                                border-primary border
                                                p-2
                                              " :id="`posted-document${propertyRow.item.id}`" @click="
                                                propertyRow.item.addDocu = true
                                              "><i class="bx bx-plus"></i>Upload
                                              Documents</a>
                                            <upload-popover :option="uploadOptions" :sourceId="propertyRow.item.id"
                                              @uploaded="
                                                uploadDocument(
                                                  $event,
                                                  propertyRow.item.id
                                                )
                                              " :showPV="propertyRow.item.addDocu" @closePopover="
  propertyRow.item.addDocu = false
" :dzId="`dropzone-posted${propertyRow.item.id}`"
                                              :pvId="`posted-document${propertyRow.item.id}`"></upload-popover>
                                          </div> -->
                                        </div>
                                        <div class="mt-2">
                                          <b-row>
                                            <b-col
                                              sm="3"
                                              v-for="(y, index) in searchDocu(
                                                propertyRow.item
                                              )"
                                              :key="y.id"
                                              class="mb-2"
                                            >
                                              <div
                                                class="
                                                  position-relative
                                                  cursor-pointer
                                                "
                                                :style="`z-index: ${
                                                  propertyRow.item.propertyFiles
                                                    .length - index
                                                }`"
                                              >
                                                <div
                                                  class="border p-3"
                                                  @click="openDocument(y)"
                                                >
                                                  <div>
                                                    <!-- <div class="float-end ms-2">
                                                      <b-dropdown id="dropdown-dropleft" right variant="link"
                                                        toggle-class="text-decoration-none text-dark font-size-16 pt-0"
                                                        menu-class="dropdown-menu-end" no-caret>
                                                        <template #button-content>
                                                          <i class="
                                                              mdi
                                                              mdi-dots-horizontal
                                                            "></i>
                                                        </template>
                                                        <b-dropdown-item @click="
                                                          openDocument(y)
                                                        "><i class="
                                                              bx
                                                              bx-link-external
                                                              me-1
                                                            "></i>Open</b-dropdown-item>
                                                        <b-dropdown-item variant="danger" @click="
                                                          removeFile(
                                                            y.id,
                                                            propertyRow.item
                                                              .id
                                                          )
                                                        "><i class="
                                                              bx bx-trash
                                                              me-1
                                                            "></i>Remove</b-dropdown-item>
                                                      </b-dropdown>
                                                    </div> -->
                                                    <div
                                                      class="
                                                        avatar-xs
                                                        me-3
                                                        mb-2
                                                      "
                                                    >
                                                      <div
                                                        class="
                                                          avatar-title
                                                          bg-transparent
                                                          rounded
                                                        "
                                                      >
                                                        <i
                                                          v-if="
                                                            y.fileType.includes(
                                                              'image'
                                                            )
                                                          "
                                                          class="
                                                            mdi mdi-image
                                                            font-size-24
                                                            text-purple
                                                          "
                                                        ></i>
                                                        <i
                                                          v-if="
                                                            y.fileType.includes(
                                                              'application'
                                                            )
                                                          "
                                                          class="
                                                            mdi
                                                            mdi-file-pdf-outline
                                                            font-size-24
                                                            text-danger
                                                          "
                                                        ></i>
                                                      </div>
                                                    </div>
                                                    <div class="d-flex">
                                                      <div
                                                        class="
                                                          overflow-hidden
                                                          me-auto
                                                        "
                                                      >
                                                        <h5
                                                          class="
                                                            font-size-14
                                                            text-truncate
                                                            mb-1
                                                          "
                                                        >
                                                          {{ y.description }}
                                                        </h5>
                                                        <p
                                                          class="
                                                            text-muted
                                                            mb-0
                                                          "
                                                        >
                                                          {{
                                                            formatDateWithTime(
                                                              new Date(
                                                                y.dateTimeUploaded
                                                              )
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
                                            v-if="
                                              searchDocu(propertyRow.item)
                                                .length == 0 &&
                                              propertyRow.item.fileSearch
                                            "
                                          >
                                            <b-col>Search Not Found</b-col>
                                          </b-row>
                                        </div>
                                      </b-card-body>
                                    </b-collapse>
                                  </b-collapse>
                                </template>
                              </b-table>
                            </div>
                            <div class="row">
                              <div class="col">
                                <div
                                  class="
                                    dataTables_paginate
                                    paging_simple_numbers
                                    float-end
                                  "
                                >
                                  <ul
                                    class="pagination pagination-rounded mb-0"
                                    style="z-index: -1"
                                  >
                                    <b-pagination
                                      v-model="row.item.currentPage"
                                      :total-rows="propertyRows(row.item)"
                                      :per-page="5"
                                    ></b-pagination>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </b-card>
                        </b-collapse>
                      </template>
                    </b-table>
                  </div>
                  <div class="row">
                    <div class="col">
                      <div
                        class="
                          dataTables_paginate
                          paging_simple_numbers
                          float-end
                        "
                      >
                        <ul
                          class="pagination pagination-rounded mb-0"
                          style="z-index: -1"
                        >
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
          </slide>
          <slide>
            <div v-if="inspection">
              <b-modal
                id="modal-standard"
                :title="modalTitle"
                size="md"
                title-class="font-18"
                hide-footer
              >
                <form
                  @submit.prevent="onAdd"
                  class="needs-validation"
                  ref="fcForm"
                >
                  <div class="mb-3">
                    <label for="inspectionDateTime">Inspection Date</label>
                    <date-picker
                      v-model="form.inspectionDateTime"
                      :first-day-of-week="1"
                      lang="en"
                      placeholder="Enter Inspection Date..."
                      :class="{
                        'is-invalid':
                          submitted && $v.form.inspectionDateTime.$error,
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
                        'is-invalid':
                          submitted && $v.form.propertyStatus.$error,
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
                        'is-invalid':
                          submitted && $v.form.inspectionStatus.$error,
                      }"
                      v-model="form.inspectionStatus"
                    >
                      <b-form-select-option value="" disabled
                        >Select Property Status...</b-form-select-option
                      >
                      <b-form-select-option value="Verified"
                        >Verified</b-form-select-option
                      >
                      <b-form-select-option value="Missing"
                        >Missing</b-form-select-option
                      >
                      <b-form-select-option value="Non-Existent"
                        >Non-Existent</b-form-select-option
                      >
                      <b-form-select-option value="Others"
                        >Others</b-form-select-option
                      >
                    </b-form-select>
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
                    <button type="submit" class="btn btn-primary">
                      Save changes
                    </button>
                  </div>
                </form>
              </b-modal>
              <b-row class="mb-2">
                <b-col sm="6">
                  <div class="d-flex align-items-center">
                    <a
                      href="javascript:void(0);"
                      class="me-1"
                      @click="returnToTable()"
                      ><i class="bx bx-left-arrow-alt fs-2"></i
                    ></a>
                    <h4>Inspection History</h4>
                  </div>
                </b-col>
                <b-col sm="6">
                  <button
                    type="button"
                    @click="createInspection()"
                    class="
                      btn btn-md btn-info
                      d-flex
                      align-items-center
                      float-end
                    "
                  >
                    <i class="bx bx-plus fs-6"></i>Create New
                  </button>
                </b-col>
              </b-row>
              <div
                class="
                  card
                  border-4 border-top border-start-0 border-end-0 border-primary
                "
              >
                <div class="card-body">
                  <div class="mb-3">
                    <h3 class="mb-1">{{ property.name }}</h3>
                    <div class="row">
                      <div class="col-md-4">
                        <div class="d-flex align-items-center">
                          Condition:
                          <h6 class="mb-0 ms-2">{{ property.condition }}</h6>
                        </div>
                        <div class="d-flex align-items-center">
                          Life Span:
                          <h6 class="mb-0 ms-2">
                            {{ property.lifespanInYears }} Year/s
                          </h6>
                        </div>
                        <div class="d-flex align-items-center">
                          Yearly Depreciation:
                          <h6 class="mb-0 ms-2">
                            {{ setAmount(property.yearlyDepreciation) }}
                          </h6>
                        </div>
                        <div class="d-flex align-items-center">
                          Salvage Value:
                          <h6 class="mb-0 ms-2">
                            {{ setAmount(property.salvageValue) }}
                          </h6>
                        </div>
                      </div>
                      <div class="col-md-8">
                        <div class="d-flex align-items-center">
                          Amount:
                          <h6 class="mb-0 ms-2">
                            {{ setAmount(property.amount) }}
                          </h6>
                        </div>
                        <div class="d-flex align-items-center">
                          Brand:
                          <h6 class="mb-0 ms-2">
                            {{ property.brand }}
                          </h6>
                        </div>
                        <div class="d-flex align-items-center">
                          Categoty:
                          <h6 class="mb-0 ms-2">
                            {{ property.itemCategory.name }}
                          </h6>
                        </div>
                        <div class="d-flex align-items-center">
                          Supplier:
                          <h6 class="mb-0 ms-2">{{ property.supplier }}</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="
                      h-50vh
                      d-flex
                      align-items-center
                      justify-content-center
                    "
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
                    class="
                      h-50vh
                      d-flex
                      align-items-center
                      justify-content-center
                    "
                    v-else-if="!checkLength(property.propertyInspections)"
                  >
                    <h5 class="text-muted">
                      <i class="fas fa-exclamation-triangle me-2"></i>No Data
                      Found
                    </h5>
                  </div>
                  <b-card-body class="text-muted">
                    <ul
                      class="verti-timeline list-unstyled ms-4 mb-3"
                      v-for="y in property.propertyInspections"
                      :key="y.id"
                    >
                      <li
                        class="event-list"
                        :class="{
                          active: y.status == 'PENDING',
                        }"
                      >
                        <div class="event-timeline-dot pt-3">
                          <i
                            v-if="y.status == 'PENDING'"
                            class="
                              bx
                              bxs-right-arrow-circle
                              font-size-18
                              bx-fade-right
                            "
                          ></i>
                          <i
                            v-else
                            class="bx bx-right-arrow-circle font-size-18"
                          ></i>
                        </div>
                        <div class="media">
                          <div
                            class="
                              d-flex
                              justify-content-between
                              align-items-center
                              pt-3
                              ms-4
                              me-3
                            "
                            style="width: 125px"
                          >
                            <div>
                              <b class="font-size-16">
                                {{
                                  formatDateShort(
                                    new Date(y.inspectionDateTime)
                                  )
                                }}
                              </b>
                            </div>
                            <div>
                              <i
                                class="
                                  bx bx-right-arrow-alt
                                  font-size-16
                                  text-info
                                  align-middle
                                  ms-2
                                "
                              ></i>
                            </div>
                          </div>
                          <div class="media-body">
                            <div class="card p-3">
                              <div class="row">
                                <div class="col-md-4 border-end border-3">
                                  <div class="float-end ms-2">
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
                                      <b-dropdown-item
                                        v-if="y.status == 'PENDING'"
                                        @click="updateInspection(y)"
                                        variant="info"
                                        ><i
                                          class="
                                            mdi mdi-update
                                            font-size-18
                                            me-1
                                          "
                                        ></i
                                        >Update Inspection</b-dropdown-item
                                      >
                                      <b-dropdown-item
                                        variant="success"
                                        v-if="y.status == 'PENDING'"
                                        @click="postItem(y)"
                                        ><i
                                          class="
                                            bx bx-check-circle
                                            font-size-18
                                            me-1
                                          "
                                        ></i
                                        >Post Inspection</b-dropdown-item
                                      >
                                      <b-dropdown-item
                                        variant="warning"
                                        v-if="y.status == 'POSTED'"
                                        @click="unpostItem(y)"
                                        ><i
                                          class="
                                            bx bx-x-circle
                                            font-size-18
                                            me-1
                                          "
                                        ></i
                                        >Unpost Inspection</b-dropdown-item
                                      >
                                      <b-dropdown-item
                                        variant="danger"
                                        v-if="y.status == 'PENDING'"
                                        @click="deleteItem(y)"
                                        ><i
                                          class="
                                            mdi mdi-trash-can
                                            font-size-18
                                            me-1
                                          "
                                        ></i
                                        >Delete</b-dropdown-item
                                      >
                                    </b-dropdown>
                                  </div>
                                  <div class="font-size-12 mb-1">
                                    Property Status:
                                    <b class="font-size-14">{{
                                      y.propertyStatus
                                    }}</b>
                                  </div>
                                  <div class="font-size-12 mb-1">
                                    Assessed Value:
                                    <b class="font-size-14">{{
                                      y.assessedValue
                                    }}</b>
                                  </div>
                                  <div class="font-size-12 mb-1">
                                    Inspection Status:
                                    <b class="font-size-14">{{
                                      y.inspectionStatus
                                    }}</b>
                                  </div>
                                  <div class="font-size-12 mb-1">
                                    Inspected By:
                                    <b v-if="y.employee" class="font-size-14">
                                      {{
                                        y.employee.firstName
                                          .charAt(0)
                                          .toUpperCase() +
                                        y.employee.firstName.slice(1)
                                      }}
                                      {{
                                        y.employee.middleName
                                          ? `${y.employee.middleName
                                              .charAt(0)
                                              .toUpperCase()}.`
                                          : ""
                                      }}
                                      {{
                                        y.employee.lastName
                                          .charAt(0)
                                          .toUpperCase() +
                                        y.employee.lastName.slice(1)
                                      }}</b
                                    >
                                    <b v-else class="font-size-14">n/a</b>
                                  </div>
                                  <div class="font-size-16 mb-1">
                                    <span
                                      v-if="y.status == 'PENDING'"
                                      class="
                                        badge
                                        bg-warning bg-soft
                                        text-warning
                                      "
                                      ><b>{{ y.status }}</b></span
                                    >
                                    <span
                                      v-if="y.status == 'POSTED'"
                                      class="badge bg-success"
                                      ><b>{{ y.status }}</b></span
                                    >
                                  </div>
                                </div>
                                <div class="col-md-8">
                                  <div
                                    class="
                                      d-flex
                                      align-items-center
                                      justify-content-between
                                      mb-3
                                    "
                                  >
                                    <div class="d-flex">
                                      <div class="font-size-13 pt-3">
                                        Attachments:
                                      </div>
                                    </div>
                                    <div class="">
                                      <a
                                        href="javascript:void(0);"
                                        class="
                                          text-primary
                                          border-primary border
                                          p-2
                                        "
                                        :id="`posted-document${y.id}`"
                                        @click="y.addDocu = true"
                                        ><i class="bx bx-plus"></i>Upload
                                        Documents</a
                                      >
                                      <upload-popover
                                        :option="uploadOptions"
                                        :sourceId="y.id"
                                        @uploaded="uploadDocument($event, y.id)"
                                        :showPV="y.addDocu"
                                        @closePopover="y.addDocu = false"
                                        :dzId="`dropzone-posted${y.id}`"
                                        :pvId="`posted-document${y.id}`"
                                      ></upload-popover>
                                    </div>
                                  </div>
                                  <b-row
                                    style="max-height: 250px; overflow: auto"
                                  >
                                    <b-col
                                      sm="4"
                                      v-for="(z, index) in y.inspectionFiles"
                                      :key="z.id"
                                      class="mb-2"
                                    >
                                      <div
                                        class="position-relative cursor-pointer"
                                        :style="`z-index: ${
                                          y.inspectionFiles.length - index
                                        }`"
                                      >
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
                                              @click="openDocument(z)"
                                              ><i
                                                class="bx bx-link-external me-1"
                                              ></i
                                              >Open</b-dropdown-item
                                            >
                                            <b-dropdown-item
                                              variant="danger"
                                              @click="removeFile(z.id, y.id)"
                                              ><i class="bx bx-trash me-1"></i
                                              >Remove</b-dropdown-item
                                            >
                                          </b-dropdown>
                                        </div>
                                        <div
                                          class="border p-3"
                                          @click="openDocument(z)"
                                        >
                                          <div>
                                            <div class="avatar-xs me-3 mb-2">
                                              <div
                                                class="
                                                  avatar-title
                                                  bg-transparent
                                                  rounded
                                                "
                                              >
                                                <i
                                                  v-if="
                                                    z.fileType.includes('image')
                                                  "
                                                  class="
                                                    mdi mdi-image
                                                    font-size-24
                                                    text-purple
                                                  "
                                                ></i>
                                                <i
                                                  v-if="
                                                    z.fileType.includes(
                                                      'application'
                                                    )
                                                  "
                                                  class="
                                                    mdi mdi-file-pdf-outline
                                                    font-size-24
                                                    text-danger
                                                  "
                                                ></i>
                                              </div>
                                            </div>
                                            <div class="d-flex">
                                              <div
                                                class="overflow-hidden me-auto"
                                              >
                                                <h5
                                                  class="
                                                    font-size-14
                                                    text-truncate
                                                    mb-1
                                                  "
                                                >
                                                  {{ z.description }}
                                                </h5>
                                                <p class="text-muted mb-0">
                                                  {{
                                                    formatDateWithTime(
                                                      new Date(
                                                        z.dateTimeUploaded
                                                      )
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
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </b-card-body>
                </div>
              </div>
              <Employee @dropData="dropEmployee($event)"></Employee>
            </div>
          </slide>
        </carousel>
      </div>
    </div>
  </Layout>
</template>
