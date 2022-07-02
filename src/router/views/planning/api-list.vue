<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { required } from "vuelidate/lib/validators";
import { cloneDeep, groupBy } from "lodash";
import Swal from "sweetalert2";
import DatePicker from "vue2-datepicker";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";

const greaterFive = (value) => value.replace(/,/g, "") <= 5;
const lesserOne = (value) => value.replace(/,/g, "") >= 1;
export default {
    page: {
        title: "List of API",
    },
    components: {
        Layout,
        PageHeader,
        DatePicker,
        MaskedInput,
    },
    data() {
        return {
            title: "API",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "API",
                    active: true,
                },
            ],
            tableData: [],
            approvedData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            currentPageApp: 1,
            perPage: 10,
            perPageApp: 10,
            pageOptions: [10, 25, 50, 100],
            filterPosted: "",
            filterApproved: "",
            filterOn: ['name'],
            filterOnApp: ['name'],
            sortBy: "id",
            sortDesc: true,
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: false,
            }),
            fields: [
                {
                    key: "name",
                    sortable: true,
                    label: "API Name",
                },
                {
                    key: "totalAmt",
                    sortable: true,
                    label: "Total Amount",
                    thStyle: { width: "180px" },
                },
                {
                    key: "score",
                    sortable: true,
                    label: "Score",
                    thStyle: { width: "180px" },
                },
                {
                    key: "action",
                    sortable: true,
                    thStyle: { width: "220px" },
                },
            ],
            indexSelected: -1,
            tableBusy: false,
            approvedBusy: false,
            returnForm: {
                id: "",
                remarks: "",
            },
            form: {
                id: 0,
                name: "",
                description: "",
                isCatchUp: false,
                apiTypeId: "",
                targetId: this.$route.params.id,
                scoreEfficiency: "",
                scoreQuality: "",
                scoreTimeliness: "",
                finalRemarks: "",
                catchUpPlans: "",
                isCompleted: false,
                dateCompleted: "",
            },
            apiType: "",
            statusType: "posted",
            parentIndex: -1,
        };
    },
    computed: {
        filteredPosted(){
            let data = this.tableData;
            var total = this.currentPage * this.perPage;
            if (this.filterPosted.trim() != "" && this.filterPosted) {
                data = data.filter((item) => {
                    return item.filterItem
                        .toUpperCase()
                        .includes(this.filterPosted.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPage, total);
            if (this.currentPage > 1 && currentData.length == 0) {
                total = (this.currentPage - 1) * this.perPage;
                currentData = data.slice(total - this.perPage, total);
            }
            return currentData;
        },
        filteredApproved(){
            let data = this.approvedData;
            var total = this.currentPageApp * this.perPageApp;
            if (this.filterApproved.trim() != "" && this.filterApproved) {
                data = data.filter((item) => {
                    return item.filterItem
                        .toUpperCase()
                        .includes(this.filterApproved.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageApp, total);
            if (this.currentPageApp > 1 && currentData.length == 0) {
                total = (this.currentPageApp - 1) * this.perPageApp;
                currentData = data.slice(total - this.perPageApp, total);
            }
            return currentData;
        },
        rows() {
            if (this.filterPosted) {
                return this.totalRows;
            }
            return this.tableData.length;
        },
        rowsApp() {
            if (this.filterApproved) {
                return this.totalRows;
            }
            return this.approvedData.length;
        },
    },
    validations: {
        returnForm: { remarks: { required } },
        form: {
            name: { required },
            description: { required },
            apiTypeId: { required },
            scoreEfficiency: { required, greaterFive, lesserOne },
            scoreQuality: { required, greaterFive, lesserOne },
            scoreTimeliness: { required, greaterFive, lesserOne },
            finalRemarks: { required },
        },
    },
    created() {
        this.totalRows = this.items.length;
        this.changeCycle(this.$store.state.data.cycle);
    },
    methods: {
        changeCycle(cycle) {
            this.getPosted(cycle);
            this.getApproved(cycle);
        },
        onFiltered(data) {
            this.totalRows = data.length;
            this.currentPage = 1;
        },
        onFilteredApp(data) {
            this.totalRows = data.length;
            this.currentPageApp = 1;
        },
        updateItem(props, type, yId) {
            this.statusType = type;
            this.form = cloneDeep(props.item);
            this.form.dateCompleted = new Date(props.item.dateCompleted);
            this.apiType = props.item.apiType.type;
            this.form.scoreEfficiency = `${props.item.scoreEfficiency}`;
            this.form.scoreQuality = `${props.item.scoreQuality}`;
            this.form.scoreTimeliness = `${props.item.scoreTimeliness}`;
            if(type == "posted"){
                this.parentIndex = this.tableData.findIndex(x => x.id == yId);
                this.indexSelected = this.tableData[this.parentIndex].data.findIndex(x => x.id == props.item.id)
            }else{
                this.parentIndex = this.approvedData.findIndex(x => x.id == yId);
                this.indexSelected = this.approvedData[this.parentIndex].data.findIndex(x => x.id == props.item.id)
            }
            this.modalTitle = "Update API";
            this.$bvModal.show("modal-standard");
        },
        onCreate() {
            this.submitted = true;
            this.$v.form.$touch();
            if (this.$v.form.$invalid) {
                return;
            } else {
                var data = cloneDeep(this.form);
                data.dateCompleted = data.isCompleted
                    ? this.getDate(this.form.dateCompleted)
                    : this.getDate(new Date());
                if (this.form.id > 0) {
                    this.$store
                        .dispatch("api/UpdateApi", data)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(
                                    res.data.errorMessage,
                                    "warning"
                                );
                            }
                            if (this.statusType === "posted") {
                                this.tableData[this.parentIndex].data.splice(
                                    this.indexSelected,
                                    1,
                                    data
                                );
                            } else {
                                this.approvedData[this.parentIndex].data.splice(
                                    this.indexSelected,
                                    1,
                                    data
                                );
                            }
                            this.$bvModal.hide("modal-standard");
                            this.showToast("Successfully updated!", "success");
                        })
                        .catch(() => {
                            this.showToast("Something went wrong!", "error");
                        });
                } else {
                    this.$store
                        .dispatch("api/CreateApi", data)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(
                                    res.data.errorMessage,
                                    "warning"
                                );
                            }
                            if (this.statusType === "posted") {
                                this.tableData[this.parentIndex].data.push(res.data);
                            } else {
                                this.tableData[this.parentIndex].data.push(res.data);
                            }
                            this.$bvModal.hide("modal-standard");
                            this.showToast("Successfully created!", "success");
                        })
                        .catch(() => {
                            this.showToast("Something went wrong!", "error");
                        });
                }
                this.submitted = false;
            }
        },
        getPosted(event) {
            this.tableBusy = true;
            this.$store
                .dispatch("api/GetPostedApi", event)
                .then((res) => {
                    this.tableBusy = false;
                    res.data.forEach((item) => {
                        item.totalAmt = new Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(item.totalResources);
                        item.rotateChevy = false;
                        item.showDetails = false;
                        item.deliveryUnit = item.target.deliveryUnit.name;
                        item.searchKey = ''
                    });
                    var group = groupBy(res.data, "deliveryUnit");
                    var grouped = [];
                    var id = 1;
                    for (const key in group) {
                        let searchKey = '';
                        group[key].forEach((x) => {
                            searchKey += `${x.name}`;
                        })
                        grouped.push({
                            id: id++,
                            name: key,
                            data: group[key],
                            showData: false,
                            filterItem: searchKey
                        });
                    }
                    this.tableData = grouped;
                })
                .catch((err) => {
                    this.tableBusy = false;
                    this.showToast("Something went wrong!", "error");
                });
        },
        getApproved(event) {
            this.approvedBusy = true;
            this.$store
                .dispatch("api/GetApprovedApi", event)
                .then((res) => {
                    this.approvedBusy = false;
                    res.data.forEach((item) => {
                        item.totalAmt = new Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(item.totalResources);
                        item.rotateChevy = false;
                        item.showDetails = false;
                        item.backLoading = false;
                        item.deliveryUnit = item.target.deliveryUnit.name;
                        item.searchKey = ''
                    });
                    var group = groupBy(res.data, "deliveryUnit");
                    var grouped = [];
                    var id = 1;
                    for (const key in group) {
                        let searchKey = '';
                        group[key].forEach((x) => {
                            searchKey += `${x.name}`;
                        })
                        grouped.push({
                            id: id++,
                            name: key,
                            data: group[key],
                            showData: false,
                            filterItem: searchKey
                        });
                    }
                    this.approvedData = grouped;
                })
                .catch((err) => {
                    this.approvedBusy = false;
                    this.showToast("Something went wrong!", "error");
                });
        },
        returnAPI(row, type, yId) {
            this.parentIndex = this.tableData.findIndex(x => x.id == yId);
            this.tableIndex = this.tableData[this.parentIndex].data.indexOf(x => x.id == row.id);
            this.returnForm.id = row.id;
            this.returnForm.remarks = "";
            this.$bvModal.show("return-modal");
        },
        approveAPI(row, yId) {
            this.parentIndex = this.tableData.findIndex(x => x.id == yId);
            this.tableIndex = this.tableData[this.parentIndex].data.indexOf(x => x.id == row.id);
            Swal.fire({
                title: "Are you sure?",
                text: "You want to approve this APR?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#34c38f",
                cancelButtonColor: "#f46a6a",
                confirmButtonText: "Yes, approve it!",
            }).then((result) => {
                if (result.isConfirmed) {
                    this.$store
                        .dispatch("api/ApproveApi", row.id)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(
                                    res.data.errorMessage,
                                    "warning"
                                );
                            }
                            let parentIndex = this.approvedData.findIndex(x => x.name === row.deliveryUnit);
                            if(parentIndex < 0){
                                let data = {
                                    id: this.approvedData.length + 1,
                                    name: row.deliveryUnit,
                                    data: [row],
                                    showData: false,
                                    filterItem: `${row.deliveryUnit}`
                                }
                                this.approvedData.push(data);
                            }else{
                                this.approvedData[parentIndex].data.push(row);
                            }
                            this.tableData[this.parentIndex].data.splice(this.tableIndex, 1);
                            this.initializeTableData();
                            this.showToast("Successfully approved!", "success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!", "error");
                        });
                }
            });
        },
        initializeTableData(){
            if(this.tableData[this.parentIndex].data.length == 0){
                this.tableData.splice(this.parentIndex, 1);
            }
        },
        returnAPISubmit() {
            this.submitted = true;
            this.$v.returnForm.$touch();
            if (this.$v.returnForm.$invalid) {
                return;
            }
            this.$store
                .dispatch("api/ReturnApiPlanning", this.returnForm)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "warning");
                    }
                    this.tableData[this.parentIndex].data.splice(this.tableIndex, 1);
                    this.initializeTableData();
                    this.showToast("Successfully returned", "success");
                    this.$bvModal.hide("return-modal");
                })
                .catch((err) => {
                    this.showToast("Something went wrong!", "error");
                });
        },
        hideModal() {
            this.$bvModal.hide("return-modal");
        },
        isBackLog(row) {
            row.backLoading = true;
            this.$store
                .dispatch("api/UpdateBL", {
                    id: row.id,
                    status: !row.isBackLog,
                })
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "warning");
                    }
                    row.backLoading = false;
                    row.isBackLog = !row.isBackLog;
                })
                .catch((err) => {
                    this.showToast("Something went wrong!", "error");
                });
        },
    },
};
</script>

