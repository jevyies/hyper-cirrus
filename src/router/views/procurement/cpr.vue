<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { Carousel, Slide } from "vue-carousel";
import { required } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import ApiItems from "@/components/modals/api-items.vue";
import ModeOfProcurement from "@/components/modals/mode-of-procurement.vue";
// import CPRLogs from "@/components/modals/cpr-logs.vue";

export default {
    page: {
        title: "Consolidated Procurable Resource",
    },
    components: {
        Layout,
        PageHeader,
        Carousel,
        Slide,
        DatePicker,
        ApiItems,
        ModeOfProcurement,
        // CPRLogs,
    },
    data() {
        return {
            title: "Consolidated Procurable Resource",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Consolidated Procurable Resource",
                    active: true,
                },
            ],
            modalTitle: "",
            totalRows: 1,
            pageOptions: [12, 24, 52, 100],
            perPage: 10,

            cprData: [],
            filterCPR: "",
            cprPageOptions: [10, 25, 50, 100],
            perPageCPR: 10,
            currentPageCPR: 1,
            cprLoading: false,
            cprIndex: -1,
            selectedCPRStat: "",
            cpr: {
                id: 0,
                description: "",
                cycle: "",
            },

            cprItems: [],
            cprItem: {
                id: 0,
                consolidatedProcurableResourceId: "",
                apiId: "",
                modeOfProcurement: "",
                advertisement: "",
                submission: "",
                noticeOfAward: "",
                contractSigning: "",
                remarks: "",
                api: {},
            },
            cprItemLoading: false,
            selectedCPR: "",
            selectedCPRId: 0,
            filterItem: "",
            perPageItem: 12,
            currentPageItem: 1,
            item: {},
            itemName: "",
            itemCategory: "",
            unit: "",
            itemDetails: [],
            itemIndex: -1,

            // manage cpr
            postedData: [],
            totalRowsPosted: 1,
            currentPostedPage: 1,
            perPagePosted: 10,
            filterPosted: null,
            filterOnPosted: [],
            sortByPosted: "itemName",
            sortDescPosted: false,
            postedFields: [
                {
                    key: "displayDetails",
                    sortable: false,
                    label: " ",
                    thStyle: { width: "30px" },
                },
                {
                    key: "description",
                    sortable: true,
                    label: "CPR Description",
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
            filterApproved: null,
            filterOnApproved: [],
            sortByApproved: "itemName",
            sortDescApproved: false,
            approvedFields: [
                {
                    key: "displayDetails",
                    sortable: false,
                    label: " ",
                    thStyle: { width: "30px" },
                },
                {
                    key: "description",
                    sortable: true,
                    label: "CPR Description",
                },
                {
                    key: "actions",
                    thStyle: { width: "200px" },
                },
            ],
            indexSelected: -1,
            postedBusy: false,
            approvedBusy: false,
            tableIndex: -1,
            form: {
                id: "",
                remarks: "",
            },
            prType: "posted",
        };
    },
    validations: {
        item: {},
        cpr: {
            description: { required },
            cycle: { required },
        },
        cprItem: {
            apiId: { required },
            modeOfProcurement: { required },
            advertisement: { required },
            submission: { required },
            noticeOfAward: { required },
            contractSigning: { required },
            remarks: { required },
        },
        form: {
            remarks: { required },
        },
    },
    computed: {
        filteredCPR() {
            let data = this.cprData;
            var total = this.currentPageCPR * this.perPageCPR;
            if (this.filterCPR.trim() != "" && this.filterCPR) {
                data = data.filter((item) => {
                    return item.description
                        .toUpperCase()
                        .includes(this.filterCPR.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageCPR, total);
            if (this.currentPageCPR > 1 && currentData.length == 0) {
                total = (this.currentPageCPR - 1) * this.perPageCPR;
                currentData = data.slice(total - this.perPageCPR, total);
            }
            return currentData;
        },
        rowsCPR() {
            if (this.filterCPR.trim() != "" && this.filterCPR) {
                return this.filteredCPR.length;
            } else {
                return this.cprData.length;
            }
        },
        filteredCPRItems() {
            let data = this.cprItems;
            var total = this.currentPageItem * this.perPageItem;
            if (this.filterItem.trim() != "" && this.filterItem) {
                data = data.filter((item) => {
                    return item.api.description
                        .toUpperCase()
                        .includes(this.filterItem.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageItem, total);
            if (this.currentPageItem > 1 && currentData.length == 0) {
                total = (this.currentPageItem - 1) * this.perPageItem;
                currentData = data.slice(total - this.perPageItem, total);
            }
            return currentData;
        },
        rowsCPRItem() {
            if (this.filterItem.trim() != "" && this.filterItem) {
                return this.filteredCPRItems.length;
            } else {
                return this.cprItems.length;
            }
        },
        rowsPosted() {
            if (this.filter) {
                return this.totalRows;
            }
            return this.postedData.length;
        },
        rowsApproved() {
            if (this.filter) {
                return this.totalRows;
            }
            return this.approvedData.length;
        },
    },
    created() {
        this.changeCycle(this.$store.state.data.cycle);
    },
    methods: {
        // Consolidated Procurable Resource
        changeCycle(cycle) {
            this.getCPR(cycle);
            this.getCPRPosted(cycle);
            this.getCPRApproved(cycle);
        },
        getCPR(event) {
            this.cprLoading = true;
            this.$store
                .dispatch("cpr/GetPendingCPRByYear", event)
                .then((res) => {
                    this.cprLoading = false;
                    this.cprData = res.data;
                })
                .catch((err) => {
                    let stringErr = err.toString();
                    this.showToast("Something went wrong! - getting Consolidated Procurable Resource", 'error');
                    this.cprLoading = false;
                });
        },
        onResetCPR() {
            this.cpr = {
                id: 0,
                description: "",
                cycle: this.$store.state.data.cycle,
            };
        },
        addNewCPR() {
            this.onResetCPR();
            this.modalTitle = "Create New CPR";
            this.$bvModal.show("cpr-modal");
        },
        hideModalCPR() {
            this.$bvModal.hide("cpr-modal");
        },
        onCreateCPR() {
            this.submitted = true;
            this.$v.cpr.$touch();
            if (this.$v.cpr.$invalid) {
                return;
            }
            var data = cloneDeep(this.cpr);
            if (this.cpr.id > 0) {
                this.$store
                    .dispatch("cpr/UpdateCpr", data)
                    .then((res) => {
                        if (res.data.error) {
                            return this.showToast(res.data.errorMessage, "error");
                        }
                        this.cprData.splice(this.cprIndex, 1, res.data);
                        this.$bvModal.hide("cpr-modal");
                        this.showToast("Successfully updated", "success");
                    })
                    .catch((err) => {
                        let stringErr = err.toString();
                        this.showToast("Something went wrong! - updating Consolidated Procurable Resource", 'error');
                    });
            } else {
                this.$store
                    .dispatch("cpr/CreateCpr", data)
                    .then((res) => {
                        if (res.data.error) {
                            return this.showToast(res.data.errorMessage, "error");
                        }
                        this.cprData.push(res.data);
                        this.$bvModal.hide("cpr-modal");
                        this.showToast("Successfully created", "success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong! - creating Consolidated Procurable Resource", 'error');
                    });
            }
            this.submitted = false;
        },
        updateCPR(row) {
            if (row.status === "Posted" || row.status === "Approved") {
                return this.showToast("Cannot update posted or approved CPR", "warning");
            }
            this.cpr = cloneDeep(row);
            this.cprIndex = this.cprData.indexOf(row);
            this.modalTitle = "Update CPR";
            this.$bvModal.show("cpr-modal");
        },
        deleteCPR(props) {
            if (props.status === "Posted" || props.status === "Approved") {
                return this.showToast("Cannot delete posted or approved CPR", "warning");
            }
            var index = this.cprData.indexOf(props);
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#5c636a",
                confirmButtonText: "Yes, delete it!",
            }).then((result) => {
                if (result.value) {
                    this.$store
                        .dispatch("cpr/DeleteCpr", props.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.cprData.splice(index, 1);
                                this.showToast("Successfully deleted", "success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!", 'error');
                        });
                }
            });
        },
        deleteCPRItem(props) {
            var index = this.cprItems.indexOf(props);
            if (props.id == 0) {
                return this.cprItems.splice(index, 1);
            }
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#5c636a",
                confirmButtonText: "Yes, delete it!",
            }).then((result) => {
                if (result.value) {
                    this.$store
                        .dispatch("cpritem/DeleteCprItem", props.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.cprItems.splice(index, 1);
                                this.showToast("Successfully deleted", "success");
                            }
                        })
                        .catch((err) => {
                            let stringErr = err.toString();
                            this.showToast("Cannot be deleted!", 'error');
                        });
                }
            });
        },
        postCPR() {
            if (this.cprItems.length == 0) {
                return this.showToast("CPR Items cannot be empty!", "warning");
            }
            if (!this.cprItems[0].id) {
                return this.showToast("Save item/s first!", "warning");
            }
            Swal.fire({
                title: "Are you sure?",
                text: "You want to post this?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#34c38f",
                cancelButtonColor: "#f46a6a",
                confirmButtonText: "Yes, post it!",
            }).then((result) => {
                if (result.value) {
                    this.$store
                        .dispatch("cpr/PostCPR", this.selectedCPRId)
                        .then((res) => {
                            this.postedData.push(this.cprData[this.cprIndex])
                            this.cprData.splice(this.cprIndex, 1)
                            this.returnToCpr();
                            this.showToast("Successfully posted", "success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong! - posting consolidated procurable resource", "error");
                        });
                }
            });
        },
        returnToCpr() {
            this.$refs.carousel.goToPage(this.$refs.carousel.getPreviousPage());
        },
        viewCPRDetails(row) {
            this.selectedCPR = `${row.description}'s Details`;
            this.selectedCPRId = row.id;
            this.cpr = cloneDeep(row);
            this.selectedCPRStat = cloneDeep(row.status);
            this.cprIndex = this.cprData.indexOf(row);
            this.$refs.carousel.goToPage(this.$refs.carousel.getNextPage());
            this.getCPRDetails(row.id);
        },
        getCPRDetails(id) {
            this.cprItemLoading = true;
            this.$store
                .dispatch("cpritem/GetAllCprItems", id)
                .then((res) => {
                    res.data.forEach((item) => {
                        item.expand = false;
                    });
                    this.cprItems = res.data;
                    this.cprItemLoading = false;
                })
                .catch((err) => {
                    this.cprItemLoading = false;
                    let stringErr = err.toString();
                    this.showToast("Something went wrong! - getting consolidated procurable resource items", "error");
                });
        },
        onResetCPRItem() {
            this.cprItem = {
                id: 0,
                consolidatedProcurableResourceId: this.selectedCPRId,
                apiId: "",
                modeOfProcurement: "",
                advertisement: "",
                submission: "",
                noticeOfAward: "",
                contractSigning: "",
                remarks: "",
                api: {},
            };
        },
        addNewCPRItem() {
            this.onResetCPRItem();
            this.modalTitle = "Create New CPR Item";
            this.$bvModal.show("cpr-item-modal");
        },
        onCreateCPRItems() {
            this.submitted = true;
            this.$v.cprItem.$touch();
            if (this.$v.cprItem.$invalid) {
                return;
            } else {
                var data = cloneDeep(this.cprItem);
                data.advertisement = this.getDate(this.cprItem.advertisement);
                data.submission = this.getDate(this.cprItem.submission);
                data.noticeOfAward = this.getDate(this.cprItem.noticeOfAward);
                data.contractSigning = this.getDate(
                    this.cprItem.contractSigning
                );
                if (this.cprItem.id > 0) {
                    this.$store
                        .dispatch("cpritem/UpdateCprItem", data)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.errorMessage, "error");
                            }
                            this.cprItems.splice(this.itemIndex, 1, data);
                            this.$bvModal.hide("cpr-item-modal");
                            this.showToast("Successfully updated", "success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong! - updating cpr item", "error");
                        });
                } else {
                    this.$store
                        .dispatch("cpritem/CreateCprItem", data)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.errorMessage, "error");
                            }
                            data.id = res.data.id;
                            this.cprItems.push(data);
                            this.$bvModal.hide("cpr-item-modal");
                            this.showToast("Successfully created", "success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong! - creating cpr item", "error");
                        });
                }
                this.submitted = false;
            }
        },
        updateItem(props) {
            this.cprItem = cloneDeep(props);
            this.cprItem.noticeOfAward =
                props.noticeOfAward === "0001-01-01T00:00:00"
                    ? ""
                    : new Date(props.noticeOfAward);
            this.cprItem.submission =
                props.submission === "0001-01-01T00:00:00"
                    ? ""
                    : new Date(props.submission);
            this.cprItem.advertisement =
                props.advertisement === "0001-01-01T00:00:00"
                    ? ""
                    : new Date(props.advertisement);
            this.cprItem.contractSigning =
                props.contractSigning === "0001-01-01T00:00:00"
                    ? ""
                    : new Date(props.contractSigning);
            this.itemIndex = this.cprItems.indexOf(props);
            this.modalTitle = "Update CPR Details";
            this.$bvModal.show("cpr-item-modal");
        },
        hideItemModal() {
            this.$bvModal.hide("cpr-item-modal");
        },
        dropWork(data) {
            if (data.success) {
                this.showToast("Successfully imported!", "success");
            }
            this.getCPRDetails(this.selectedCPRId);
        },
        // CPR Logs
        viewCPRLogs(id) {
            this.$refs.log.getData(id);
            this.$bvModal.show("cpr-log-modal");
        },
        importAPI() {
            this.$refs.cprWork.parentID = this.selectedCPRId;
            this.$refs.cprWork.tableData = [];
            this.$refs.cprWork.fundSource = "";
            this.$bvModal.show("import-api-modal");
        },
        getMOP() {
            this.$bvModal.show("mode-of-procurement-modal");
        },
        dropMOP(data) {
            this.cprItem.modeOfProcurement = data.name;
        },

        // manage CPR
        getCPRPosted(event) {
            this.postedBusy = true;
            this.$store
                .dispatch("cpr/GetPostedCpr", event)
                .then((res) => {
                    this.postedBusy = false;
                    res.data.forEach((item) => {
                        item.cprItems = [];
                        item.loaded = false;
                        item.loadingItems = false;
                    });
                    this.postedData = res.data;
                })
                .catch(() => {
                    this.postedBusy = false;
                    this.showToast("Something went wrong! - getting posted cpr", "error");
                });
        },
        getCPRApproved(event) {
            this.approvedBusy = true;
            this.$store
                .dispatch("cpr/GetApprovedCpr", event)
                .then((res) => {
                    res.data.forEach((item) => {
                        item.cprItems = [];
                        item.loaded = false;
                        item.loadingItems = false;
                    });
                    this.approvedBusy = false;
                    this.approvedData = res.data;
                })
                .catch(() => {
                    this.approvedBusy = false;
                    this.showToast("Something went wrong! - getting approved cpr", "error");
                });
        },
        onFilteredPosted(filteredItems) {
            this.totalRowsPosted = filteredItems.length;
            this.currentPostedPage = 1;
        },
        onFilteredApproved(filteredItems) {
            this.totalRowsApproved = filteredItems.length;
            this.currentApprovedPage = 1;
        },
        returnCPR(row, type) {
            this.prType = cloneDeep(type);
            this.tableIndex =
                type === "posted"
                    ? this.postedData.indexOf(row)
                    : this.approvedData.indexOf(row);
            this.form.id = row.id;
            this.form.remarks = "";
            this.$bvModal.show("return-modal");
        },
        approveCPR(row) {
            this.tableIndex = this.postedData.indexOf(row);
            Swal.fire({
                title: "Are you sure?",
                text: "You want to approve this CPR?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#34c38f",
                cancelButtonColor: "#f46a6a",
                confirmButtonText: "Yes, approve it!",
            }).then((result) => {
                if (result.isConfirmed) {
                    this.$store
                        .dispatch("cpr/ApproveCPR", row.id)
                        .then((res) => {
                            this.postedData.splice(this.tableIndex, 1);
                            this.approvedData.push(row);
                            this.showToast("Successfully approved!", "success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong! - approving cpr", "error");
                        });
                }
            });
        },
        returnCPRSubmit() {
            this.submitted = true;
            this.$v.form.$touch();
            if (this.$v.form.$invalid) {
                return;
            }
            this.$store
                .dispatch("cpr/ReturnCPR", this.form)
                .then((res) => {
                    if (this.prType === "posted") {
                        this.postedData[this.tableIndex].status = 'Return';
                        this.cprData.push(this.postedData[this.tableIndex]);
                        this.postedData.splice(this.tableIndex, 1);
                    } else {
                        this.approvedData[this.tableIndex].status = 'Return';
                        this.cprData.push(this.approvedData[this.tableIndex]);
                        this.approvedData.splice(this.tableIndex, 1);
                    }
                    this.showToast("Successfully returned!", "success");
                    this.$bvModal.hide("return-modal");
                })
                .catch((err) => {
                    this.showToast("Something went wrong! - returning cpr", "error");
                });
        },
        hideModal() {
            this.$bvModal.hide("return-modal");
        },
        getDetailsByRow(row) {
            row.toggleDetails();
            if (!row.item.loaded) {
                row.item.loadingItems = true;
                this.$store
                    .dispatch("cpritem/GetAllCprItems", row.item.id)
                    .then((res) => {
                        row.item.cprItems = res.data;
                        row.item.loadingItems = false;
                    })
                    .catch((err) => {
                        row.item.loadingItems = false;
                        let stringErr = err.toString();
                        this.showToast("Something went wrong! - getting cpr items", "error");
                    });
            }
        },
    },
};
</script>
<template>
    <Layout @changeCycle="changeCycle">
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="cpr-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreateCPR"
                class="needs-validation"
                ref="apiForm"
            >
                <b-row>
                    <b-col>
                        <div class="mb-3">
                            <label for="description">Description </label>
                            <textarea
                                id="description"
                                rows="3"
                                v-model="cpr.description"
                                placeholder="Enter Description..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.cpr.description.$error,
                                }"
                            ></textarea>
                            <div
                                v-if="submitted && $v.cpr.description.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.cpr.description.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div>
                            <label for="yearList">Year</label>
                            <input
                                type="text"
                                placeholder="Input Year..."
                                class="form-control"
                                v-model="cpr.cycle"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.cpr.cycle.$error,
                                }"
                                disabled
                            />
                        </div>
                    </b-col>
                </b-row>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Save changes
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="hideModalCPR"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-modal
            id="cpr-item-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreateCPRItems"
                class="needs-validation"
                ref="cprItemForm"
            >
                <div class="mb-3">
                    <label for="modeOfProcurement">Mode of Procurement </label>
                    <b-input-group>
                        <template #append>
                            <b-button @click="getMOP" variant="outline-info"
                                ><i
                                    class="
                                        mdi mdi-clipboard-text-search-outline
                                    "
                                ></i
                            ></b-button>
                        </template>
                        <input
                            id="modeOfProcurement"
                            type="text"
                            v-model="cprItem.modeOfProcurement"
                            placeholder="Enter Mode of Procurement..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted &&
                                    $v.cprItem.modeOfProcurement.$error,
                            }"
                            autocomplete="off"
                            disabled
                        />
                        <div
                            v-if="
                                submitted && $v.cprItem.modeOfProcurement.$error
                            "
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.cprItem.modeOfProcurement.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-input-group>
                </div>
                <b-row class="mb-3">
                    <b-col sm="6">
                        <label for="advertisement">Advertisement </label>
                        <date-picker
                            v-model="cprItem.advertisement"
                            :first-day-of-week="1"
                            lang="en"
                            placeholder="Enter Advertisement..."
                            :class="{
                                'is-invalid':
                                    submitted &&
                                    $v.cprItem.advertisement.$error,
                            }"
                        ></date-picker>
                        <div
                            v-if="submitted && $v.cprItem.advertisement.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.cprItem.advertisement.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-col>
                    <b-col sm="6">
                        <label for="submission">Submission </label>
                        <date-picker
                            v-model="cprItem.submission"
                            :first-day-of-week="1"
                            lang="en"
                            placeholder="Enter Submission..."
                            :class="{
                                'is-invalid':
                                    submitted && $v.cprItem.submission.$error,
                            }"
                        ></date-picker>
                        <div
                            v-if="submitted && $v.cprItem.submission.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.cprItem.submission.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-col>
                </b-row>
                <b-row class="mb-3">
                    <b-col sm="6">
                        <label for="noticeOfAward">Notice of Award </label>
                        <date-picker
                            v-model="cprItem.noticeOfAward"
                            :first-day-of-week="1"
                            lang="en"
                            placeholder="Enter Notice of Award..."
                            :class="{
                                'is-invalid':
                                    submitted &&
                                    $v.cprItem.noticeOfAward.$error,
                            }"
                        ></date-picker>
                        <div
                            v-if="submitted && $v.cprItem.noticeOfAward.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.cprItem.noticeOfAward.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-col>
                    <b-col sm="6">
                        <label for="contractSigning">Contract Signing</label>
                        <date-picker
                            v-model="cprItem.contractSigning"
                            :first-day-of-week="1"
                            lang="en"
                            placeholder="Enter Notice of Award..."
                            :class="{
                                'is-invalid':
                                    submitted &&
                                    $v.cprItem.contractSigning.$error,
                            }"
                        ></date-picker>
                        <div
                            v-if="
                                submitted && $v.cprItem.contractSigning.$error
                            "
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.cprItem.contractSigning.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-col>
                </b-row>
                <div class="mb-3">
                    <label for="remarks">Remarks </label>
                    <textarea
                        id="remarks"
                        rows="3"
                        v-model="cprItem.remarks"
                        placeholder="Enter Remarks..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.cprItem.remarks.$error,
                        }"
                    ></textarea>
                    <div
                        v-if="submitted && $v.cprItem.remarks.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.cprItem.remarks.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Save changes
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="hideItemModal"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-modal
            id="return-modal"
            title="Return Remarks"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form @submit.prevent="returnCPRSubmit" class="needs-validation">
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
                        Return CPR
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="hideModal"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-tabs
            nav-class="nav-tabs-custom"
            content-class="pt-3 pb-3 text-muted"
        >
            <b-tab active>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block">Pending</span>
                </template>
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
                        <b-row>
                            <b-col sm="3">
                                <div class="card">
                                    <div class="card-body p-4">
                                        <div class="search-box">
                                            <p class="text-muted">Search</p>
                                            <div class="position-relative">
                                                <input
                                                    autocomplete="off"
                                                    type="text"
                                                    class="
                                                        form-control
                                                        rounded
                                                        border-light
                                                    "
                                                    placeholder="Search CPR..."
                                                    v-model="filterCPR"
                                                />
                                                <i
                                                    class="
                                                        mdi mdi-magnify
                                                        search-icon
                                                    "
                                                ></i>
                                            </div>
                                        </div>

                                        <hr class="my-3" />
                                        <button
                                            type="button"
                                            @click="addNewCPR"
                                            class="
                                                btn btn-md btn-block btn-primary
                                                d-flex
                                                align-items-center
                                                justify-content-center
                                            "
                                        >
                                            <i class="bx bx-plus fs-6"></i
                                            >Create New CPR
                                        </button>
                                        <hr class="my-3" />
                                    </div>
                                </div>
                            </b-col>
                            <b-col sm="9">
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div>
                                            <div class="table-responsive">
                                                <table
                                                    class="
                                                        table
                                                        project-list-table
                                                        table-nowrap
                                                        table-centered
                                                        table-borderless
                                                        align-middle
                                                    "
                                                >
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">
                                                                CPR Description
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                width="150px"
                                                            >
                                                                Status
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                width="150px"
                                                                class="
                                                                    text-center
                                                                "
                                                            >
                                                                Action
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-if="cprLoading">
                                                            <td colspan="3">
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        justify-content-center
                                                                        align-items-center
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
                                                            </td>
                                                        </tr>
                                                        <tr
                                                            v-if="
                                                                filteredCPR.length ==
                                                                    0 &&
                                                                !cprLoading
                                                            "
                                                        >
                                                            <td
                                                                colspan="3"
                                                                class="
                                                                    text-muted
                                                                    text-center
                                                                "
                                                            >
                                                                <i
                                                                    class="
                                                                        dripicons-warning
                                                                        me-1
                                                                    "
                                                                ></i
                                                                >No data found
                                                            </td>
                                                        </tr>
                                                        <tr
                                                            v-for="x in filteredCPR"
                                                            :key="x.id"
                                                        >
                                                            <td>
                                                                <h5
                                                                    class="
                                                                        text-truncate
                                                                        font-size-14
                                                                    "
                                                                >
                                                                    <a
                                                                        @click="
                                                                            viewCPRDetails(
                                                                                x
                                                                            )
                                                                        "
                                                                        href="javascript: void(0);"
                                                                        class="
                                                                            text-dark
                                                                        "
                                                                        >{{
                                                                            x.description
                                                                        }}</a
                                                                    >
                                                                </h5>
                                                            </td>
                                                            <td>
                                                                <span
                                                                    class="
                                                                        badge
                                                                        bg-warning
                                                                        bg-soft
                                                                        text-warning
                                                                        font-size-14
                                                                    "
                                                                >
                                                                    {{
                                                                        x.status
                                                                    }}
                                                                </span>
                                                            </td>
                                                            <td
                                                                class="
                                                                    text-center
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        justify-content-center
                                                                    "
                                                                >
                                                                    <!-- <i
                                                                        title="CPR Logs"
                                                                        class="
                                                                            mdi
                                                                            mdi-file-document
                                                                            font-size-18
                                                                            cursor-pointer
                                                                            me-1
                                                                        "
                                                                        @click="
                                                                            viewCPRLogs(
                                                                                x.id
                                                                            )
                                                                        "
                                                                    ></i> -->
                                                                    <i
                                                                        title="Edit"
                                                                        class="
                                                                            mdi
                                                                            mdi-circle-edit-outline
                                                                            font-size-18
                                                                            text-dark
                                                                            cursor-pointer
                                                                            me-1
                                                                        "
                                                                        @click="
                                                                            updateCPR(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></i>
                                                                    <i
                                                                        title="Delete"
                                                                        class="
                                                                            mdi
                                                                            mdi-trash-can-outline
                                                                            font-size-18
                                                                            text-danger
                                                                            cursor-pointer
                                                                            me-1
                                                                        "
                                                                        @click="
                                                                            deleteCPR(
                                                                                x
                                                                            )
                                                                        "
                                                                    ></i>
                                                                    <i
                                                                        @click="
                                                                            viewCPRDetails(
                                                                                x
                                                                            )
                                                                        "
                                                                        title="View CPR Details"
                                                                        class="
                                                                            mdi
                                                                            mdi-chevron-right
                                                                            font-size-18
                                                                            text-primary
                                                                            cursor-pointer
                                                                        "
                                                                    ></i>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col">
                                        <div
                                            id="tickets-table_length"
                                            class="dataTables_length"
                                        >
                                            <label
                                                class="
                                                    d-inline-flex
                                                    align-items-center
                                                "
                                            >
                                                Show&nbsp;
                                                <b-form-select
                                                    class="form-select"
                                                    v-model="perPage"
                                                    size="sm"
                                                    :options="cprPageOptions"
                                                ></b-form-select
                                                >&nbsp;entries
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div
                                            class="
                                                dataTables_paginate
                                                paging_simple_numbers
                                                float-end
                                            "
                                        >
                                            <ul
                                                class="
                                                    pagination
                                                    pagination-rounded
                                                    mb-0
                                                "
                                            >
                                                <!-- pagination -->
                                                <b-pagination
                                                    v-model="currentPageCPR"
                                                    :total-rows="rowsCPR"
                                                    :per-page="perPageCPR"
                                                ></b-pagination>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </b-col>
                        </b-row>
                    </slide>
                    <slide>
                        <b-row>
                            <b-col sm="12">
                                <div class="d-flex align-items-center">
                                    <a
                                        href="javascript:void(0);"
                                        class="me-1"
                                        @click="returnToCpr()"
                                        ><i
                                            class="bx bx-left-arrow-alt fs-2"
                                        ></i
                                    ></a>
                                    <h4 class="d-flex align-items-center">
                                        {{ selectedCPR
                                        }}<span
                                            v-if="
                                                selectedCPRStat === 'Posted' ||
                                                selectedCPRStat === 'Approved'
                                            "
                                            class="
                                                badge
                                                bg-success bg-gradient
                                                ms-1
                                            "
                                            >{{ selectedCPRStat }}</span
                                        >
                                    </h4>
                                </div>
                            </b-col>
                            <b-col sm="12" class="mt-2">
                                <div class="row">
                                    <div class="col-md-6 d-flex">
                                        <div
                                            id="tickets-table_filter"
                                            class="dataTables_filter me-1"
                                        >
                                            <label
                                                class="
                                                    d-inline-flex
                                                    align-items-center
                                                "
                                            >
                                                <b-form-input
                                                    autocomplete="off"
                                                    v-model="filterItem"
                                                    type="search"
                                                    placeholder="Search Items..."
                                                    class="form-control"
                                                ></b-form-input>
                                            </label>
                                        </div>
                                        <div
                                            id="tickets-table_length"
                                            class="dataTables_length"
                                        >
                                            <label
                                                class="
                                                    d-inline-flex
                                                    align-items-center
                                                    mb-0
                                                "
                                            >
                                                <b-form-select
                                                    class="form-select"
                                                    v-model="perPageItem"
                                                    size="sm"
                                                    :options="pageOptions"
                                                ></b-form-select>
                                            </label>
                                        </div>
                                        <div
                                            class="ms-1"
                                            v-if="
                                                selectedCPRStat !== 'Posted' &&
                                                selectedCPRStat !== 'Approved'
                                            "
                                        >
                                            <button
                                                class="
                                                    btn btn-success
                                                    d-flex
                                                    align-items-center
                                                "
                                                @click="postCPR"
                                            >
                                                <i class="bx bx-task"></i> Post
                                                this CPR
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <button
                                            class="
                                                btn btn-info
                                                d-flex
                                                align-items-center
                                                float-end
                                            "
                                            @click="importAPI"
                                            v-if="
                                                selectedCPRStat !== 'Posted' &&
                                                selectedCPRStat !== 'Approved'
                                            "
                                        >
                                            <i class="bx bx-download me-1"></i>
                                            Import API Resources
                                        </button>
                                    </div>
                                </div>
                                <div class="row">
                                    <div
                                        class="col-lg-3"
                                        v-for="x in 4"
                                        :key="x"
                                    >
                                        <b-skeleton-wrapper
                                            :loading="cprItemLoading"
                                        >
                                            <template #loading>
                                                <div class="card">
                                                    <div class="card-body p-3">
                                                        <div class="mb-1">
                                                            <b-skeleton
                                                                width="20%"
                                                                height="12px"
                                                            ></b-skeleton>
                                                        </div>
                                                        <b-skeleton
                                                            width="100%"
                                                            height="18px"
                                                        ></b-skeleton>
                                                        <b-skeleton
                                                            width="50%"
                                                            height="12px"
                                                            class="mb-2"
                                                        ></b-skeleton>
                                                        <div class="row mb-1">
                                                            <div
                                                                class="col-md-6"
                                                            >
                                                                <b-skeleton
                                                                    width="100%"
                                                                    height="50px"
                                                                ></b-skeleton>
                                                            </div>
                                                            <div
                                                                class="col-md-6"
                                                            >
                                                                <b-skeleton
                                                                    width="100%"
                                                                    height="50px"
                                                                ></b-skeleton>
                                                            </div>
                                                        </div>
                                                        <div class="row mb-1">
                                                            <div
                                                                class="col-md-6"
                                                            >
                                                                <b-skeleton
                                                                    width="100%"
                                                                    height="50px"
                                                                ></b-skeleton>
                                                            </div>
                                                            <div
                                                                class="col-md-6"
                                                            >
                                                                <b-skeleton
                                                                    width="100%"
                                                                    height="50px"
                                                                ></b-skeleton>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                        </b-skeleton-wrapper>
                                    </div>
                                </div>
                                <h4
                                    v-if="
                                        cprItems.length == 0 && !cprItemLoading
                                    "
                                >
                                    No data found
                                </h4>
                                <h4
                                    v-if="
                                        filteredCPRItems.length == 0 &&
                                        cprItems.length > 0 &&
                                        !cprItemLoading
                                    "
                                >
                                    Search not found
                                </h4>
                                <div
                                    class="row mt-1"
                                    v-if="
                                        cprItems.length > 0 && !cprItemLoading
                                    "
                                >
                                    <div
                                        class="col-lg-3"
                                        v-for="x in filteredCPRItems"
                                        :key="x.id"
                                    >
                                        <div class="card">
                                            <div
                                                class="hide-detail-btn-sm"
                                                v-if="
                                                    selectedCPRStat.toUpperCase() !==
                                                        'POSTED' &&
                                                    selectedCPRStat.toUpperCase() !==
                                                        'APPROVED'
                                                "
                                            >
                                                <b-dropdown
                                                    id="dropdown-dropleft"
                                                    right
                                                    variant="link"
                                                    toggle-class="text-decoration-none"
                                                    menu-class="dropdown-menu-end"
                                                    size="sm"
                                                    no-caret
                                                >
                                                    <template #button-content>
                                                        <i
                                                            class="
                                                                fas
                                                                fa-ellipsis-v
                                                            "
                                                        ></i>
                                                    </template>
                                                    <b-dropdown-item
                                                        @click="updateItem(x)"
                                                        variant="secondary"
                                                        ><i
                                                            class="
                                                                bx bx-edit
                                                                font-size-18
                                                                me-1
                                                            "
                                                        ></i
                                                        >Edit</b-dropdown-item
                                                    >
                                                    <b-dropdown-item
                                                        @click="
                                                            deleteCPRItem(x)
                                                        "
                                                        variant="danger"
                                                        ><i
                                                            class="
                                                                mdi
                                                                mdi-trash-can
                                                                font-size-18
                                                                me-1
                                                            "
                                                        ></i
                                                        >Delete</b-dropdown-item
                                                    >
                                                </b-dropdown>
                                            </div>
                                            <div
                                                class="card-body py-2 px-3 mt-2"
                                            >
                                                <!-- <small class="text-muted"
                                                            >#{{ x.ppmp.ppmpNumber }}</small
                                                        > -->
                                                <div>
                                                    <h5 class="mb-0">
                                                        {{ x.api.description }}
                                                    </h5>
                                                    <span
                                                        class="
                                                            badge
                                                            rounded-pill
                                                            bg-purple
                                                        "
                                                        >{{
                                                            x.modeOfProcurement
                                                        }}</span
                                                    >
                                                </div>
                                                <div class="row mt-2">
                                                    <div class="col-md-6">
                                                        <div class="card mb-2">
                                                            <div
                                                                class="
                                                                    card-body
                                                                    p-2
                                                                    text-center
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                        justify-content-center
                                                                    "
                                                                >
                                                                    <i
                                                                        class="
                                                                            bx
                                                                            bx-user-voice
                                                                            font-size-18
                                                                            text-primary
                                                                            me-1
                                                                        "
                                                                    ></i>
                                                                    <small
                                                                        class="
                                                                            text-muted
                                                                        "
                                                                        >Advertisement</small
                                                                    >
                                                                </div>
                                                                <span
                                                                    v-if="
                                                                        x.advertisement ===
                                                                        '0001-01-01T00:00:00'
                                                                    "
                                                                    >N/A</span
                                                                >
                                                                <span v-else>{{
                                                                    formatDate(
                                                                        new Date(
                                                                            x.advertisement
                                                                        )
                                                                    )
                                                                }}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="card mb-2">
                                                            <div
                                                                class="
                                                                    card-body
                                                                    p-2
                                                                    text-center
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                        justify-content-center
                                                                    "
                                                                >
                                                                    <i
                                                                        class="
                                                                            bx
                                                                            bx-list-check
                                                                            font-size-18
                                                                            text-primary
                                                                            me-1
                                                                        "
                                                                    ></i>
                                                                    <small
                                                                        class="
                                                                            text-muted
                                                                        "
                                                                        >Submission</small
                                                                    >
                                                                </div>
                                                                <span
                                                                    v-if="
                                                                        x.advertisement ===
                                                                        '0001-01-01T00:00:00'
                                                                    "
                                                                    >N/A</span
                                                                >
                                                                <span v-else>{{
                                                                    formatDate(
                                                                        new Date(
                                                                            x.submission
                                                                        )
                                                                    )
                                                                }}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <div class="card mb-2">
                                                            <div
                                                                class="
                                                                    card-body
                                                                    p-2
                                                                    text-center
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                        justify-content-center
                                                                    "
                                                                >
                                                                    <i
                                                                        class="
                                                                            bx
                                                                            bx-award
                                                                            font-size-18
                                                                            text-primary
                                                                            me-1
                                                                        "
                                                                    ></i>
                                                                    <small
                                                                        class="
                                                                            text-muted
                                                                        "
                                                                        >Notice
                                                                        of
                                                                        Award</small
                                                                    >
                                                                </div>
                                                                <span
                                                                    v-if="
                                                                        x.advertisement ===
                                                                        '0001-01-01T00:00:00'
                                                                    "
                                                                    >N/A</span
                                                                >
                                                                <span v-else>{{
                                                                    formatDate(
                                                                        new Date(
                                                                            x.noticeOfAward
                                                                        )
                                                                    )
                                                                }}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="card mb-2">
                                                            <div
                                                                class="
                                                                    card-body
                                                                    p-2
                                                                    text-center
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                        justify-content-center
                                                                    "
                                                                >
                                                                    <i
                                                                        class="
                                                                            bx
                                                                            bxs-badge-check
                                                                            font-size-18
                                                                            text-primary
                                                                            me-1
                                                                        "
                                                                    ></i>
                                                                    <small
                                                                        class="
                                                                            text-muted
                                                                        "
                                                                        >Contract
                                                                        Signing</small
                                                                    >
                                                                </div>
                                                                <span
                                                                    v-if="
                                                                        x.advertisement ===
                                                                        '0001-01-01T00:00:00'
                                                                    "
                                                                    >N/A</span
                                                                >
                                                                <span v-else>{{
                                                                    formatDate(
                                                                        new Date(
                                                                            x.contractSigning
                                                                        )
                                                                    )
                                                                }}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <label class="mb-0"
                                                            >Remarks:</label
                                                        >
                                                        <p
                                                            class="
                                                                mb-0
                                                                cursor-pointer
                                                            "
                                                            :class="{
                                                                'text-ellipsis':
                                                                    !x.expand,
                                                            }"
                                                            @click="
                                                                x.expand =
                                                                    !x.expand
                                                            "
                                                        >
                                                            {{ x.remarks }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col mb-3">
                                        <div
                                            class="
                                                dataTables_paginate
                                                paging_simple_numbers
                                                float-end
                                            "
                                        >
                                            <ul
                                                class="
                                                    pagination
                                                    pagination-rounded
                                                    mb-0
                                                "
                                            >
                                                <!-- pagination -->
                                                <b-pagination
                                                    v-model="currentPageItem"
                                                    :total-rows="rowsCPRItem"
                                                    :per-page="perPageItem"
                                                ></b-pagination>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </b-col>
                        </b-row>
                    </slide>
                </carousel>
            </b-tab>
            <b-tab>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block">Posted</span>
                </template>
                <div class="card">
                    <div class="card-body">
                        <div
                            class="
                                d-flex
                                justify-content-between
                                align-items-center
                            "
                        >
                            <h4 class="card-title m-0">Posted CPR List</h4>
                        </div>
                        <div class="row mt-4">
                            <div class="col-sm-12 col-md-6">
                                <div
                                    id="tickets-table_length"
                                    class="dataTables_length"
                                >
                                    <label
                                        class="d-inline-flex align-items-center"
                                    >
                                        Show&nbsp;
                                        <b-form-select
                                            class="form-select form-select-sm"
                                            v-model="perPagePosted"
                                            size="sm"
                                            :options="cprPageOptions"
                                        ></b-form-select
                                        >&nbsp;entries
                                    </label>
                                </div>
                            </div>
                            <!-- Search -->
                            <div class="col-sm-12 col-md-6">
                                <div
                                    id="tickets-table_filter"
                                    class="dataTables_filter text-md-end"
                                >
                                    <label
                                        class="d-inline-flex align-items-center"
                                    >
                                        Search:
                                        <b-form-input
                                            autocomplete="off"
                                            v-model="filterPosted"
                                            type="search"
                                            placeholder="Search..."
                                            class="
                                                form-control form-control-sm
                                                ms-2
                                            "
                                        ></b-form-input>
                                    </label>
                                </div>
                            </div>
                            <!-- End search -->
                        </div>
                        <div class="table-responsive mb-0">
                            <b-table
                                class="datatables"
                                :items="postedData"
                                :fields="postedFields"
                                responsive="sm"
                                :per-page="perPagePosted"
                                :current-page="currentPostedPage"
                                :sort-by.sync="sortByPosted"
                                :sort-desc.sync="sortDescPosted"
                                :filter="filterPosted"
                                :filter-included-fields="filterOnPosted"
                                :busy="postedBusy"
                                @filtered="onFilteredPosted"
                                bordered
                                outlined
                                hover
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
                                                <div
                                                    class="
                                                        spinner-chase
                                                        w-20px
                                                        h-20px
                                                    "
                                                >
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <strong>Loading...</strong>
                                    </div>
                                </template>
                                <template #cell(displayDetails)="row">
                                    <div
                                        class="
                                            d-flex
                                            align-items-center
                                            justify-content-center
                                        "
                                        @click="getDetailsByRow(row)"
                                    >
                                        <i
                                            class="
                                                bx bx-chevron-right
                                                rotate
                                                font-size-16
                                                cursor-pointer
                                            "
                                            :class="{
                                                'rotate-90': row.detailsShowing,
                                            }"
                                        ></i>
                                    </div>
                                </template>
                                <template #row-details="row">
                                    <div class="row">
                                        <div
                                            class="col-lg-3"
                                            v-for="x in row.item.cprItems"
                                            :key="x.id"
                                        >
                                            <div class="card">
                                                <div
                                                    class="
                                                        card-body
                                                        py-2
                                                        px-3
                                                        mt-2
                                                    "
                                                >
                                                    <div>
                                                        <h5
                                                            class="
                                                                mb-0
                                                                cursor-pointer
                                                                position-relative
                                                            "
                                                            :id="`popover-${x.id}`"
                                                        >
                                                            {{ x.api.name }}
                                                        </h5>
                                                        <b-popover
                                                            :target="`popover-${x.id}`"
                                                            triggers="hover"
                                                            placement="top"
                                                            variant="primary"
                                                        >
                                                            <template
                                                                v-slot:title
                                                                >{{
                                                                    x.api.name
                                                                }}
                                                                Details</template
                                                            >
                                                            <div>
                                                                <small
                                                                    >Description:</small
                                                                >
                                                                <div>
                                                                    {{
                                                                        x.api
                                                                            .description
                                                                    }}
                                                                </div>
                                                            </div>
                                                            <div class="mt-2">
                                                                <small
                                                                    ><i
                                                                        >Completed
                                                                        on
                                                                        {{
                                                                            formatDate(
                                                                                new Date(
                                                                                    x.api.dateCompleted
                                                                                )
                                                                            )
                                                                        }}</i
                                                                    ></small
                                                                >
                                                            </div>
                                                        </b-popover>
                                                        <span
                                                            class="
                                                                badge
                                                                rounded-pill
                                                                bg-purple
                                                            "
                                                            >{{
                                                                x.modeOfProcurement
                                                            }}</span
                                                        >
                                                    </div>
                                                    <div class="row mt-2">
                                                        <div class="col-md-6">
                                                            <div
                                                                class="
                                                                    card
                                                                    mb-2
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        card-body
                                                                        p-2
                                                                        text-center
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                            justify-content-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bx-user-voice
                                                                                font-size-18
                                                                                text-primary
                                                                                me-1
                                                                            "
                                                                        ></i>
                                                                        <small
                                                                            class="
                                                                                text-muted
                                                                            "
                                                                            >Advertisement</small
                                                                        >
                                                                    </div>
                                                                    <span
                                                                        v-if="
                                                                            x.advertisement ===
                                                                            '0001-01-01T00:00:00'
                                                                        "
                                                                        >N/A</span
                                                                    >
                                                                    <span
                                                                        v-else
                                                                        >{{
                                                                            formatDate(
                                                                                new Date(
                                                                                    x.advertisement
                                                                                )
                                                                            )
                                                                        }}</span
                                                                    >
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <div
                                                                class="
                                                                    card
                                                                    mb-2
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        card-body
                                                                        p-2
                                                                        text-center
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                            justify-content-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bx-list-check
                                                                                font-size-18
                                                                                text-primary
                                                                                me-1
                                                                            "
                                                                        ></i>
                                                                        <small
                                                                            class="
                                                                                text-muted
                                                                            "
                                                                            >Submission</small
                                                                        >
                                                                    </div>
                                                                    <span
                                                                        v-if="
                                                                            x.advertisement ===
                                                                            '0001-01-01T00:00:00'
                                                                        "
                                                                        >N/A</span
                                                                    >
                                                                    <span
                                                                        v-else
                                                                        >{{
                                                                            formatDate(
                                                                                new Date(
                                                                                    x.submission
                                                                                )
                                                                            )
                                                                        }}</span
                                                                    >
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div
                                                                class="
                                                                    card
                                                                    mb-2
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        card-body
                                                                        p-2
                                                                        text-center
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                            justify-content-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bx-award
                                                                                font-size-18
                                                                                text-primary
                                                                                me-1
                                                                            "
                                                                        ></i>
                                                                        <small
                                                                            class="
                                                                                text-muted
                                                                            "
                                                                            >Notice
                                                                            of
                                                                            Award</small
                                                                        >
                                                                    </div>
                                                                    <span
                                                                        v-if="
                                                                            x.advertisement ===
                                                                            '0001-01-01T00:00:00'
                                                                        "
                                                                        >N/A</span
                                                                    >
                                                                    <span
                                                                        v-else
                                                                        >{{
                                                                            formatDate(
                                                                                new Date(
                                                                                    x.noticeOfAward
                                                                                )
                                                                            )
                                                                        }}</span
                                                                    >
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <div
                                                                class="
                                                                    card
                                                                    mb-2
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        card-body
                                                                        p-2
                                                                        text-center
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                            justify-content-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bxs-badge-check
                                                                                font-size-18
                                                                                text-primary
                                                                                me-1
                                                                            "
                                                                        ></i>
                                                                        <small
                                                                            class="
                                                                                text-muted
                                                                            "
                                                                            >Contract
                                                                            Signing</small
                                                                        >
                                                                    </div>
                                                                    <span
                                                                        v-if="
                                                                            x.advertisement ===
                                                                            '0001-01-01T00:00:00'
                                                                        "
                                                                        >N/A</span
                                                                    >
                                                                    <span
                                                                        v-else
                                                                        >{{
                                                                            formatDate(
                                                                                new Date(
                                                                                    x.contractSigning
                                                                                )
                                                                            )
                                                                        }}</span
                                                                    >
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <label class="mb-0"
                                                                >Remarks:</label
                                                            >
                                                            <p
                                                                class="
                                                                    mb-0
                                                                    cursor-pointer
                                                                "
                                                                :class="{
                                                                    'text-ellipsis':
                                                                        !x.expand,
                                                                }"
                                                                @click="
                                                                    x.expand =
                                                                        !x.expand
                                                                "
                                                            >
                                                                {{ x.remarks }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                                <template #cell(actions)="row">
                                    <div class="d-flex">
                                        <button
                                            type="button"
                                            class="
                                                btn btn-warning btn-sm
                                                me-1
                                                w-50
                                            "
                                            @click="
                                                returnCPR(row.item, 'posted')
                                            "
                                        >
                                            <i class="bx bx-revision me-1"></i
                                            >Return
                                        </button>
                                        <button
                                            type="button"
                                            class="btn btn-success btn-sm w-50"
                                            @click="approveCPR(row.item)"
                                        >
                                            <i class="bx bx-check me-1"></i
                                            >Approve
                                        </button>
                                    </div>
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
                                        class="
                                            pagination pagination-rounded
                                            mb-0
                                        "
                                    >
                                        <!-- pagination -->
                                        <b-pagination
                                            v-model="currentPostedPage"
                                            :total-rows="rowsPosted"
                                            :per-page="perPagePosted"
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </b-tab>
            <b-tab>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="far fa-user"></i>
                    </span>
                    <span class="d-none d-sm-inline-block">Approved</span>
                </template>
                <div class="card">
                    <div class="card-body">
                        <div
                            class="
                                d-flex
                                justify-content-between
                                align-items-center
                            "
                        >
                            <h4 class="card-title m-0">Approved CPR List</h4>
                        </div>
                        <div class="row mt-4">
                            <div class="col-sm-12 col-md-6">
                                <div
                                    id="tickets-table_length"
                                    class="dataTables_length"
                                >
                                    <label
                                        class="d-inline-flex align-items-center"
                                    >
                                        Show&nbsp;
                                        <b-form-select
                                            class="form-select form-select-sm"
                                            v-model="perPageApproved"
                                            size="sm"
                                            :options="cprPageOptions"
                                        ></b-form-select
                                        >&nbsp;entries
                                    </label>
                                </div>
                            </div>
                            <!-- Search -->
                            <div class="col-sm-12 col-md-6">
                                <div
                                    id="tickets-table_filter"
                                    class="dataTables_filter text-md-end"
                                >
                                    <label
                                        class="d-inline-flex align-items-center"
                                    >
                                        Search:
                                        <b-form-input
                                            autocomplete="off"
                                            v-model="filterApproved"
                                            type="search"
                                            placeholder="Search..."
                                            class="
                                                form-control form-control-sm
                                                ms-2
                                            "
                                        ></b-form-input>
                                    </label>
                                </div>
                            </div>
                            <!-- End search -->
                        </div>
                        <div class="table-responsive mb-0">
                            <b-table
                                class="datatables"
                                :items="approvedData"
                                :fields="approvedFields"
                                responsive="sm"
                                :per-page="perPageApproved"
                                :current-page="currentApprovedPage"
                                :sort-by.sync="sortByApproved"
                                :sort-desc.sync="sortDescApproved"
                                :filter="filterApproved"
                                :filter-included-fields="filterOnApproved"
                                :busy="approvedBusy"
                                @filtered="onFilteredApproved"
                                bordered
                                outlined
                                hover
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
                                                <div
                                                    class="
                                                        spinner-chase
                                                        w-20px
                                                        h-20px
                                                    "
                                                >
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                    <div
                                                        class="chase-dot"
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <strong>Loading...</strong>
                                    </div>
                                </template>
                                <template #cell(displayDetails)="row">
                                    <div
                                        class="
                                            d-flex
                                            align-items-center
                                            justify-content-center
                                        "
                                        @click="getDetailsByRow(row)"
                                    >
                                        <i
                                            class="
                                                bx bx-chevron-right
                                                rotate
                                                font-size-16
                                                cursor-pointer
                                            "
                                            :class="{
                                                'rotate-90': row.detailsShowing,
                                            }"
                                        ></i>
                                    </div>
                                </template>
                                <template #row-details="row">
                                    <div class="row">
                                        <div
                                            class="col-lg-3"
                                            v-for="x in row.item.cprItems"
                                            :key="x.id"
                                        >
                                            <div class="card">
                                                <div
                                                    class="
                                                        card-body
                                                        py-2
                                                        px-3
                                                        mt-2
                                                    "
                                                >
                                                    <div>
                                                        <h5
                                                            class="
                                                                mb-0
                                                                cursor-pointer
                                                                position-relative
                                                            "
                                                            :id="`popover-${x.id}`"
                                                        >
                                                            {{ x.api.name }}
                                                        </h5>
                                                        <b-popover
                                                            :target="`popover-${x.id}`"
                                                            triggers="hover"
                                                            placement="top"
                                                            variant="primary"
                                                        >
                                                            <template
                                                                v-slot:title
                                                                >{{
                                                                    x.api.name
                                                                }}
                                                                Details</template
                                                            >
                                                            <div>
                                                                <small
                                                                    >Description:</small
                                                                >
                                                                <div>
                                                                    {{
                                                                        x.api
                                                                            .description
                                                                    }}
                                                                </div>
                                                            </div>
                                                            <div class="mt-2">
                                                                <small
                                                                    ><i
                                                                        >Completed
                                                                        on
                                                                        {{
                                                                            formatDate(
                                                                                new Date(
                                                                                    x.api.dateCompleted
                                                                                )
                                                                            )
                                                                        }}</i
                                                                    ></small
                                                                >
                                                            </div>
                                                        </b-popover>
                                                        <span
                                                            class="
                                                                badge
                                                                rounded-pill
                                                                bg-purple
                                                            "
                                                            >{{
                                                                x.modeOfProcurement
                                                            }}</span
                                                        >
                                                    </div>
                                                    <div class="row mt-2">
                                                        <div class="col-md-6">
                                                            <div
                                                                class="
                                                                    card
                                                                    mb-2
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        card-body
                                                                        p-2
                                                                        text-center
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                            justify-content-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bx-user-voice
                                                                                font-size-18
                                                                                text-primary
                                                                                me-1
                                                                            "
                                                                        ></i>
                                                                        <small
                                                                            class="
                                                                                text-muted
                                                                            "
                                                                            >Advertisement</small
                                                                        >
                                                                    </div>
                                                                    <span
                                                                        v-if="
                                                                            x.advertisement ===
                                                                            '0001-01-01T00:00:00'
                                                                        "
                                                                        >N/A</span
                                                                    >
                                                                    <span
                                                                        v-else
                                                                        >{{
                                                                            formatDate(
                                                                                new Date(
                                                                                    x.advertisement
                                                                                )
                                                                            )
                                                                        }}</span
                                                                    >
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <div
                                                                class="
                                                                    card
                                                                    mb-2
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        card-body
                                                                        p-2
                                                                        text-center
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                            justify-content-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bx-list-check
                                                                                font-size-18
                                                                                text-primary
                                                                                me-1
                                                                            "
                                                                        ></i>
                                                                        <small
                                                                            class="
                                                                                text-muted
                                                                            "
                                                                            >Submission</small
                                                                        >
                                                                    </div>
                                                                    <span
                                                                        v-if="
                                                                            x.advertisement ===
                                                                            '0001-01-01T00:00:00'
                                                                        "
                                                                        >N/A</span
                                                                    >
                                                                    <span
                                                                        v-else
                                                                        >{{
                                                                            formatDate(
                                                                                new Date(
                                                                                    x.submission
                                                                                )
                                                                            )
                                                                        }}</span
                                                                    >
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div
                                                                class="
                                                                    card
                                                                    mb-2
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        card-body
                                                                        p-2
                                                                        text-center
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                            justify-content-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bx-award
                                                                                font-size-18
                                                                                text-primary
                                                                                me-1
                                                                            "
                                                                        ></i>
                                                                        <small
                                                                            class="
                                                                                text-muted
                                                                            "
                                                                            >Notice
                                                                            of
                                                                            Award</small
                                                                        >
                                                                    </div>
                                                                    <span
                                                                        v-if="
                                                                            x.advertisement ===
                                                                            '0001-01-01T00:00:00'
                                                                        "
                                                                        >N/A</span
                                                                    >
                                                                    <span
                                                                        v-else
                                                                        >{{
                                                                            formatDate(
                                                                                new Date(
                                                                                    x.noticeOfAward
                                                                                )
                                                                            )
                                                                        }}</span
                                                                    >
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <div
                                                                class="
                                                                    card
                                                                    mb-2
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        card-body
                                                                        p-2
                                                                        text-center
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                            justify-content-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bxs-badge-check
                                                                                font-size-18
                                                                                text-primary
                                                                                me-1
                                                                            "
                                                                        ></i>
                                                                        <small
                                                                            class="
                                                                                text-muted
                                                                            "
                                                                            >Contract
                                                                            Signing</small
                                                                        >
                                                                    </div>
                                                                    <span
                                                                        v-if="
                                                                            x.advertisement ===
                                                                            '0001-01-01T00:00:00'
                                                                        "
                                                                        >N/A</span
                                                                    >
                                                                    <span
                                                                        v-else
                                                                        >{{
                                                                            formatDate(
                                                                                new Date(
                                                                                    x.contractSigning
                                                                                )
                                                                            )
                                                                        }}</span
                                                                    >
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <label class="mb-0"
                                                                >Remarks:</label
                                                            >
                                                            <p
                                                                class="
                                                                    mb-0
                                                                    cursor-pointer
                                                                "
                                                                :class="{
                                                                    'text-ellipsis':
                                                                        !x.expand,
                                                                }"
                                                                @click="
                                                                    x.expand =
                                                                        !x.expand
                                                                "
                                                            >
                                                                {{ x.remarks }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                                <template #cell(actions)="row">
                                    <button
                                        type="button"
                                        class="
                                            btn btn-warning btn-sm btn-block
                                            me-1
                                        "
                                        @click="returnCPR(row.item, 'approved')"
                                    >
                                        <i class="bx bx-revision me-1"></i
                                        >Return
                                    </button>
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
                                        class="
                                            pagination pagination-rounded
                                            mb-0
                                        "
                                    >
                                        <!-- pagination -->
                                        <b-pagination
                                            v-model="currentApprovedPage"
                                            :total-rows="rowsApproved"
                                            :per-page="perPageApproved"
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </b-tab>
        </b-tabs>
        <api-items @dropData="dropWork($event)" ref="cprWork"></api-items>
        <mode-of-procurement
            @dropData="dropMOP($event)"
            ref="mop"
        ></mode-of-procurement>
        <!-- <cpr-logs ref="log"></cpr-logs> -->
    </Layout>
</template>

