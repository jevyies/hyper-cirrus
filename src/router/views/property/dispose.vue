<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { cloneDeep, groupBy } from "lodash";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import UploadPopover from "@/components/widgets/upload-popover.vue";

export default {
  page: {
    title: "For Disposal",
  },
  components: {
    Layout,
    PageHeader,
    UploadPopover,
  },
  data() {
    return {
      title: "For Disposal",
      submitted: false,
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "For Disposal",
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
        // {
        //   key: "supplier",
        //   sortable: true,
        //   label: "Supplier",
        // },
        // {
        //   key: "actions",
        //   thStyle: { width: "150px" },
        // },
      ],
      propertyFields: [
        {
          key: "Name",
          sortable: true,
        },
      ],
      indexSelected: -1,
      tableBusy: false,
      editMode: false,
      itemCategory: "",
      uploadOptions: {
        type: "Property",
        placement: "lefttop",
        folder: "Property",
      },
    };
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
      .dispatch("property/GetPropertyDisposed")
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
            inspect.attachmentLoading = false;
          });
        });
        this.tableData = res.data;
      })
      .catch(() => {
        this.tableBusy = false;
        this.showToast(
          "Something went wrong getting disposed property list!",
          "error"
        );
      });
  },
  methods: {
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
            .dispatch("property/DeleteProperty", props.id)
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
    getInspectionAttachments(row) {
      row.inspectionVisible = !row.inspectionVisible;
      if (row.inspectionVisible) {
        row.propertyInspections.forEach((inspect) => {
          inspect.inspectionFiles = [];
          inspect.attachmentLoading = true;
          this.$store
            .dispatch("filemanager/GetFiles", {
              id: inspect.id,
              type: "Property Inspection",
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
      }
    },
    uploadDocument(response, id) {
      var index = this.tableData.findIndex((x) => x.id == id);
      this.tableData[index].propertyFiles.push(response);
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
            type: this.uploadOptions.type,
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
              let index = this.tableData.findIndex(
                (item) => item.id == parentId
              );
              let yIndex = this.tableData[index].propertyFiles.findIndex(
                (item) => item.id == id
              );
              this.tableData[index].propertyFiles.splice(yIndex, 1);
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
                  <h5 class="mb-0">List of Disposed Properties</h5>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex float-end">
                  <div id="tickets-table_filter" class="dataTables_filter me-1">
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
                striped
                show-empty
              >
                <template #empty="scope">
                  <div class="text-center">
                    {{ scope.emptyText }}
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
                <template #cell(poNumber)="row">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <b class="text-muted">{{ row.value }}</b>
                      <div>
                        {{ row.item.details[0].supplier }}
                      </div>
                    </div>
                    <div>
                      <label class="d-inline-flex align-items-center m-0 p-0">
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
                  <!-- <div class="float-end">
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
                      <b-dropdown-item @click="showDtls(row)"
                        ><i class="bx bxs-book-content font-size-18 me-1"></i
                        >{{
                          row.detailsShowing ? "Hide" : "Show"
                        }}
                        Details</b-dropdown-item
                      >
                    </b-dropdown>
                  </div> -->

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
                                      <small class="d-flex align-items-center"
                                        >{{ propertyRow.item.propertyNumber }}
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
                                <!-- <div
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
                                      <small class="d-flex align-items-center">
                                        Assigned Officer:
                                      </small>
                                    </div>
                                    <h6 class="mb-0">
                                      {{
                                        assignment.employee.lastName
                                          .charAt(0)
                                          .toUpperCase() +
                                        assignment.employee.lastName.slice(1)
                                      }},
                                      {{
                                        assignment.employee.firstName
                                          .charAt(0)
                                          .toUpperCase() +
                                        assignment.employee.firstName.slice(1)
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
                                </div> -->
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
                                          propertyRow.item.dimensionDescription
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
                                          propertyRow.item.packageDescription
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
                                          setAmount(propertyRow.item.amount)
                                        }}</b-col>
                                      </b-row>
                                    </b-col>
                                    <b-col sm="6" class="border-start border-3">
                                      <b-row class="mb-2">
                                        <b-col sm="4" class="text-right"
                                          ><b>Life Span in Yrs:</b></b-col
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
                                            propertyRow.item.yearlyDepreciation
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
                                          propertyRow.item.itemCategory.name
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
                                  @click="getAssignments(propertyRow.item)"
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
                                    propertyRow.item.assignmentHistory.length ==
                                    0
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
                                <b-card-body v-else class="text-muted border">
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
                                          propertyRow.item.currentAssignment
                                        ),
                                      }"
                                    >
                                      <div class="event-timeline-dot">
                                        <i
                                          v-if="
                                            ifCurrent(
                                              y.id,
                                              propertyRow.item.currentAssignment
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
                                                  y.employee.lastName.slice(1)
                                                }},
                                              </b>
                                            </div>
                                            <div>
                                              <b class="font-size-16">
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
                                              class="font-size-14 text-success"
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
                                              class="font-size-14 text-danger"
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
                                              y.propertyLocation.locationCode
                                            }}</b>
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                  </ul>
                                </b-card-body>
                              </b-collapse>
                              <!-- Inspection History -->
                              <!-- Inspection History -->
                              <b-card-body class="border">
                                <div
                                  class="
                                    d-flex
                                    align-items-center
                                    justify-content-between
                                    cursor-pointer
                                  "
                                  @click="
                                    getInspectionAttachments(propertyRow.item)
                                  "
                                >
                                  <h6 class="mb-0">
                                    <i class="bx bx-show"></i>
                                    Inspection History
                                  </h6>
                                  <h5 class="mb-0">
                                    <i
                                      class="bx bx-chevron-right rotate"
                                      :class="{
                                        'rotate-90':
                                          propertyRow.item.inspectionVisible,
                                      }"
                                    ></i>
                                  </h5>
                                </div>
                              </b-card-body>
                              <b-collapse
                                :visible="propertyRow.item.inspectionVisible"
                                role="tabpanel"
                              >
                                <b-card-body
                                  v-if="
                                    propertyRow.item.propertyInspections
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
                                <b-card-body v-else class="text-muted border">
                                  <ul
                                    class="
                                      verti-timeline
                                      list-unstyled
                                      ms-4
                                      mb-4
                                    "
                                    v-for="y in propertyRow.item
                                      .propertyInspections"
                                    :key="y.id"
                                  >
                                    <li
                                      class="event-list"
                                      :class="{
                                        active: y.status == 'PENDING',
                                      }"
                                    >
                                      <div class="event-timeline-dot">
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
                                            align-items-center
                                            ms-4
                                            me-3
                                          "
                                          style="width: 200px"
                                        >
                                          <div>
                                            <b class="font-size-16">
                                              {{
                                                formatDate(
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
                                          <div class="row">
                                            <div
                                              class="
                                                col-md-4
                                                border-end border-3
                                              "
                                            >
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
                                                <b
                                                  v-if="y.employee"
                                                  class="font-size-14"
                                                >
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
                                                  {{
                                                    y.employee.lastName
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                    y.employee.lastName.slice(1)
                                                  }}</b
                                                >
                                                <b v-else class="font-size-14"
                                                  >n/a</b
                                                >
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
                                              <div class="font-size-13 mb-2">
                                                Attachments:
                                              </div>
                                              <b-row
                                                style="
                                                  max-height: 150px;
                                                  overflow: auto;
                                                "
                                              >
                                                <b-col
                                                  sm="4"
                                                  v-for="(
                                                    z, index
                                                  ) in y.inspectionFiles"
                                                  :key="z.id"
                                                  class="mb-2"
                                                >
                                                  <div
                                                    class="
                                                      position-relative
                                                      cursor-pointer
                                                    "
                                                    :style="`z-index: ${
                                                      y.inspectionFiles.length -
                                                      index
                                                    }`"
                                                  >
                                                    <div
                                                      class="border p-3"
                                                      @click="openDocument(z)"
                                                    >
                                                      <div>
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
                                                                z.fileType.includes(
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
                                                                z.fileType.includes(
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
                                                              {{
                                                                z.description
                                                              }}
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
                                  @click="getAttachments(propertyRow.item)"
                                >
                                  <h6 class="mb-0">
                                    <i
                                      class="bx bx-paperclip rotate rotate-90"
                                    ></i>
                                    Attachments
                                  </h6>
                                  <h5 class="mb-0">
                                    <i
                                      class="bx bx-chevron-right rotate"
                                      :class="{
                                        'rotate-90':
                                          propertyRow.item.attachmentVisible,
                                      }"
                                    ></i>
                                  </h5>
                                </div>
                              </b-card-body>
                              <b-collapse
                                :visible="propertyRow.item.attachmentVisible"
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
                                        v-model="propertyRow.item.fileSearch"
                                        placeholder="Search Documents..."
                                      />
                                    </div>
                                    <div class="">
                                      <!-- <button
                                          type="button"
                                          :id="`posted-document${propertyRow.item.id}`"
                                          @click="propertyRow.item.addDocu = true"
                                          class="
                                            btn btn-sm btn-info
                                            mb-2
                                            me-2
                                            d-flex
                                            align-items-center
                                          "
                                        >
                                          <i class="bx bx-plus fs-6"></i>Upload
                                          Documents
                                        </button> -->
                                      <a
                                        href="javascript:void(0);"
                                        class="
                                          text-primary
                                          border-primary border
                                          p-2
                                        "
                                        :id="`posted-document${propertyRow.item.id}`"
                                        @click="propertyRow.item.addDocu = true"
                                        ><i class="bx bx-plus"></i>Upload
                                        Documents</a
                                      >
                                      <upload-popover
                                        :option="uploadOptions"
                                        :sourceId="propertyRow.item.id"
                                        @uploaded="
                                          uploadDocument(
                                            $event,
                                            propertyRow.item.id
                                          )
                                        "
                                        :showPV="propertyRow.item.addDocu"
                                        @closePopover="
                                          propertyRow.item.addDocu = false
                                        "
                                        :dzId="`dropzone-posted${propertyRow.item.id}`"
                                        :pvId="`posted-document${propertyRow.item.id}`"
                                      ></upload-popover>
                                    </div>
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
                                                      class="
                                                        mdi mdi-dots-horizontal
                                                      "
                                                    ></i>
                                                  </template>
                                                  <b-dropdown-item
                                                    @click="openDocument(y)"
                                                    ><i
                                                      class="
                                                        bx bx-link-external
                                                        me-1
                                                      "
                                                    ></i
                                                    >Open</b-dropdown-item
                                                  >
                                                  <b-dropdown-item
                                                    variant="danger"
                                                    @click="
                                                      removeFile(
                                                        y.id,
                                                        propertyRow.item.id
                                                      )
                                                    "
                                                    ><i
                                                      class="bx bx-trash me-1"
                                                    ></i
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
                                                  <p class="text-muted mb-0">
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
                                        searchDocu(propertyRow.item).length ==
                                          0 && propertyRow.item.fileSearch
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
                  class="dataTables_paginate paging_simple_numbers float-end"
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
    </div>
  </Layout>
</template>
