<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { required } from "vuelidate/lib/validators";
import { cloneDeep } from "lodash";
import Swal from "sweetalert2";
import UploadPopover from "@/components/widgets/upload-popover.vue";

export default {
    page: {
        title: "Manage PR",
    },
    components: {
        Layout,
        PageHeader,
        UploadPopover,
    },
    data() {
        return {
            title: "Manage PR",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Manage PR",
                    active: true,
                },
            ],
            postedData: [],
            modalTitle: "",

            totalRowsPosted: 1,
            currentPostedPage: 1,
            perPagePosted: 10,
            pageOptions: [10, 25, 50, 100],
            filterPosted: "",
            filterOnPosted: [],
            sortByPosted: "itemName",
            sortDescPosted: false,
            postedFields: [
                {
                    key: "item",
                    label: "",
                    thStyle: { width: "20px" },
                },
                {
                    key: "prNumber",
                    sortable: true,
                    label: "PR Number",
                    thStyle: { width: "220px" },
                },
                {
                    key: "description",
                    sortable: true,
                    label: "PR Description",
                },
                {
                    key: "actions",
                    thStyle: { width: "200px" },
                },
            ],
            approvedData: [],
            totalRowsApproved: 1,
            currentApprovedPage: 1,
            perPageApproved: 10,
            filterApproved: "",
            filterOnApproved: [],
            sortByApproved: "itemName",
            sortDescApproved: false,
            approvedFields: [
                {
                    key: "item",
                    label: "",
                    thStyle: { width: "20px" },
                },
                {
                    key: "prNumber",
                    sortable: true,
                    label: "PR Number",
                    thStyle: { width: "220px" },
                },
                {
                    key: "description",
                    sortable: true,
                    label: "PR Description",
                },
                {
                    key: "actions",
                    thStyle: { width: "200px" },
                },
            ],
            indexSelected: -1,
            postedBusy: false,
            approvedBusy: false,
            cycles: [],
            tableIndex: -1,
            form: {
                id: "",
                remarks: "",
            },
            prType: "posted",
            uploadOptions: {
                type: "Purchase Request",
                placement: "lefttop",
                folder: "Procurement",
            },
        };
    },
    validations: {
        form: { remarks: { required } },
    },
    computed: {
        filteredPosted() {
            let data = this.postedData;
            var total = this.currentPostedPage * this.perPagePosted;
            if (this.filterPosted.trim() != "" && this.filterPosted) {
                data = data.filter((item) => {
                    return item.searchKey
                        .toUpperCase()
                        .includes(this.filterPosted.toUpperCase());
                });
            }
            data = data.slice(total - this.perPagePosted, total);
            return data;
        },
        postedRows() {
            if (this.filterPosted) {
                return this.totalRows;
            }
            return this.postedData.length;
        },
        filteredApproved() {
            let data = this.approvedData;
            var total = this.currentApprovedPage * this.perPageApproved;
            if (this.filterApproved.trim() != "" && this.filterApproved) {
                data = data.filter((item) => {
                    return item.searchKey
                        .toUpperCase()
                        .includes(this.filterApproved.toUpperCase());
                });
            }
            data = data.slice(total - this.perPageApproved, total);
            return data;
        },
        approvedRows() {
            if (this.filterApproved) {
                return this.totalRows;
            }
            return this.approvedData.length;
        },
    },
    created() {
        this.changeCycle(this.$store.state.data.cycle);
    },
    methods: {
        changeCycle(cycle) {
            this.getPRPosted(cycle);
            this.getPRApproved(cycle);
        },
        getPRPosted(event) {
            this.postedBusy = true;
            this.$store
                .dispatch("pr/GetPostedPr", event)
                .then((res) => {
                    this.postedBusy = false;
                    res.data.forEach((item) => {
                        item.showDetails = true;
                        item.detailLoaded = false;
                        item.loadingDetail = false;
                        item.itemVisible = false;
                        item.attachmentVisible = false;
                        item.addDocu = false;
                        item.attachmentLoading = false;
                        item.fileSearch = '';
                        item.prFiles = [];
                        item.searchKey = `${item.description} ${item.prNumber}`;
                    });
                    this.postedData = res.data;
                })
                .catch(() => {
                    this.postedBusy = false;
                    this.showToast('Something went wrong! - getting posted PR', 'error');
                });
        },
        getPRApproved(event) {
            this.approvedBusy = true;
            this.$store
                .dispatch("pr/GetApprovedPr", event)
                .then((res) => {
                    this.approvedBusy = false;
                    res.data.forEach((item) => {
                        item.showDetails = true;
                        item.detailLoaded = false;
                        item.loadingDetail = false;
                        item.itemVisible = false;
                        item.attachmentVisible = false;
                        item.addDocu = false;
                        item.attachmentLoading = false;
                        item.fileSearch = '';
                        item.prFiles = [];
                        item.searchKey = `${item.description} ${item.prNumber}`;
                    });
                    this.approvedData = res.data;
                })
                .catch(() => {
                    this.approvedBusy = false;
                    this.showToast('Something went wrong! - getting approved PR', 'error');
                });
        },
        getPRItems(row) {
            if (!row.detailLoaded) {
                row.prItems = [];
                row.loadingDetail = true;
                this.$store
                    .dispatch("pritem/GetPrItems", row.id)
                    .then((res) => {
                        row.prItems = res.data;
                        row.detailLoaded = true;
                        row.loadingDetail = false;
                    })
                    .catch(() => {
                        this.approvedBusy = false;
                        this.showToast('Something went wrong! - getting PR Items', 'error');
                    });
            }
        },
        onFilteredPosted(filteredItems) {
            this.totalRowsPosted = filteredItems.length;
            this.currentPostedPage = 1;
        },
        onFilteredApproved(filteredItems) {
            this.totalRowsApproved = filteredItems.length;
            this.currentApprovedPage = 1;
        },
        returnPR(row, type) {
            this.prType = cloneDeep(type);
            this.tableIndex =
                type === "posted"
                    ? this.postedData.indexOf(row)
                    : this.approvedData.indexOf(row);
            this.form.id = row.id;
            this.form.remarks = "";
            this.$bvModal.show("return-modal");
        },
        approvePR(row) {
            this.tableIndex = this.postedData.indexOf(row);
            Swal.fire({
                title: "Are you sure?",
                text: "You want to approve this PR?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#34c38f",
                cancelButtonColor: "#f46a6a",
                confirmButtonText: "Yes, approve it!",
            }).then((result) => {
                if (result.isConfirmed) {
                    this.$store
                        .dispatch("pr/ApprovePr", row.id)
                        .then((res) => {
                            this.postedData.splice(this.tableIndex, 1);
                            this.approvedData.push(row);
                            this.showToast("PR Approved!", "success");
                        })
                        .catch((err) => {
                            this.showToast('Something went wrong! - approving PR', 'error');
                        });
                }
            });
        },
        returnPRSubmit() {
            this.submitted = true;
            this.$v.form.$touch();
            if (this.$v.form.$invalid) {
                return;
            }
            this.$store
                .dispatch("pr/ReturnPr", this.form)
                .then((res) => {
                    if (this.prType === "posted") {
                        this.postedData.splice(this.tableIndex, 1);
                    } else {
                        this.approvedData.splice(this.tableIndex, 1);
                    }
                    this.showToast('Successfully returned', 'success');
                    this.$bvModal.hide("return-modal");
                })
                .catch((err) => {
                    this.showToast('Something went wrong!', 'error');
                });
        },
        showDtls(row) {
            row.itemVisible = !row.itemVisible;
            if (row.itemVisible) {
                this.getPRItems(row);
            }
        },
        getTotalPerPR(prItems) {
            return prItems.reduce((pv, cv) => {
                return pv + parseFloat(cv.total);
            }, 0);
        },
        printPR(x) {
        },
        uploadedPosted(response, id) {
            var index = this.postedData.findIndex((x) => x.id == id);
            this.postedData[index].prFiles.push(response);
        },
        uploadedApproved(response, id) {
            var index = this.approvedData.findIndex((x) => x.id == id);
            this.approvedData[index].prFiles.push(response);
        },
        openDocument(x) {
            window.open(
                `${this.$store.state.data.rootFileDirectory}${x.folder}/${x.fileName}`
            );
        },
        searchDocu(row) {
            let data = row.prFiles;
            if (row.fileSearch.trim() != "" && row.fileSearch) {
                data = data.filter((item) => {
                    return item.description
                        .toUpperCase()
                        .includes(row.fileSearch.toUpperCase());
                });
            }
            return data;
        },
        getAttachments(row){
            row.attachmentVisible = !row.attachmentVisible;
            if(row.attachmentVisible){
                row.prFiles = [];
                row.fileSearch = ''
                row.attachmentLoading = true;
                this.$store
                    .dispatch("filemanager/GetFiles", {id: row.id, type: this.uploadOptions.type})
                    .then((res) => {
                        row.attachmentLoading = false;
                        row.prFiles = res.data;
                    })
                    .catch(() => {
                        row.attachmentLoading = false;
                        this.showToast('Something went wrong! - getting documents', "error");
                    });
            }
        },
        removeFile(id, parentId, type){
            Swal.fire({
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
                            if(res.data.error){
                                return this.showToast(res.data.errorMessage, "error");
                            }
                            if(type === 'posted'){
                                let index = this.postedData.findIndex(item => item.id == parentId);
                                let yIndex = this.postedData[index].prFiles.findIndex(item => item.id == id);
                                this.postedData[index].prFiles.splice(yIndex, 1);
                            }else{
                                let index = this.approvedData.findIndex(item => item.id == parentId);
                                let yIndex = this.approvedData[index].prFiles.findIndex(item => item.id == id);
                                this.approvedData[index].prFiles.splice(yIndex, 1);
                            }
                            this.showToast('Successfully removed!', "success");
                        })
                        .catch(() => {
                            this.showToast('Cannot be deleted!', "error");
                        });
                }
            });
        }
    },
};
</script>