<template>
    <Layout @changeCycle="changeCycle">
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="modal-standard"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreate"
                class="needs-validation"
                ref="apiForm"
            >
                <label for="scoreEfficiency" class="mb-0">Score </label>
                <b-row class="mb-3">
                    <b-col>
                        <small>Efficiency</small>
                        <masked-input
                            autocomplete="off"
                            id="scoreEfficiency"
                            type="text"
                            v-model="form.scoreEfficiency"
                            placeholder="Enter Efficiency..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted && $v.form.scoreEfficiency.$error,
                            }"
                            :mask="currencyMask"
                        ></masked-input>
                        <div
                            v-if="submitted && $v.form.scoreEfficiency.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.form.scoreEfficiency.required"
                                >This value is required.</span
                            >
                            <span v-if="!$v.form.scoreEfficiency.greaterFive"
                                >This value should not be greater than 5.</span
                            >
                            <span v-if="!$v.form.scoreEfficiency.lesserOne"
                                >This value should not be lesser than 1.</span
                            >
                        </div>
                    </b-col>
                    <b-col>
                        <small>Quality</small>
                        <masked-input
                            autocomplete="off"
                            id="scoreQuality"
                            type="text"
                            v-model="form.scoreQuality"
                            placeholder="Enter Quality..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted && $v.form.scoreQuality.$error,
                            }"
                            :mask="currencyMask"
                        ></masked-input>
                        <div
                            v-if="submitted && $v.form.scoreQuality.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.form.scoreQuality.required"
                                >This value is required.</span
                            >
                            <span v-if="!$v.form.scoreQuality.greaterFive"
                                >Maximum is 5.</span
                            >
                            <span v-if="!$v.form.scoreQuality.lesserOne"
                                >Minimum is 1.</span
                            >
                        </div>
                    </b-col>
                    <b-col>
                        <small>Timelines</small>
                        <masked-input
                            autocomplete="off"
                            id="scoreTimeliness"
                            type="text"
                            v-model="form.scoreTimeliness"
                            placeholder="Enter Timelines..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted && $v.form.scoreTimeliness.$error,
                            }"
                            :mask="currencyMask"
                        ></masked-input>
                        <div
                            v-if="submitted && $v.form.scoreTimeliness.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.form.scoreTimeliness.required"
                                >This value is required.</span
                            >
                            <span v-if="!$v.form.scoreTimeliness.greaterFive"
                                >This value should not be greater than 5.</span
                            >
                            <span v-if="!$v.form.scoreTimeliness.lesserOne"
                                >This value should not be lesser than 1.</span
                            >
                        </div>
                    </b-col>
                </b-row>
                <div class="mb-3">
                    <label for="finalRemarks">Final Remarks </label>
                    <textarea
                        id="finalRemarks"
                        rows="3"
                        v-model="form.finalRemarks"
                        placeholder="Enter Final Remarks..."
                        class="form-control"
                        :class="{
                            'is-invalid':
                                submitted && $v.form.finalRemarks.$error,
                        }"
                    ></textarea>
                    <div
                        v-if="submitted && $v.form.finalRemarks.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.form.finalRemarks.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <input
                        autocomplete="off"
                        class="form-check-input"
                        type="checkbox"
                        id="isCompleted"
                        v-model="form.isCompleted"
                    />&nbsp;&nbsp;
                    <label class="form-check-label" for="isCompleted"
                        >Is Completed?</label
                    >
                </div>
                <div class="mb-3" v-if="form.isCompleted">
                    <label for="dateCompleted">Date Completed </label>
                    <date-picker
                        v-model="form.dateCompleted"
                        :first-day-of-week="1"
                        lang="en"
                        placeholder="Enter Date Completed..."
                    ></date-picker>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Save changes
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="$bvModal.hide('modal-standard')"
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
            <form @submit.prevent="returnAPISubmit" class="needs-validation">
                <b-row>
                    <b-col>
                        <div class="mb-3">
                            <label for="description">Remarks </label>
                            <textarea
                                id="description"
                                rows="3"
                                v-model="returnForm.remarks"
                                placeholder="Enter Remarks..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.returnForm.remarks.$error,
                                }"
                            ></textarea>
                            <div
                                v-if="submitted && $v.returnForm.remarks.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.returnForm.remarks.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                    </b-col>
                </b-row>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Return API
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
        <b-tabs content-class="pt-3 pb-3 text-muted">
            <b-tab>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block">Posted</span>
                </template>
                <div class="row">
                    <div class="col-12">
                        <div class="card border">
                            <div class="card-body">
                                <div class="row mt-4 mb-2">
                                    <div class="col-sm-12 col-md-6">
                                        <h4 class="card-title m-0">
                                            List of Posted APIs by Delivery Unit
                                        </h4>
                                    </div>
                                    <!-- Search -->
                                    <div class="col-sm-12 col-md-6">
                                        <div
                                            id="tickets-table_filter"
                                            class="
                                                dataTables_filter
                                                text-md-end
                                            "
                                        >
                                            <label
                                                class="
                                                    d-inline-flex
                                                    align-items-center
                                                "
                                            >
                                                Search:
                                                <b-form-input
                                                    autocomplete="off"
                                                    v-model="filterPosted"
                                                    type="search"
                                                    placeholder="Search DU..."
                                                    class="
                                                        form-control
                                                        form-control-sm
                                                        ms-2
                                                    "
                                                ></b-form-input>
                                                <b-form-select
                                                    class="
                                                        form-select
                                                        form-select-sm
                                                        w-100p
                                                        ms-1
                                                    "
                                                    v-model="perPage"
                                                    size="sm"
                                                    :options="pageOptions"
                                                ></b-form-select>
                                            </label>
                                        </div>
                                    </div>
                                    <!-- End search -->
                                </div>
                                <div class="text-center mt-2" v-if="tableData.length == 0">
                                    <h4>No data found</h4>
                                </div>
                                <div class="text-center mt-2" v-if="tableData.length > 0 && filteredPosted.length == 0">
                                    <h4>Search not found</h4>
                                </div>
                                <div
                                    class="
                                        d-flex
                                        justify-content-center
                                        align-items-center
                                    "
                                    v-if="tableBusy"
                                >
                                    <div
                                        class="
                                            preloader-component
                                            me-2
                                        "
                                    >
                                        <div class="status">
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
                                    <strong>Loading...</strong>
                                </div>
                                <div role="tablist" v-for="y in filteredPosted" :key="y.id">
                                    <div class="card mb-2">
                                        <div class="card-header text-info" role="tab">
                                            <div
                                                class="
                                                    d-flex
                                                    align-items-center
                                                    justify-content-between
                                                "
                                            >
                                                <div class="d-flex align-items-center cursor-pointer" @click="y.showData = !y.showData">
                                                    <h4 class="mb-0 text-info">
                                                        {{y.name}}
                                                    </h4>
                                                    <i
                                                        class="
                                                            bx bx-chevron-right
                                                            rotate
                                                            font-size-18
                                                            me-2
                                                        "
                                                        :class="{'rotate-90': y.showData}"
                                                    ></i>
                                                </div>
                                                <div
                                                    id="tickets-table_filter"
                                                    class="
                                                        dataTables_filter
                                                        text-md-end
                                                    "
                                                    v-if="y.showData"
                                                >
                                                    <label
                                                        class="
                                                            d-inline-flex
                                                            align-items-center
                                                            mb-0
                                                        "
                                                    >
                                                        <b-form-input
                                                            autocomplete="off"
                                                            v-model="y.searchKey"
                                                            type="search"
                                                            placeholder="Search API..."
                                                            class="
                                                                form-control
                                                                form-control-sm
                                                                ms-2
                                                            "
                                                        ></b-form-input>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <b-collapse :visible="y.showData"
                                            :accordion="`posted-accordion-${y.id}`"
                                            role="tabpanel">
                                            <div class="card-body">
                                                <div class="table-responsive mb-0">
                                                    <b-table
                                                        class="datatables target-table"
                                                        :items="y.data"
                                                        :fields="fields"
                                                        responsive="sm"
                                                        :sort-by.sync="sortBy"
                                                        :sort-desc.sync="sortDesc"
                                                        :filter="y.searchKey"
                                                        :filter-included-fields="filterOn"
                                                        @filtered="onFiltered"
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
                                                        <template #cell(score)="data">
                                                            <div>
                                                                <b>Efficiency:</b>&nbsp;{{
                                                                    data.item.scoreEfficiency
                                                                }}
                                                            </div>
                                                            <div>
                                                                <b>Quality:</b>&nbsp;{{
                                                                    data.item.scoreQuality
                                                                }}
                                                            </div>
                                                            <div>
                                                                <b>Timeliness:</b>&nbsp;{{
                                                                    data.item.scoreTimeliness
                                                                }}
                                                            </div>
                                                        </template>
                                                        <template #cell(action)="row">
                                                            <div class="d-flex">
                                                                <button
                                                                    type="button"
                                                                    class="
                                                                        btn btn-warning btn-sm
                                                                        me-1
                                                                        w-50
                                                                    "
                                                                    @click="
                                                                        returnAPI(
                                                                            row.item,
                                                                            'posted',
                                                                            y.id
                                                                        )
                                                                    "
                                                                >
                                                                    <i
                                                                        class="
                                                                            bx bx-revision
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Return
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    class="
                                                                        btn btn-success btn-sm
                                                                        w-50
                                                                    "
                                                                    @click="
                                                                        approveAPI(row.item, y.id)
                                                                    "
                                                                >
                                                                    <i
                                                                        class="bx bx-check me-1"
                                                                    ></i
                                                                    >Approve
                                                                </button>
                                                            </div>
                                                            <div class="mt-2">
                                                                <button
                                                                    type="button"
                                                                    class="
                                                                        btn
                                                                        btn-primary
                                                                        btn-block
                                                                        btn-sm
                                                                    "
                                                                    @click="
                                                                        updateItem(
                                                                            row,
                                                                            'posted',
                                                                            y.id
                                                                        )
                                                                    "
                                                                >
                                                                    <i
                                                                        class="
                                                                            bx bx-edit-alt
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Update Score
                                                                </button>
                                                            </div>
                                                        </template>
                                                        <template #cell(name)="data">
                                                            <a
                                                                href="javascript:void(0);"
                                                                class="
                                                                    d-flex
                                                                    justify-content-start
                                                                "
                                                            >
                                                                <b class="text-white">{{
                                                                    data.item.name
                                                                }}</b>
                                                                <div>
                                                                    <span
                                                                        class="
                                                                            badge
                                                                            rounded-pill
                                                                            bg-danger
                                                                            float-end
                                                                        "
                                                                        style="font-size: 8px"
                                                                        >{{
                                                                            data.item
                                                                                .notification >
                                                                            0
                                                                                ? data.item
                                                                                    .notification
                                                                                : ""
                                                                        }}</span
                                                                    >
                                                                </div>
                                                            </a>
                                                            <div class="text-muted">
                                                                {{ data.item.description }}
                                                            </div>
                                                            <div>
                                                                <a href="javascript:void(0);" @click="data.toggleDetails">[View Details]</a>
                                                            </div>
                                                        </template>
                                                        <template #row-details="row">
                                                            <b-card
                                                                no-body
                                                                class="p-3"
                                                            >
                                                                <div class="row">
                                                                    <div class="col-md-6">
                                                                        <h5>
                                                                            List of Items
                                                                        </h5>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            col-md-6
                                                                            text-right
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            @click="
                                                                                row.toggleDetails
                                                                            "
                                                                            class="
                                                                                text-dark
                                                                                font-size-16
                                                                            "
                                                                            ><i
                                                                                class="
                                                                                    bx bx-x
                                                                                "
                                                                            ></i
                                                                        ></a>
                                                                    </div>
                                                                </div>
                                                                <div class="row">
                                                                    <div class="col-md-12">
                                                                        <table
                                                                            class="
                                                                                table
                                                                                table-bordered
                                                                                border-secondary
                                                                            "
                                                                        >
                                                                            <tr>
                                                                                <th
                                                                                    rowspan="2"
                                                                                    class="
                                                                                        text-left
                                                                                        px-2
                                                                                    "
                                                                                >
                                                                                    Item
                                                                                    Name
                                                                                </th>
                                                                                <th
                                                                                    colspan="4"
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 400px;
                                                                                    "
                                                                                >
                                                                                    Quantity
                                                                                </th>
                                                                                <th
                                                                                    rowspan="2"
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 150px;
                                                                                    "
                                                                                >
                                                                                    Unit
                                                                                    Cost
                                                                                </th>
                                                                                <th
                                                                                    rowspan="2"
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 150px;
                                                                                    "
                                                                                >
                                                                                    Total
                                                                                </th>
                                                                            </tr>
                                                                            <tr>
                                                                                <th
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 100px;
                                                                                    "
                                                                                >
                                                                                    Quarter
                                                                                    1
                                                                                </th>
                                                                                <th
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 100px;
                                                                                    "
                                                                                >
                                                                                    Quarter
                                                                                    2
                                                                                </th>
                                                                                <th
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 100px;
                                                                                    "
                                                                                >
                                                                                    Quarter
                                                                                    3
                                                                                </th>
                                                                                <th
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 100px;
                                                                                    "
                                                                                >
                                                                                    Quarter
                                                                                    4
                                                                                </th>
                                                                            </tr>
                                                                            <tr
                                                                                v-for="x in row
                                                                                    .item
                                                                                    .apiResources"
                                                                                :key="x.id"
                                                                            >
                                                                                <td>
                                                                                    <div
                                                                                        class="
                                                                                            mb-0
                                                                                        "
                                                                                    >
                                                                                        <div>
                                                                                            {{
                                                                                                x.itemName
                                                                                            }}
                                                                                        </div>
                                                                                        <small
                                                                                            >{{
                                                                                                x.description
                                                                                            }}</small
                                                                                        >
                                                                                    </div>
                                                                                </td>
                                                                                <td
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        x.q1
                                                                                    }}
                                                                                </td>
                                                                                <td
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        x.q2
                                                                                    }}
                                                                                </td>
                                                                                <td
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        x.q3
                                                                                    }}
                                                                                </td>
                                                                                <td
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        x.q4
                                                                                    }}
                                                                                </td>
                                                                                <td
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        new Intl.NumberFormat(
                                                                                            "ja-JP",
                                                                                            {
                                                                                                currency:
                                                                                                    "PHP",
                                                                                                style: "currency",
                                                                                            }
                                                                                        ).format(
                                                                                            x.unitCost
                                                                                        )
                                                                                    }}
                                                                                </td>
                                                                                <td
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        new Intl.NumberFormat(
                                                                                            "ja-JP",
                                                                                            {
                                                                                                currency:
                                                                                                    "PHP",
                                                                                                style: "currency",
                                                                                            }
                                                                                        ).format(
                                                                                            x.total
                                                                                        )
                                                                                    }}
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </b-card>
                                                        </template>
                                                    </b-table>
                                                </div>
                                            </div>
                                        </b-collapse>
                                    </div>
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
                                                    pagination
                                                    pagination-rounded
                                                    mb-0
                                                "
                                            >
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
            </b-tab>
            <b-tab>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block">Approved</span>
                </template>
                <div class="row">
                    <div class="col-12">
                        <div class="card border">
                            <div class="card-body">
                                <div class="row mt-4">
                                    <div class="col-sm-12 col-md-6">
                                        <h4 class="card-title m-0">
                                            List of Approved APIs by Delivery Unit
                                        </h4>
                                    </div>
                                    <!-- Search -->
                                    <div class="col-sm-12 col-md-6">
                                        <div
                                            id="tickets-table_filter"
                                            class="
                                                dataTables_filter
                                                text-md-end
                                            "
                                        >
                                            <label
                                                class="
                                                    d-inline-flex
                                                    align-items-center
                                                "
                                            >
                                                Search:
                                                <b-form-input
                                                    autocomplete="off"
                                                    v-model="filterApproved"
                                                    type="search"
                                                    placeholder="Search DU..."
                                                    class="
                                                        form-control
                                                        form-control-sm
                                                        ms-2
                                                    "
                                                ></b-form-input>
                                                <b-form-select
                                                    class="
                                                        form-select
                                                        form-select-sm
                                                        w-100p
                                                        ms-1
                                                    "
                                                    v-model="perPageApp"
                                                    size="sm"
                                                    :options="pageOptions"
                                                ></b-form-select>
                                            </label>
                                        </div>
                                    </div>
                                    <!-- End search -->
                                </div>
                                <div class="text-center mt-2" v-if="approvedData.length == 0">
                                    <h4>No data found</h4>
                                </div>
                                <div class="text-center mt-2" v-if="approvedData.length > 0 && filteredApproved.length == 0">
                                    <h4>Search not found</h4>
                                </div>
                                <div
                                    class="
                                        d-flex
                                        justify-content-center
                                        align-items-center
                                    "
                                    v-if="approvedBusy"
                                >
                                    <div
                                        class="
                                            preloader-component
                                            me-2
                                        "
                                    >
                                        <div class="status">
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
                                    <strong>Loading...</strong>
                                </div>
                                <div role="tablist" v-for="y in filteredApproved" :key="y.id">
                                    <div class="card mb-2">
                                        <div class="card-header text-info" role="tab">
                                            <div
                                                class="
                                                    d-flex
                                                    align-items-center
                                                    justify-content-between
                                                "
                                            >
                                                <div class="d-flex align-items-center cursor-pointer" @click="y.showData = !y.showData">
                                                    <h4 class="mb-0 text-info">
                                                        {{y.name}}
                                                    </h4>
                                                    <i
                                                        class="
                                                            bx bx-chevron-right
                                                            rotate
                                                            font-size-18
                                                            me-2
                                                        "
                                                        :class="{'rotate-90': y.showData}"
                                                    ></i>
                                                </div>
                                                <div
                                                    id="tickets-table_filter"
                                                    class="
                                                        dataTables_filter
                                                        text-md-end
                                                    "
                                                >
                                                    <label
                                                        class="
                                                            d-inline-flex
                                                            align-items-center
                                                            mb-0
                                                        "
                                                        v-if="y.showData"
                                                    >
                                                        <b-form-input
                                                            autocomplete="off"
                                                            v-model="y.searchKey"
                                                            type="search"
                                                            placeholder="Search API..."
                                                            class="
                                                                form-control
                                                                form-control-sm
                                                                ms-2
                                                            "
                                                        ></b-form-input>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <b-collapse :visible="y.showData"
                                            :accordion="`posted-accordion-${y.id}`"
                                            role="tabpanel">
                                            <div class="card-body">
                                                <div class="table-responsive mb-0">
                                                    <b-table
                                                        class="datatables target-table"
                                                        :items="y.data"
                                                        :fields="fields"
                                                        responsive="sm"
                                                        :sort-by.sync="sortBy"
                                                        :sort-desc.sync="sortDesc"
                                                        :busy="approvedBusy"
                                                        :filter="y.searchKey"
                                                        :filter-included-fields="filterOnApp"
                                                        @filtered="onFilteredApp"
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
                                                                <div
                                                                    class="
                                                                        preloader-component
                                                                        me-2
                                                                    "
                                                                >
                                                                    <div class="status">
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
                                                                <strong>Loading...</strong>
                                                            </div>
                                                        </template>
                                                        <template #cell(score)="data">
                                                            <div>
                                                                <b>Efficiency:</b>&nbsp;{{
                                                                    data.item.scoreEfficiency
                                                                }}
                                                            </div>
                                                            <div>
                                                                <b>Quality:</b>&nbsp;{{
                                                                    data.item.scoreQuality
                                                                }}
                                                            </div>
                                                            <div>
                                                                <b>Timeliness:</b>&nbsp;{{
                                                                    data.item.scoreTimeliness
                                                                }}
                                                            </div>
                                                        </template>
                                                        <template #cell(action)="row">
                                                            <div class="mt-2">
                                                                <button
                                                                    type="button"
                                                                    class="
                                                                        btn
                                                                        btn-primary
                                                                        btn-block
                                                                        btn-sm
                                                                    "
                                                                    @click="
                                                                        updateItem(
                                                                            row,
                                                                            'approved',
                                                                            y.id
                                                                        )
                                                                    "
                                                                >
                                                                    <i
                                                                        class="
                                                                            bx bx-edit-alt
                                                                            me-1
                                                                        "
                                                                    ></i
                                                                    >Update Score
                                                                </button>
                                                            </div>
                                                            <div class="mt-2">
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        justify-content-center
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            form-check
                                                                            form-checkbox-outline
                                                                            form-check-success
                                                                            mb-0
                                                                        "
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            :id="`customCheckcolor${row.item.id}`"
                                                                            class="
                                                                                form-check-input
                                                                            "
                                                                            @click="
                                                                                isBackLog(
                                                                                    row.item
                                                                                )
                                                                            "
                                                                            v-model="
                                                                                row.item
                                                                                    .isBackLog
                                                                            "
                                                                            v-if="
                                                                                !row.item
                                                                                    .backLoading
                                                                            "
                                                                        />
                                                                        <span
                                                                            class="
                                                                                me-2
                                                                                spinner-border
                                                                                text-success
                                                                            "
                                                                            style="
                                                                                width: 14px;
                                                                                height: 14px;
                                                                                border-width: 0.2em;
                                                                            "
                                                                            v-if="
                                                                                row.item
                                                                                    .backLoading
                                                                            "
                                                                        ></span>
                                                                        <label
                                                                            :for="`customCheckcolor${row.item.id}`"
                                                                            class="
                                                                                form-check-label
                                                                            "
                                                                        >
                                                                            Backlog
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </template>
                                                        <template #cell(name)="data">
                                                            <a
                                                                href="javascript:void(0);"
                                                                class="
                                                                    d-flex
                                                                    justify-content-start
                                                                "
                                                            >
                                                                <b class="text-white">{{
                                                                    data.item.name
                                                                }}</b>
                                                                <div>
                                                                    <span
                                                                        class="
                                                                            badge
                                                                            rounded-pill
                                                                            bg-danger
                                                                            float-end
                                                                        "
                                                                        style="font-size: 8px"
                                                                        >{{
                                                                            data.item
                                                                                .notification >
                                                                            0
                                                                                ? data.item
                                                                                    .notification
                                                                                : ""
                                                                        }}</span
                                                                    >
                                                                </div>
                                                            </a>
                                                            <div class="text-muted">
                                                                {{ data.item.description }}
                                                            </div>
                                                            <div>
                                                                <a href="javascript:void(0);" @click="data.toggleDetails">[View Details]</a>
                                                            </div>
                                                        </template>
                                                        <template #cell(office)="row">
                                                            <div>
                                                                {{
                                                                    row.item.target.deliveryUnit
                                                                        .name
                                                                }}
                                                            </div>
                                                        </template>
                                                        <template #row-details="row">
                                                            <b-card
                                                                no-body
                                                                class="p-3"
                                                            >
                                                                <div class="row">
                                                                    <div class="col-md-6">
                                                                        <h5>
                                                                            List of Items
                                                                        </h5>
                                                                    </div>
                                                                    <div
                                                                        class="
                                                                            col-md-6
                                                                            text-right
                                                                        "
                                                                    >
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            @click="
                                                                                row.toggleDetails
                                                                            "
                                                                            class="
                                                                                text-dark
                                                                                font-size-16
                                                                            "
                                                                            ><i
                                                                                class="
                                                                                    bx bx-x
                                                                                "
                                                                            ></i
                                                                        ></a>
                                                                    </div>
                                                                </div>
                                                                <div class="row">
                                                                    <div class="col-md-12">
                                                                        <table
                                                                            class="
                                                                                table
                                                                                table-bordered
                                                                                border-secondary
                                                                            "
                                                                        >
                                                                            <tr>
                                                                                <th
                                                                                    rowspan="2"
                                                                                    class="
                                                                                        text-left
                                                                                        px-2
                                                                                    "
                                                                                >
                                                                                    Item
                                                                                    Name
                                                                                </th>
                                                                                <th
                                                                                    colspan="4"
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 400px;
                                                                                    "
                                                                                >
                                                                                    Quantity
                                                                                </th>
                                                                                <th
                                                                                    rowspan="2"
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 150px;
                                                                                    "
                                                                                >
                                                                                    Unit
                                                                                    Cost
                                                                                </th>
                                                                                <th
                                                                                    rowspan="2"
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 150px;
                                                                                    "
                                                                                >
                                                                                    Total
                                                                                </th>
                                                                            </tr>
                                                                            <tr>
                                                                                <th
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 100px;
                                                                                    "
                                                                                >
                                                                                    Quarter
                                                                                    1
                                                                                </th>
                                                                                <th
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 100px;
                                                                                    "
                                                                                >
                                                                                    Quarter
                                                                                    2
                                                                                </th>
                                                                                <th
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 100px;
                                                                                    "
                                                                                >
                                                                                    Quarter
                                                                                    3
                                                                                </th>
                                                                                <th
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                    style="
                                                                                        width: 100px;
                                                                                    "
                                                                                >
                                                                                    Quarter
                                                                                    4
                                                                                </th>
                                                                            </tr>
                                                                            <tr
                                                                                v-for="x in row
                                                                                    .item
                                                                                    .apiResources"
                                                                                :key="x.id"
                                                                            >
                                                                                <td>
                                                                                    <div
                                                                                        class="
                                                                                            mb-0
                                                                                        "
                                                                                    >
                                                                                        <div>
                                                                                            {{
                                                                                                x.itemName
                                                                                            }}
                                                                                        </div>
                                                                                        <small
                                                                                            >{{
                                                                                                x.description
                                                                                            }}</small
                                                                                        >
                                                                                    </div>
                                                                                </td>
                                                                                <td
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        x.q1
                                                                                    }}
                                                                                </td>
                                                                                <td
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        x.q2
                                                                                    }}
                                                                                </td>
                                                                                <td
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        x.q3
                                                                                    }}
                                                                                </td>
                                                                                <td
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        x.q4
                                                                                    }}
                                                                                </td>
                                                                                <td
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        new Intl.NumberFormat(
                                                                                            "ja-JP",
                                                                                            {
                                                                                                currency:
                                                                                                    "PHP",
                                                                                                style: "currency",
                                                                                            }
                                                                                        ).format(
                                                                                            x.unitCost
                                                                                        )
                                                                                    }}
                                                                                </td>
                                                                                <td
                                                                                    class="
                                                                                        text-center
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        new Intl.NumberFormat(
                                                                                            "ja-JP",
                                                                                            {
                                                                                                currency:
                                                                                                    "PHP",
                                                                                                style: "currency",
                                                                                            }
                                                                                        ).format(
                                                                                            x.total
                                                                                        )
                                                                                    }}
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </b-card>
                                                        </template>
                                                    </b-table>
                                                </div>
                                            </div>
                                        </b-collapse>
                                    </div>
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
                                                    pagination
                                                    pagination-rounded
                                                    mb-0
                                                "
                                            >
                                                <b-pagination
                                                    v-model="currentPageApp"
                                                    :total-rows="rowsApp"
                                                    :per-page="perPageApp"
                                                ></b-pagination>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </b-tab>
        </b-tabs>
    </Layout>
</template>