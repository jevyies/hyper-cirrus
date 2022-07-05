<script>
import UploadPopover from "@/components/widgets/upload-popover.vue";

export default {
  components: {
    UploadPopover,
  },
  props: {
    records: {},
    type: null,
  },
  data() {
    return {
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortDesc: false,
      fields: [
        {
          key: "action",
          label: " ",
          sortable: true,
          thStyle: { width: "3%" },
        },
        {
          key: "serialNumber",
          sortable: true,
          thStyle: { width: "25%" },
        },
        {
          key: "payee",
          label: "Payee/Supplier",
          sortable: true,
          thStyle: { width: "25%" },
        },
        {
          key: "busDate",
          label: "Date",
          sortable: true,
          thStyle: { width: "15%" },
        },
        {
          key: "amount",
          label: "Amount",
          sortable: true,
          thStyle: { width: "20%" },
        },
        {
          key: "actions",
          thStyle: { width: "12%" },
        },
      ],
      alert: {
        show: false,
        type: "",
        message: "",
      },
      tableBusy: false,
      uploadOptions: {
        type: "BURS",
        placement: "lefttop",
        folder: "Finance",
      },
      showAttachments: false,
      attachmentModalTitle: null,
      selectedRecord: {},
      attachments: [],
    };
  },
  methods: {
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("en-US");
    },
    formatCurrency(data) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(data);
    },
    post(record) {
      this.$emit("post", record);
    },
    update(record) {
      this.$emit("update", record);
    },
    remove(record) {
      this.$emit("remove", record);
    },
    approve(record) {
      this.$emit("approve", record);
    },
    returnBurs(record) {
      this.$emit("return", record);
    },
    uploadFile(record) {
      this.$emit("upload", record);
    },
    uploadedPosted(response, id) {
      this.attachments.push(response);
    },
    fetchAttachments(record) {
      this.$store
        .dispatch("filemanager/GetFiles", { id: record.item.id, type: "BURS" })
        .then((response) => {
          this.selectedRecord = record.item;
          this.attachments = response.data;
          record.item.attachments.push = [...response.data];
          // this.attachmentModalTitle = `Attachment for ${this.selectedRecord.serialNumber}`;
          // this.showAttachments = true;
          record.toggleDetails();
        })
        .catch(() => {
          this.showToast("Something went wrong. Cannot fetch attachments.", "error");
        });
    },
    openDocument(x) {
      window.open(`${this.$store.state.data.rootFileDirectory}${x.folder}/${x.fileName}`);
    },
    removeFile(record) {
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
            .dispatch("filemanager/DeleteFile", record.id)
            .then((res) => {
              if (res.data.error) {
                return this.showToast(res.data.errorMessage, "error");
              }
              this.attachments.splice(this.attachments.indexOf(record), 1);
              this.showToast("Successfully removed!", "success");
            })
            .catch(() => {
              this.showToast("Cannot be deleted!", "error");
            });
        }
      });
    },
    printBurs(id) {
      this.$emit("printBurs", id);
    },
    showDtls(row) {
      row.item.rotateChevy = !row.item.rotateChevy;
      if (row.item.showDetails) {
        row.toggleDetails();
        row.item.showDetails = !row.item.showDetails;
      } else {
        row.toggleDetails();
        row.item.showDetails = !row.item.showDetails;
      }
    },
  },
  computed: {
    rows() {
      return this.records.length;
    },
  },
};
</script>
<template>
  <div>
    <div class="row mb-2">
      <div class="col-lg-12">
        <b-alert :variant="alert.variant" :show="alert.show">{{ alert.message }}</b-alert>
      </div>
    </div>
    <div id="datatable_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
      <div class="row">
        <div class="col-sm-12 col-md-6">
          <div id="tickets-table_length" class="dataTables_length">
            <label class="d-inline-flex align-items-center">
              Show&nbsp;
              <b-form-select
                class="form-select form-select-sm mx-1"
                v-model="perPage"
                size="sm"
                :options="pageOptions"
              ></b-form-select
              >&nbsp;entries
            </label>
          </div>
        </div>
        <!-- Search -->
        <div class="col-sm-12 col-md-6">
          <div id="tickets-table_filter" class="dataTables_filter text-md-end">
            <label class="d-inline-flex align-items-center">
              Search:
              <b-form-input
                v-model="filter"
                type="search"
                placeholder="Search..."
                class="form-control form-control-sm ms-2"
              ></b-form-input>
            </label>
          </div>
        </div>
        <!-- End search -->
      </div>
      <div class="row">
        <!-- table data -->
        <div class="col-lg-12">
          <div class="table-responsive mb-0">
            <b-table
              class="table project-list-table table-nowrap align-middle table-borderless"
              :items="records"
              :fields="fields"
              :per-page="perPage"
              :current-page="currentPage"
              :sort-desc.sync="sortDesc"
              :filter="filter"
              :filter-included-fields="filterOn"
              :busy="tableBusy"
              @filtered="onFiltered"
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
              <template #cell(action)="row">
                <div
                  class="d-flex align-items-center justify-content-center"
                  @click="showDtls(row)"
                >
                  <i
                    class="bx bx-chevron-right rotate font-size-16 cursor-pointer"
                    :class="{
                      'rotate-90': row.item.rotateChevy,
                    }"
                  ></i>
                </div>
              </template>
              <template #cell(payee)="row">
                <p class="mb-0 text-info">
                  {{ row.item.rfp.rfpPaymentItem.rfp.supplier.name }}
                </p>
                <p class="mb-0">
                  <small>TIN: {{ row.item.rfp.rfpPaymentItem.rfp.supplier.tin }}</small>
                </p>
                <p class="mb-0">
                  <small>{{ row.item.rfp.rfpPaymentItem.rfp.supplier.vatType }}</small>
                </p>
              </template>
              <template #cell(amount)="row">
                <span class="text-warning">{{
                  formatCurrency(row.item.rfp.amount)
                }}</span>
              </template>
              <template #cell(busDate)="row">
                {{ formatDate(row.item.busDate) }}
              </template>
              <template #cell(actions)="row">
                <b-dropdown
                  id="dropdown-dropleft"
                  right
                  variant="link"
                  toggle-class="text-decoration-none"
                  menu-class="dropdown-menu-end"
                  no-caret
                  v-if="type"
                >
                  <template #button-content>
                    <i class="fas fa-ellipsis-v"></i>
                  </template>
                  <b-dropdown-item
                    v-if="type === 'posted'"
                    @click="returnBurs(row.item)"
                    variant="warning"
                    ><i class="bx bx-left-arrow-alt align-middle me-1"></i>
                    Return</b-dropdown-item
                  >
                  <!-- <b-dropdown-item
                    v-if="type === 'posted'"
                    @click="fetchAttachments(row)"
                    variant="success"
                    ><i class="bx bx-paperclip align-middle me-1"></i>
                    Attachments</b-dropdown-item
                  > -->

                  <b-dropdown-item variant="primary" @click="printBurs(row.item.id)"
                    ><i class="bx bx-printer align-middle me-1"></i>
                    Print</b-dropdown-item
                  >

                  <b-dropdown-item
                    v-if="type === 'pending'"
                    @click="post(row.item)"
                    variant="info"
                    ><i class="bx bx-upload align-middle me-1"></i> Post</b-dropdown-item
                  >
                  <b-dropdown-item
                    v-if="type === 'pending'"
                    @click="update(row.item)"
                    variant="warning"
                    ><i class="bx bxs-pencil align-middle me-1"></i> Edit</b-dropdown-item
                  >
                  <b-dropdown-item
                    v-if="type === 'pending'"
                    @click="remove(row.item)"
                    variant="danger"
                    ><i class="bx bx-trash align-middle me-1"></i> Delete</b-dropdown-item
                  >
                </b-dropdown>
              </template>
              <template #row-details="row">
                <b-card>
                  <div id="details">
                    <h5 class="card-title mt-2 mb-3 text-info">
                      <i class="bx bx-file-blank me-3"></i>Details
                    </h5>

                    <p class="mb-2">
                      <strong>Particulars: </strong>
                      <span>{{ row.item.particulars }}</span>
                    </p>
                    <p>
                      <strong>Serial Number: </strong>
                      <span>{{ row.item.serialNumber }}</span>
                    </p>
                  </div>
                  <hr />
                  <div id="attachments">
                    <div class="row">
                      <div class="col-lg-6">
                        <h5 class="card-title mt-2 text-warning">
                          <i class="bx bx-paperclip me-3"></i>Attachments
                        </h5>
                      </div>
                      <div class="col-lg-6 text-lg-end">
                        <b-button
                          variant="success"
                          @click="row.item.viewUpload = true"
                          :id="`burs-document${row.item.id}`"
                          ><i class="bx bx-upload align-middle me-1"></i> Upload</b-button
                        >
                        <upload-popover
                          :option="uploadOptions"
                          :sourceId="row.item.id"
                          @uploaded="uploadedPosted($event, row.item.id)"
                          :showPV="row.item.viewUpload"
                          @closePopover="row.item.viewUpload = !row.item.viewUpload"
                          :dzId="`dropzone-posted${row.item.id}`"
                          :pvId="`burs-document${row.item.id}`"
                        ></upload-popover>
                      </div>
                    </div>
                    <div class="mb-0 mt-5">
                      <b-row>
                        <b-col sm="4" v-for="y in attachments" :key="y.id" class="mb-2">
                          <div class="position-relative cursor-pointer">
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
                                      <i class="mdi mdi-dots-horizontal"></i>
                                    </template>
                                    <b-dropdown-item @click="openDocument(y)"
                                      ><i class="bx bx-link-external me-1"></i
                                      >Open</b-dropdown-item
                                    >
                                    <b-dropdown-item
                                      variant="danger"
                                      @click="removeFile(y)"
                                      ><i class="bx bx-trash me-1"></i
                                      >Remove</b-dropdown-item
                                    >
                                  </b-dropdown>
                                </div>
                                <div class="avatar-xs me-3 mb-2" @click="openDocument(y)">
                                  <div class="avatar-title bg-transparent rounded">
                                    <i
                                      v-if="y.fileType.includes('image')"
                                      class="mdi mdi-image font-size-24 text-purple"
                                    ></i>
                                    <i
                                      v-if="y.fileType.includes('application')"
                                      class="mdi mdi-file-pdf-outline font-size-24 text-danger"
                                    ></i>
                                  </div>
                                </div>
                                <div class="d-flex" @click="openDocument(y)">
                                  <div class="overflow-hidden me-auto">
                                    <h5 class="font-size-14 text-truncate mb-1">
                                      {{ y.description }}
                                    </h5>
                                    <p class="text-muted mb-0">
                                      {{
                                        formatDateWithTime(new Date(y.dateTimeUploaded))
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
                </b-card>
              </template>
            </b-table>
          </div>
        </div>
        <!-- table data -->
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
    </div>
    <!-- Modals here -->
    <!-- <b-modal
      :title="attachmentModalTitle"
      v-model="showAttachments"
      size="lg"
      hide-footer
    >
      <div class="mb-3 text-end">
        <b-button
          variant="success"
          @click="selectedRecord.viewUpload = true"
          :id="`approved-document${selectedRecord.id}`"
          ><i class="bx bx-upload align-middle me-1"></i> Upload</b-button
        >
        <upload-popover
          :option="uploadOptions"
          :sourceId="selectedRecord.id"
          @uploaded="uploadedPosted($event, selectedRecord.id)"
          :showPV="selectedRecord.viewUpload"
          @closePopover="selectedRecord.viewUpload = !selectedRecord.viewUpload"
          :dzId="`dropzone-posted${selectedRecord.id}`"
          :pvId="`approved-document${selectedRecord.id}`"
        ></upload-popover>
      </div>
      <div class="mb-3">
        <b-row>
          <b-col sm="4" v-for="y in attachments" :key="y.id" class="mb-2">
            <div class="position-relative cursor-pointer">
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
                        <i class="mdi mdi-dots-horizontal"></i>
                      </template>
                      <b-dropdown-item @click="openDocument(y)"
                        ><i class="bx bx-link-external me-1"></i>Open</b-dropdown-item
                      >
                      <b-dropdown-item variant="danger" @click="removeFile(y)"
                        ><i class="bx bx-trash me-1"></i>Remove</b-dropdown-item
                      >
                    </b-dropdown>
                  </div>
                  <div class="avatar-xs me-3 mb-2" @click="openDocument(y)">
                    <div class="avatar-title bg-transparent rounded">
                      <i
                        v-if="y.fileType.includes('image')"
                        class="mdi mdi-image font-size-24 text-purple"
                      ></i>
                      <i
                        v-if="y.fileType.includes('application')"
                        class="mdi mdi-file-pdf-outline font-size-24 text-danger"
                      ></i>
                    </div>
                  </div>
                  <div class="d-flex" @click="openDocument(y)">
                    <div class="overflow-hidden me-auto">
                      <h5 class="font-size-14 text-truncate mb-1">
                        {{ y.description }}
                      </h5>
                      <p class="text-muted mb-0">
                        {{ formatDateWithTime(new Date(y.dateTimeUploaded)) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </b-col>
        </b-row>
      </div>
    </b-modal> -->
  </div>
</template>