<template>
    <Layout @changeCycle="changeCycle">
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="return-modal"
            title="Return Remarks"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form @submit.prevent="returnPRSubmit" class="needs-validation">
                <b-row>
                    <b-col>
                        <div class="mb-3">
                            <label for="description">Remarks </label>
                            <textarea
                                id="description"
                                rows="3"
                                v-model="form.remarks"
                                placeholder="Enter Remarks..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.form.remarks.$error,
                                }"
                            ></textarea>
                            <div
                                v-if="submitted && $v.form.remarks.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.remarks.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                    </b-col>
                </b-row>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Return PR
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="$bvModal.hide('return-modal')"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <div class="row">
            <div class="col-12">
                <b-tabs
                    nav-class="nav-tabs-custom"
                    content-class="pt-3 pb-3 text-muted"
                >
                    <b-tab>
                        <template v-slot:title>
                            <span class="d-inline-block d-sm-none">
                                <i class="bx bx-home"></i>
                            </span>
                            <span class="d-none d-sm-inline-block">Posted</span>
                        </template>
                        <div class="card">
                            <div class="card-body bg-primary bg-soft">
                                <div
                                    class="
                                        d-flex
                                        justify-content-between
                                        align-items-center
                                        mb-3
                                    "
                                >
                                    <div>
                                        <h4 class="card-title mb-0">
                                            Posted Purchase Request
                                        </h4>
                                        <p class="card-title-desc mb-0">
                                            List of posted Purchase Request
                                        </p>
                                    </div>
                                    <div v-if="postedData.length > 0">
                                        <input
                                            autocomplete="off"
                                            id="name"
                                            type="text"
                                            v-model="filterPosted"
                                            placeholder="Search RFQ..."
                                            class="form-control"
                                        />
                                    </div>
                                </div>
                                <div
                                    v-if="postedData.length == 0"
                                    class="text-center"
                                >
                                    <h5>No data available</h5>
                                </div>
                                <div
                                    v-if="
                                        filterPosted &&
                                        filteredPosted.length == 0
                                    "
                                    class="text-center"
                                >
                                    <h5>Search not found</h5>
                                </div>
                                <template v-if="postedData.length > 0">
                                    <div
                                        role="tablist"
                                        v-for="x in filteredPosted"
                                        :key="x.id"
                                    >
                                        <b-card
                                            no-body
                                            class="mb-1 shadow-none"
                                        >
                                            <b-card-header
                                                header-tag="header"
                                                role="tab"
                                                header-class="cursor-pointer"
                                                @click="
                                                    x.showDetails =
                                                        !x.showDetails
                                                "
                                            >
                                                <div
                                                    class="
                                                        d-flex
                                                        justify-content-between
                                                        align-items-center
                                                    "
                                                >
                                                    <h6 class="m-0">
                                                        <a
                                                            class="text-dark"
                                                            href="javascript: void(0);"
                                                            >[{{
                                                                x.prNumber
                                                            }}]:&nbsp;{{
                                                                x.description
                                                            }}</a
                                                        >
                                                    </h6>
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                        "
                                                    >
                                                        <div>
                                                            <span
                                                                class="
                                                                    d-flex
                                                                    align-items-center
                                                                "
                                                                ><small
                                                                    v-if="
                                                                        !x.showDetails
                                                                    "
                                                                    >Click here
                                                                    to
                                                                    expand</small
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-chevron-right
                                                                        rotate
                                                                        font-size-18
                                                                        ms-3
                                                                    "
                                                                    :class="{
                                                                        'rotate-90':
                                                                            x.showDetails,
                                                                    }"
                                                                ></i
                                                            ></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </b-card-header>
                                            <b-collapse
                                                :visible="x.showDetails"
                                                :accordion="`posted-accordion-${x.id}`"
                                                role="tabpanel"
                                            >
                                                <b-card-body class="border">
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                            justify-content-between
                                                            cursor-pointer
                                                        "
                                                        @click="showDtls(x)"
                                                    >
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-menu-alt-right
                                                                "
                                                            ></i>
                                                            Purchase Request
                                                            Items
                                                        </h5>
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-chevron-right
                                                                    rotate
                                                                "
                                                                :class="{
                                                                    'rotate-90':
                                                                        x.itemVisible,
                                                                }"
                                                            ></i>
                                                        </h5>
                                                    </div>
                                                    <b-collapse
                                                        :visible="x.itemVisible"
                                                        :accordion="`posted-item-accordion-${x.id}`"
                                                        role="tabpanel"
                                                    >
                                                        <hr />
                                                        <div
                                                            class="
                                                                d-flex
                                                                justify-content-center
                                                                align-items-center
                                                            "
                                                            v-if="
                                                                x.detailLoading
                                                            "
                                                        >
                                                            <div
                                                                class="
                                                                    preloader-component
                                                                    me-2
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        status
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            spinner-chase
                                                                            w-20px
                                                                            h-20px
                                                                        "
                                                                    >
                                                                        <div
                                                                            class="
                                                                                chase-dot
                                                                            "
                                                                        ></div>
                                                                        <div
                                                                            class="
                                                                                chase-dot
                                                                            "
                                                                        ></div>
                                                                        <div
                                                                            class="
                                                                                chase-dot
                                                                            "
                                                                        ></div>
                                                                        <div
                                                                            class="
                                                                                chase-dot
                                                                            "
                                                                        ></div>
                                                                        <div
                                                                            class="
                                                                                chase-dot
                                                                            "
                                                                        ></div>
                                                                        <div
                                                                            class="
                                                                                chase-dot
                                                                            "
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <strong
                                                                >Loading...</strong
                                                            >
                                                        </div>
                                                        <div
                                                            v-if="
                                                                x.detailLoaded &&
                                                                x.prItems
                                                                    .length == 0
                                                            "
                                                            class="text-center"
                                                        >
                                                            No items found
                                                        </div>
                                                        <table
                                                            width="100%"
                                                            v-if="
                                                                x.prItems
                                                                    .length > 0
                                                            "
                                                        >
                                                            <tr>
                                                                <th class="p-2">
                                                                    Item Name
                                                                </th>
                                                                <th
                                                                    style="
                                                                        width: 160px;
                                                                    "
                                                                    class="p-2"
                                                                >
                                                                    Unit Cost
                                                                </th>
                                                                <th
                                                                    style="
                                                                        width: 160px;
                                                                    "
                                                                    class="p-2"
                                                                >
                                                                    Total
                                                                </th>
                                                            </tr>
                                                            <tr
                                                                v-for="y in x.prItems"
                                                                :key="y.id"
                                                            >
                                                                <td class="p-2">
                                                                    {{
                                                                        y.totalQuantity
                                                                    }}
                                                                    x
                                                                    <b>{{
                                                                        y
                                                                            .apiResource
                                                                            .itemName
                                                                    }}</b>
                                                                    <div>
                                                                        <small
                                                                            >{{
                                                                                y
                                                                                    .apiResource
                                                                                    .description
                                                                            }}</small
                                                                        >
                                                                    </div>
                                                                </td>
                                                                <td class="p-2">
                                                                    {{
                                                                        Intl.NumberFormat(
                                                                            "ja-JP",
                                                                            {
                                                                                currency:
                                                                                    "PHP",
                                                                                style: "currency",
                                                                            }
                                                                        ).format(
                                                                            y.unitCost
                                                                        )
                                                                    }}
                                                                </td>
                                                                <td class="p-2">
                                                                    {{
                                                                        Intl.NumberFormat(
                                                                            "ja-JP",
                                                                            {
                                                                                currency:
                                                                                    "PHP",
                                                                                style: "currency",
                                                                            }
                                                                        ).format(
                                                                            y.total
                                                                        )
                                                                    }}
                                                                </td>
                                                            </tr>
                                                            <tr
                                                                class="
                                                                    border
                                                                    border-dashed
                                                                "
                                                            >
                                                                <td
                                                                    class="py-2"
                                                                ></td>
                                                                <td
                                                                    class="
                                                                        text-right
                                                                        py-2
                                                                        px-2
                                                                    "
                                                                >
                                                                    Total:
                                                                </td>
                                                                <td
                                                                    colspan="3"
                                                                    class="p-2"
                                                                >
                                                                    {{
                                                                        Intl.NumberFormat(
                                                                            "ja-JP",
                                                                            {
                                                                                currency:
                                                                                    "PHP",
                                                                                style: "currency",
                                                                            }
                                                                        ).format(
                                                                            getTotalPerPR(
                                                                                x.prItems
                                                                            )
                                                                        )
                                                                    }}
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </b-collapse>
                                                    <hr />
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                            justify-content-between
                                                            cursor-pointer
                                                        "
                                                        @click="
                                                            getAttachments(x)
                                                        "
                                                    >
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-paperclip
                                                                    rotate
                                                                    rotate-90
                                                                "
                                                            ></i>
                                                            Attachments
                                                        </h5>
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-chevron-right
                                                                    rotate
                                                                "
                                                                :class="{
                                                                    'rotate-90':
                                                                        x.attachmentVisible,
                                                                }"
                                                            ></i>
                                                        </h5>
                                                    </div>
                                                    <b-collapse
                                                        :visible="
                                                            x.attachmentVisible
                                                        "
                                                        :accordion="`posted-attachment-accordion-${x.id}`"
                                                        role="tabpanel"
                                                    >
                                                        <hr />
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
                                                                        x
                                                                            .prFiles
                                                                            .length ==
                                                                        0
                                                                    "
                                                                >
                                                                    <i
                                                                        >No
                                                                        documents
                                                                        found</i
                                                                    >
                                                                </p>
                                                                <input
                                                                    v-if="
                                                                        x
                                                                            .prFiles
                                                                            .length >
                                                                        0
                                                                    "
                                                                    type="search"
                                                                    class="
                                                                        form-control
                                                                    "
                                                                    v-model="
                                                                        x.fileSearch
                                                                    "
                                                                    placeholder="Search Documents..."
                                                                />
                                                            </div>
                                                            <div class="">
                                                                <a
                                                                    href="javascript:void(0);"
                                                                    class="
                                                                        text-primary
                                                                        border-primary
                                                                        border
                                                                        p-2
                                                                    "
                                                                    :id="`posted-document${x.id}`"
                                                                    @click="
                                                                        x.addDocu = true
                                                                    "
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-plus
                                                                        "
                                                                    ></i
                                                                    >Upload
                                                                    Documents</a
                                                                >
                                                                <upload-popover
                                                                    :option="
                                                                        uploadOptions
                                                                    "
                                                                    :sourceId="
                                                                        x.id
                                                                    "
                                                                    @uploaded="
                                                                        uploadedPosted(
                                                                            $event,
                                                                            x.id
                                                                        )
                                                                    "
                                                                    :showPV="
                                                                        x.addDocu
                                                                    "
                                                                    @closePopover="
                                                                        x.addDocu = false
                                                                    "
                                                                    :dzId="`dropzone-posted${x.id}`"
                                                                    :pvId="`posted-document${x.id}`"
                                                                ></upload-popover>
                                                            </div>
                                                        </div>
                                                        <div class="mt-2">
                                                            <b-row>
                                                                <b-col
                                                                    sm="3"
                                                                    v-for="(
                                                                        y, index
                                                                    ) in searchDocu(x)"
                                                                    :key="y.id"
                                                                    class="mb-2"
                                                                >
                                                                    <div
                                                                        class="
                                                                            position-relative
                                                                            cursor-pointer
                                                                        "
                                                                        :style="`z-index: ${
                                                                            x
                                                                                .prFiles
                                                                                .length -
                                                                            index
                                                                        }`"
                                                                    >
                                                                        <div
                                                                            class="
                                                                                border
                                                                                p-3
                                                                            "
                                                                        >
                                                                            <div>
                                                                                <div
                                                                                    class="
                                                                                        float-end
                                                                                        ms-2
                                                                                    "
                                                                                >
                                                                                    <b-dropdown
                                                                                        id="dropdown-dropleft"
                                                                                        right
                                                                                        variant="link"
                                                                                        toggle-class="text-decoration-none text-dark font-size-16 pt-0"
                                                                                        menu-class="dropdown-menu-end"
                                                                                        no-caret
                                                                                    >
                                                                                        <template
                                                                                            #button-content
                                                                                        >
                                                                                            <i
                                                                                                class="
                                                                                                    mdi
                                                                                                    mdi-dots-horizontal
                                                                                                "
                                                                                            ></i>
                                                                                        </template>
                                                                                        <b-dropdown-item
                                                                                            @click="
                                                                                                openDocument(
                                                                                                    y
                                                                                                )
                                                                                            "
                                                                                            ><i
                                                                                                class="
                                                                                                    bx
                                                                                                    bx-link-external
                                                                                                    me-1
                                                                                                "
                                                                                            ></i
                                                                                            >Open</b-dropdown-item
                                                                                        >
                                                                                        <b-dropdown-item
                                                                                            variant="danger"
                                                                                            @click="removeFile(y.id, x.id, 'posted')"
                                                                                            ><i
                                                                                                class="
                                                                                                    bx
                                                                                                    bx-trash
                                                                                                    me-1
                                                                                                "
                                                                                            ></i
                                                                                            >Remove</b-dropdown-item
                                                                                        >
                                                                                    </b-dropdown>
                                                                                </div>
                                                                                <div
                                                                                    class="
                                                                                        avatar-xs
                                                                                        me-3
                                                                                        mb-2
                                                                                    "
                                                                                    @click="
                                                                                        openDocument(
                                                                                            y
                                                                                        )
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
                                                                                                mdi
                                                                                                mdi-image
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
                                                                                <div
                                                                                    class="
                                                                                        d-flex
                                                                                    "
                                                                                    @click="
                                                                                        openDocument(
                                                                                            y
                                                                                        )
                                                                                    "
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
                                                                                            {{
                                                                                                y.description
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
                                                                    searchDocu(x).length == 0
                                                                    && x.fileSearch
                                                                "
                                                            >
                                                                <b-col
                                                                    >Search Not
                                                                    Found</b-col
                                                                >
                                                            </b-row>
                                                        </div>
                                                    </b-collapse>
                                                    <hr />
                                                    <div class="d-flex">
                                                        <button
                                                            type="button"
                                                            class="
                                                                btn btn-warning
                                                                me-2
                                                            "
                                                            @click="
                                                                returnPR(
                                                                    x,
                                                                    'posted'
                                                                )
                                                            "
                                                        >
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-revision
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Return Purchase
                                                            Request
                                                        </button>
                                                        <button
                                                            type="button"
                                                            class="
                                                                btn btn-success
                                                                me-2
                                                            "
                                                            @click="
                                                                approvePR(x)
                                                            "
                                                        >
                                                            <i
                                                                class="
                                                                    bx bx-check
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Approve Purchase
                                                            Request
                                                        </button>
                                                        <button
                                                            type="button"
                                                            class="
                                                                btn btn-purple
                                                            "
                                                            @click="printPR(x)"
                                                        >
                                                            <i
                                                                class="
                                                                    bx
                                                                    bxs-printer
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Print Purchase
                                                            Request
                                                        </button>
                                                    </div>
                                                </b-card-body>
                                            </b-collapse>
                                        </b-card>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </b-tab>
                    <b-tab>
                        <template v-slot:title>
                            <span class="d-inline-block d-sm-none">
                                <i class="far fa-user"></i>
                            </span>
                            <span class="d-none d-sm-inline-block"
                                >Approved</span
                            >
                        </template>
                        <div class="card">
                            <div class="card-body bg-success bg-soft">
                                <div
                                    class="
                                        d-flex
                                        justify-content-between
                                        align-items-center
                                        mb-3
                                    "
                                >
                                    <div>
                                        <h4 class="card-title mb-0">
                                            Approved Purchase Request
                                        </h4>
                                        <p class="card-title-desc mb-0">
                                            List of approved Purchase Request
                                        </p>
                                    </div>
                                    <div v-if="approvedData.length > 0">
                                        <input
                                            autocomplete="off"
                                            id="name"
                                            type="text"
                                            v-model="filterApproved"
                                            placeholder="Search Approved P.R..."
                                            class="form-control"
                                        />
                                    </div>
                                </div>
                                <div
                                    v-if="approvedData.length == 0"
                                    class="text-center"
                                >
                                    <h5>No data available</h5>
                                </div>
                                <div
                                    v-if="
                                        filterApproved &&
                                        filteredApproved.length == 0
                                    "
                                    class="text-center"
                                >
                                    <h5>Search not found</h5>
                                </div>
                                <template v-if="approvedData.length > 0">
                                    <div
                                        role="tablist"
                                        v-for="x in filteredApproved"
                                        :key="x.id"
                                    >
                                        <b-card
                                            no-body
                                            class="mb-1 shadow-none"
                                        >
                                            <b-card-header
                                                header-tag="header"
                                                role="tab"
                                                header-class="cursor-pointer"
                                                @click="
                                                    x.showDetails =
                                                        !x.showDetails
                                                "
                                            >
                                                <div
                                                    class="
                                                        d-flex
                                                        justify-content-between
                                                        align-items-center
                                                    "
                                                >
                                                    <h6 class="m-0">
                                                        <a
                                                            class="text-dark"
                                                            href="javascript: void(0);"
                                                            >[{{
                                                                x.prNumber
                                                            }}]:&nbsp;{{
                                                                x.description
                                                            }}</a
                                                        >
                                                    </h6>
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                        "
                                                    >
                                                        <div>
                                                            <span
                                                                class="
                                                                    d-flex
                                                                    align-items-center
                                                                "
                                                                ><small
                                                                    v-if="
                                                                        !x.showDetails
                                                                    "
                                                                    >Click here
                                                                    to
                                                                    expand</small
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-chevron-right
                                                                        rotate
                                                                        font-size-18
                                                                        ms-3
                                                                    "
                                                                    :class="{
                                                                        'rotate-90':
                                                                            x.showDetails,
                                                                    }"
                                                                ></i
                                                            ></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </b-card-header>
                                            <b-collapse
                                                :visible="x.showDetails"
                                                :accordion="`approved-accordion-${x.id}`"
                                                role="tabpanel"
                                            >
                                                <b-card-body class="border">
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                            justify-content-between
                                                            cursor-pointer
                                                        "
                                                        @click="showDtls(x)"
                                                    >
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-menu-alt-right
                                                                "
                                                            ></i>
                                                            Purchase Request
                                                            Items
                                                        </h5>
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-chevron-right
                                                                    rotate
                                                                "
                                                                :class="{
                                                                    'rotate-90':
                                                                        x.itemVisible,
                                                                }"
                                                            ></i>
                                                        </h5>
                                                    </div>
                                                    <b-collapse
                                                        :visible="x.itemVisible"
                                                        :accordion="`approved-item-accordion-${x.id}`"
                                                        role="tabpanel"
                                                    >
                                                        <hr />
                                                        <div
                                                            class="
                                                                d-flex
                                                                justify-content-center
                                                                align-items-center
                                                            "
                                                            v-if="
                                                                x.detailLoading
                                                            "
                                                        >
                                                            <div
                                                                class="
                                                                    preloader-component
                                                                    me-2
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        status
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            spinner-chase
                                                                            w-20px
                                                                            h-20px
                                                                        "
                                                                    >
                                                                        <div
                                                                            class="
                                                                                chase-dot
                                                                            "
                                                                        ></div>
                                                                        <div
                                                                            class="
                                                                                chase-dot
                                                                            "
                                                                        ></div>
                                                                        <div
                                                                            class="
                                                                                chase-dot
                                                                            "
                                                                        ></div>
                                                                        <div
                                                                            class="
                                                                                chase-dot
                                                                            "
                                                                        ></div>
                                                                        <div
                                                                            class="
                                                                                chase-dot
                                                                            "
                                                                        ></div>
                                                                        <div
                                                                            class="
                                                                                chase-dot
                                                                            "
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <strong
                                                                >Loading...</strong
                                                            >
                                                        </div>
                                                        <div
                                                            v-if="
                                                                x.detailLoaded &&
                                                                x.prItems
                                                                    .length == 0
                                                            "
                                                            class="text-center"
                                                        >
                                                            No items found
                                                        </div>
                                                        <table
                                                            width="100%"
                                                            v-if="
                                                                x.prItems
                                                                    .length > 0
                                                            "
                                                        >
                                                            <tr>
                                                                <th class="p-2">
                                                                    Item Name
                                                                </th>
                                                                <th
                                                                    style="
                                                                        width: 160px;
                                                                    "
                                                                    class="p-2"
                                                                >
                                                                    Unit Cost
                                                                </th>
                                                                <th
                                                                    style="
                                                                        width: 160px;
                                                                    "
                                                                    class="p-2"
                                                                >
                                                                    Total
                                                                </th>
                                                            </tr>
                                                            <tr
                                                                v-for="y in x.prItems"
                                                                :key="y.id"
                                                            >
                                                                <td class="p-2">
                                                                    {{
                                                                        y.totalQuantity
                                                                    }}
                                                                    x
                                                                    <b>{{
                                                                        y
                                                                            .apiResource
                                                                            .itemName
                                                                    }}</b>
                                                                    <div>
                                                                        <small
                                                                            >{{
                                                                                y
                                                                                    .apiResource
                                                                                    .description
                                                                            }}</small
                                                                        >
                                                                    </div>
                                                                </td>
                                                                <td class="p-2">
                                                                    {{
                                                                        Intl.NumberFormat(
                                                                            "ja-JP",
                                                                            {
                                                                                currency:
                                                                                    "PHP",
                                                                                style: "currency",
                                                                            }
                                                                        ).format(
                                                                            y.unitCost
                                                                        )
                                                                    }}
                                                                </td>
                                                                <td class="p-2">
                                                                    {{
                                                                        Intl.NumberFormat(
                                                                            "ja-JP",
                                                                            {
                                                                                currency:
                                                                                    "PHP",
                                                                                style: "currency",
                                                                            }
                                                                        ).format(
                                                                            y.total
                                                                        )
                                                                    }}
                                                                </td>
                                                            </tr>
                                                            <tr
                                                                class="
                                                                    border
                                                                    border-dashed
                                                                "
                                                            >
                                                                <td
                                                                    class="py-2"
                                                                ></td>
                                                                <td
                                                                    class="
                                                                        text-right
                                                                        py-2
                                                                        px-2
                                                                    "
                                                                >
                                                                    Total:
                                                                </td>
                                                                <td
                                                                    colspan="3"
                                                                    class="p-2"
                                                                >
                                                                    {{
                                                                        Intl.NumberFormat(
                                                                            "ja-JP",
                                                                            {
                                                                                currency:
                                                                                    "PHP",
                                                                                style: "currency",
                                                                            }
                                                                        ).format(
                                                                            getTotalPerPR(
                                                                                x.prItems
                                                                            )
                                                                        )
                                                                    }}
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </b-collapse>
                                                    <hr />
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                            justify-content-between
                                                            cursor-pointer
                                                        "
                                                        @click="
                                                            getAttachments(x)
                                                        "
                                                    >
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-paperclip
                                                                    rotate
                                                                    rotate-90
                                                                "
                                                            ></i>
                                                            Attachments
                                                        </h5>
                                                        <h5 class="mb-0">
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-chevron-right
                                                                    rotate
                                                                "
                                                                :class="{
                                                                    'rotate-90':
                                                                        x.attachmentVisible,
                                                                }"
                                                            ></i>
                                                        </h5>
                                                    </div>
                                                    <b-collapse
                                                        :visible="
                                                            x.attachmentVisible
                                                        "
                                                        :accordion="`approved-attachment-accordion-${x.id}`"
                                                        role="tabpanel"
                                                    >
                                                        <hr />
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
                                                                        x
                                                                            .prFiles
                                                                            .length ==
                                                                        0
                                                                    "
                                                                >
                                                                    <i
                                                                        >No
                                                                        documents
                                                                        found</i
                                                                    >
                                                                </p>
                                                                <input
                                                                    v-if="
                                                                        x
                                                                            .prFiles
                                                                            .length >
                                                                        0
                                                                    "
                                                                    type="search"
                                                                    class="
                                                                        form-control
                                                                    "
                                                                    v-model="
                                                                        x.fileSearch
                                                                    "
                                                                    @input="
                                                                        searchDocu(
                                                                            x
                                                                        )
                                                                    "
                                                                    placeholder="Search Documents..."
                                                                />
                                                            </div>
                                                            <div class="">
                                                                <a
                                                                    href="javascript:void(0);"
                                                                    class="
                                                                        text-primary
                                                                        border-primary
                                                                        border
                                                                        p-2
                                                                    "
                                                                    :id="`approved-document${x.id}`"
                                                                    @click="
                                                                        x.addDocu = true
                                                                    "
                                                                    ><i
                                                                        class="
                                                                            bx
                                                                            bx-plus
                                                                        "
                                                                    ></i
                                                                    >Upload
                                                                    Documents</a
                                                                >
                                                                <upload-popover
                                                                    :option="
                                                                        uploadOptions
                                                                    "
                                                                    :sourceId="
                                                                        x.id
                                                                    "
                                                                    @uploaded="
                                                                        uploadedApproved(
                                                                            $event,
                                                                            x.id
                                                                        )
                                                                    "
                                                                    :showPV="
                                                                        x.addDocu
                                                                    "
                                                                    @closePopover="
                                                                        x.addDocu = false
                                                                    "
                                                                    :dzId="`dropzone-approved${x.id}`"
                                                                    :pvId="`approved-document${x.id}`"
                                                                ></upload-popover>
                                                            </div>
                                                        </div>
                                                        <div class="mt-2">
                                                            <b-row>
                                                                <b-col
                                                                    sm="3"
                                                                    v-for="(
                                                                        y, index
                                                                    ) in searchDocu(x)"
                                                                    :key="y.id"
                                                                    class="mb-2"
                                                                >
                                                                    <div
                                                                        class="
                                                                            position-relative
                                                                            cursor-pointer
                                                                        "
                                                                        :style="`z-index: ${
                                                                            searchDocu(x).length -
                                                                            index
                                                                        }`"
                                                                    >
                                                                        <div
                                                                            class="
                                                                                border
                                                                                p-3
                                                                            "
                                                                        >
                                                                            <div>
                                                                                <div
                                                                                    class="
                                                                                        float-end
                                                                                        ms-2
                                                                                    "
                                                                                >
                                                                                    <b-dropdown
                                                                                        id="dropdown-dropleft"
                                                                                        right
                                                                                        variant="link"
                                                                                        toggle-class="text-decoration-none text-dark font-size-16 pt-0"
                                                                                        menu-class="dropdown-menu-end"
                                                                                        no-caret
                                                                                    >
                                                                                        <template
                                                                                            #button-content
                                                                                        >
                                                                                            <i
                                                                                                class="
                                                                                                    mdi
                                                                                                    mdi-dots-horizontal
                                                                                                "
                                                                                            ></i>
                                                                                        </template>
                                                                                        <b-dropdown-item
                                                                                            @click="
                                                                                                openDocument(
                                                                                                    y
                                                                                                )
                                                                                            "
                                                                                            ><i
                                                                                                class="
                                                                                                    bx
                                                                                                    bx-link-external
                                                                                                    me-1
                                                                                                "
                                                                                            ></i
                                                                                            >Open</b-dropdown-item
                                                                                        >
                                                                                        <b-dropdown-item
                                                                                            variant="danger"
                                                                                            @click="removeFile(y.id, x.id, 'approved')"
                                                                                            ><i
                                                                                                class="
                                                                                                    bx
                                                                                                    bx-trash
                                                                                                    me-1
                                                                                                "
                                                                                            ></i
                                                                                            >Remove</b-dropdown-item
                                                                                        >
                                                                                    </b-dropdown>
                                                                                </div>
                                                                                <div
                                                                                    class="
                                                                                        avatar-xs
                                                                                        me-3
                                                                                        mb-2
                                                                                    "
                                                                                    @click="
                                                                                        openDocument(
                                                                                            y
                                                                                        )
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
                                                                                                mdi
                                                                                                mdi-image
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
                                                                                <div
                                                                                    class="
                                                                                        d-flex
                                                                                    "
                                                                                    @click="
                                                                                        openDocument(
                                                                                            y
                                                                                        )
                                                                                    "
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
                                                                                            {{
                                                                                                y.description
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
                                                                    searchDocu(x)
                                                                        .length ==
                                                                    0
                                                                    && x.fileSearch
                                                                "
                                                            >
                                                                <b-col
                                                                    >Search Not
                                                                    Found</b-col
                                                                >
                                                            </b-row>
                                                        </div>
                                                    </b-collapse>
                                                    <hr />
                                                    <div class="d-flex">
                                                        <button
                                                            type="button"
                                                            class="
                                                                btn btn-warning
                                                                me-2
                                                            "
                                                            @click="
                                                                returnPR(
                                                                    x,
                                                                    'approved'
                                                                )
                                                            "
                                                        >
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-revision
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Return Purchase
                                                            Request
                                                        </button>
                                                        <button
                                                            type="button"
                                                            class="
                                                                btn btn-purple
                                                            "
                                                            @click="printPR(x)"
                                                        >
                                                            <i
                                                                class="
                                                                    bx
                                                                    bxs-printer
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Print Purchase
                                                            Request
                                                        </button>
                                                    </div>
                                                </b-card-body>
                                            </b-collapse>
                                        </b-card>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </b-tab>
                </b-tabs>
            </div>
        </div>
    </Layout>
</template>