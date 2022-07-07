<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import UploadPopover from "@/components/widgets/upload-popover.vue";
import PrintOptions from "@/components/modals/print-options.vue";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";

export default {
    page: {
        title: "My Targets",
    },
    components: {
        Layout,
        PageHeader,
        UploadPopover,
        PrintOptions,
        MaskedInput,
    },
    data() {
        return {
            title: "My Targets",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "My Targets",
                    active: true,
                },
            ],
            tableData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [10, 25, 50, 100],
            filter: null,
            filterOn: [],
            sortBy: "cluster",
            sortDesc: false,
            currencyMask: createNumberMask({
                prefix: "",
                allowDecimal: true,
                includeThousandsSeparator: false,
            }),
            fields: [
                {
                    key: "displayDetails",
                    sortable: false,
                    label: " ",
                    thStyle: { width: "30px" },
                },
                {
                    key: "indicatorItem.indicatorItemName",
                    sortable: true,
                    label: "Item Name",
                    thStyle: { width: "20%" },
                },
                {
                    key: "remarks",
                    sortable: true,
                    label: "Target Description",
                },
                {
                    key: "q1",
                    label: "Quarter 1",
                    thStyle: { width: "160px" },
                },
                {
                    key: "q2",
                    label: "Quarter 2",
                    thStyle: { width: "160px" },
                },
                {
                    key: "q3",
                    label: "Quarter 3",
                    thStyle: { width: "160px" },
                },
                {
                    key: "q4",
                    label: "Quarter 4",
                    thStyle: { width: "160px" },
                },
                {
                    key: "actions",
                    thStyle: { width: "100px" },
                },
            ],
            form: {
                id: 0,
                q1: 0,
                q1Remarks: "",
                q2: 0,
                q2Remarks: "",
                q3: 0,
                q3Remarks: "",
                q4: 0,
                q4Remarks: "",
                catchUpPlans: "",
                finalRemarks: "",
            },
            indexSelected: -1,
            tableBusy: false,
            uploadOptions: {
                type: 'Target',
                placement: 'lefttop',
                folder: 'Planning',
            },
            row: {}
        };
    },
    validations: {
        form: {
            q1: { required },
            q2: { required },
            q3: { required },
            q4: { required },
            finalRemarks: { required },
        },
    },
    computed: {
        rows() {
            return this.tableData.length;
        },
    },
    created() {
        this.totalRows = this.items.length;
        this.changeCycle(this.$store.state.data.cycle)
    },
    methods: {
        changeCycle(cycle){
            this.tableBusy = true;
            this.$store
                .dispatch("target/GetMyTarget", cycle)
                .then((res) => {
                    this.tableBusy = false;
                    res.data.forEach((item) => {
                        item.addDocu = false;
                        item.showDetails = false;
                        item.rotateChevy = false;
                        item.attachmentLoading = false;
                        item.fileSearch = ''
                        item.attachments = [];
                    });
                    this.tableData = res.data;
                })
                .catch(() => {
                    this.tableBusy = false;
                    this.showToast("Something went wrong!","error");
                });
        },
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        async onCreate() {
            this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
                return;
            }
            if (this.form.q1 > this.row.q1) {
                return;
            }
            if (this.form.q2 > this.row.q2) {
                return;
            }
            if (this.form.q3 > this.row.q3) {
                return;
            }
            if (this.form.q4 > this.row.q4) {
                return;
            }
            if(this.form.id > 0){
                await this.$store
                    .dispatch("actual/UpdateActual", this.form)
                    .then((res) => {
                        this.tableData[this.indexSelected].actual = [this.form];
                        this.$bvModal.hide("modal-standard");
                        this.showToast("Successfully updated!","success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong!","error");
                    });
            }else{
                await this.$store
                    .dispatch("actual/CreateActual", this.form)
                    .then((res) => {
                        this.tableData[this.indexSelected].actual = [this.form];
                        this.$bvModal.hide("modal-standard");
                        this.showToast("Successfully updated!","success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong!","error");
                    });
            }
            this.submitted = false;
        },
        updateItem(props) {
            this.row = {q1: props.item.q1, q2: props.item.q2, q3: props.item.q3, q4: props.item.q4}
            if(props.item.actual){
                this.form = cloneDeep(props.item.actual[0])
                this.form.q1 = props.item.actual[0].q1.toString()
                this.form.q2 = props.item.actual[0].q2.toString()
                this.form.q3 = props.item.actual[0].q3.toString()
                this.form.q4 = props.item.actual[0].q4.toString()
            }else{
                this.form ={
                      id: 0,
                      q1: '0',
                      q1Remarks: "",
                      q2: '0',
                      q2Remarks: "",
                      q3: '0',
                      q3Remarks: "",
                      q4: '0',
                      q4Remarks: "",
                      catchUpPlans: "",
                      finalRemarks: "",
                      targetId: props.item.id,
                  };
            } 
            this.indexSelected = this.tableData.indexOf(props.item);
            this.modalTitle = "Update Actual Output";
            this.$bvModal.show("modal-standard");
        },
        hideModal() {
            this.$bvModal.hide("modal-standard");
        },
        postItem(props) {
            var index = this.tableData.indexOf(props.item);
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
                        .dispatch("actual/PostActual", props.item.id)
                        .then((res) => {
                            this.tableData[index].status = "Posted";
                            this.showToast("Successfully posted!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
            });
        },
        showDtls(row) {
            row.item.rotateChevy = !row.item.rotateChevy;
            if(row.item.showDetails){
                row.item.showDetails = !row.item.showDetails;
                setTimeout(() => {
                    row.toggleDetails();
                }, 600);
            }else{
                row.toggleDetails();
                setTimeout(() => {
                    this.getAttachments(row.item)
                    row.item.showDetails = !row.item.showDetails;
                }, 50);
            }
        },
        getAttachments(row){
            row.attachmentLoading = true;
            row.attachments = [];
            this.$store
                .dispatch("filemanager/GetFiles", {id: row.id, type: this.uploadOptions.type})
                .then((res) => {
                    row.attachmentLoading = false;
                    row.attachments = res.data;
                })
                .catch(() => {
                    row.attachmentLoading = false;
                    this.showToast('Something went wrong! - getting documents', "error");
                });
        },
        openDocument(x) {
            window.open(
                `${this.$store.state.data.rootFileDirectory}${x.folder}/${x.fileName}`
            );
        },
        removeFile(id, parentId){
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
                            let index = this.tableData.findIndex(item => item.id == parentId);
                            let yIndex = this.tableData[index].attachments.findIndex(item => item.id == id);
                            this.tableData[index].attachments.splice(yIndex, 1);
                            this.showToast('Successfully removed!', "success");
                        })
                        .catch(() => {
                            this.showToast('Cannot be remove!', "error");
                        });
                }
            });
        },
        uploadedDocument(response, id){
            let index = this.tableData.findIndex(item => item.id == id);
            this.tableData[index].attachments.push(response);
        },
        searchDocu(row){
            let data = row.attachments;
            if (row.fileSearch.trim() != "" && row.fileSearch) {
                data = data.filter((item) => {
                    return item.description
                        .toUpperCase()
                        .includes(row.fileSearch.toUpperCase());
                });
            }
            return data;
        },
        async printPPMPCampus(){
            this.$refs.printOpt.putOptions({apiUrl: 'api/Target/Print/Campus/PPMP', routeVariables: [this.$store.state.data.cycle]})
            this.$bvModal.show('print-options-modal')
        },
        async printPPMPDU(){
             this.$refs.printOpt.putOptions({
                apiUrl: "api/Api/Print/My/PPMP",
                routeVariables: [this.$store.state.data.cycle],
            });
            this.$bvModal.show("print-options-modal");
        },
        async printDULIB(){
            this.$refs.printOpt.putOptions({apiUrl: 'api/Target/Print/LIB/DeliveryUnit', routeVariables: [this.$store.state.data.cycle]})
            this.$bvModal.show('print-options-modal')
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
            size="lg"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreate"
                class="needs-validation"
                ref="fcForm"
            >
                <b-row class="mb-2">
                    <b-col>
                        <div class="mb-2 border p-3">
                            <h5 class="text-center">Quarter 1</h5>
                            <hr>
                            <div class="d-flex w-100 my-3">
                                <div class="d-flex w-50 align-items-center me-2">
                                    <span class="mx-2 text-warning">Target</span>
                                    <input
                                        autocomplete="off"
                                        id="q1"
                                        type="text"
                                        placeholder="Enter Quarter 1 Value ..."
                                        class="form-control text-warning"
                                        disabled
                                        :value="row.q1"
                                    />
                                </div>
                                <div class="d-flex w-50 align-items-center">
                                    <span class="me-2">Actual</span>
                                    <masked-input
                                        autocomplete="off"
                                        id="q1"
                                        type="text"
                                        v-model="form.q1"
                                        placeholder="Enter Quarter 1 Value ..."
                                        class="form-control"
                                        :class="{
                                            'is-invalid':
                                                submitted &&
                                                $v.form.q1.$error || form.q1 > row.q1
                                        }"
                                        :mask="currencyMask"
                                    ></masked-input>
                                </div>
                            </div>
                            <div class="d-flex align-items-center">
                                <textarea
                                    autocomplete="off"
                                    id="q1Remarks"
                                    rows="2"
                                    v-model="form.q1Remarks"
                                    placeholder="Enter Quarter 1 Remarks..."
                                    class="form-control"
                                ></textarea>
                            </div>
                        </div>
                    </b-col>
                    <b-col>
                        <div class="mb-2 border p-3">
                            <h5 class="text-center">Quarter 2</h5>
                            <hr>
                            <div class="d-flex w-100 my-3">
                                <div class="d-flex w-50 align-items-center me-2">
                                    <span class="mx-2 text-warning">Target</span>
                                    <input
                                        autocomplete="off"
                                        id="q2"
                                        type="text"
                                        placeholder="Enter Quarter 2 Value ..."
                                        class="form-control text-warning"
                                        disabled
                                        :value="row.q2"
                                    />
                                </div>
                                <div class="d-flex w-50 align-items-center">
                                    <span class="me-2">Actual</span>
                                    <masked-input
                                        autocomplete="off"
                                        id="q2"
                                        type="text"
                                        v-model="form.q2"
                                        placeholder="Enter Quarter 2 Value ..."
                                        class="form-control"
                                        :class="{
                                            'is-invalid':
                                                submitted &&
                                                $v.form.q2.$error  || form.q2 > row.q2
                                        }"
                                        :mask="currencyMask"
                                    ></masked-input>
                                </div>
                            </div>
                            <div class="d-flex align-items-center">
                                <textarea
                                    autocomplete="off"
                                    id="q2Remarks"
                                    rows="2"
                                    v-model="form.q2Remarks"
                                    placeholder="Enter Quarter 2 Remarks..."
                                    class="form-control"
                                ></textarea>
                            </div>
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <div class="mb-2 border p-3">
                            <h5 class="text-center">Quarter 3</h5>
                            <hr>
                            <div class="d-flex w-100 my-3">
                                <div class="d-flex w-50 align-items-center me-2">
                                    <span class="mx-2 text-warning">Target</span>
                                    <input
                                        autocomplete="off"
                                        id="q1"
                                        type="text"
                                        placeholder="Enter Quarter 3 Value ..."
                                        class="form-control text-warning"
                                        disabled
                                        :value="row.q3"
                                    />
                                </div>
                                <div class="d-flex w-50 align-items-center">
                                    <span class="me-2">Actual</span>
                                    <masked-input
                                        autocomplete="off"
                                        id="q3"
                                        type="text"
                                        v-model="form.q3"
                                        placeholder="Enter Quarter 3 Value ..."
                                        class="form-control"
                                        :class="{
                                            'is-invalid':
                                                submitted &&
                                                $v.form.q3.$error  || form.q3 > row.q3
                                        }"
                                        :mask="currencyMask"
                                    ></masked-input>
                                </div>
                            </div>
                            <div class="d-flex align-items-center">
                                <textarea
                                    autocomplete="off"
                                    id="q3Remarks"
                                    rows="2"
                                    v-model="form.q3Remarks"
                                    placeholder="Enter Quarter 3 Remarks..."
                                    class="form-control"
                                ></textarea>
                            </div>
                        </div>
                    </b-col>
                    <b-col>
                        <div class="mb-2 border p-3">
                            <h5 class="text-center">Quarter 4</h5>
                            <hr>
                            <div class="d-flex w-100 my-3">
                                <div class="d-flex w-50 align-items-center me-2">
                                    <span class="mx-2 text-warning">Target</span>
                                    <input
                                        autocomplete="off"
                                        id="q1"
                                        type="text"
                                        placeholder="Enter Quarter 4 Value ..."
                                        class="form-control text-warning"
                                        disabled
                                        :value="row.q4"
                                    />
                                </div>
                                <div class="d-flex w-50 align-items-center">
                                    <span class="me-2">Actual</span>
                                    <masked-input
                                        autocomplete="off"
                                        id="q4"
                                        type="text"
                                        v-model="form.q4"
                                        placeholder="Enter Quarter 4 Value ..."
                                        class="form-control"
                                        :class="{
                                            'is-invalid':
                                                submitted &&
                                                $v.form.q4.$error  || form.q4 > row.q4
                                        }"
                                        :mask="currencyMask"
                                    ></masked-input>
                                </div>
                            </div>
                            <div class="d-flex align-items-center">
                                <textarea
                                    autocomplete="off"
                                    id="q4Remarks"
                                    rows="2"
                                    v-model="form.q4Remarks"
                                    placeholder="Enter Quarter 4 Remarks..."
                                    class="form-control"
                                ></textarea>
                            </div>
                        </div>
                    </b-col>
                </b-row>
                <b-row class="mb-3">
                    <b-col sm="6">
                        <label for="catchUpPlans"
                            >Catchup Plans</label
                        >
                        <textarea
                            id="catchUpPlans"
                            rows="4"
                            v-model="form.catchUpPlans"
                            placeholder="Catchup Plans..."
                            class="form-control"
                        ></textarea>
                    </b-col>
                    <b-col sm="6">
                        <label for="finalRemarks"
                            >Final Remarks</label
                        >
                        <textarea
                            id="finalRemarks"
                            rows="4"
                            v-model="form.finalRemarks"
                            placeholder="Final Remarks..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted &&
                                    $v.form.finalRemarks
                                        .$error,
                            }"
                        ></textarea>
                        <div
                            v-if="
                                submitted &&
                                $v.form.finalRemarks.$error
                            "
                            class="invalid-feedback"
                        >
                            <span
                                v-if="
                                    !$v.form.finalRemarks
                                        .required
                                "
                                >This value is
                                required.</span
                            >
                        </div>
                    </b-col>
                </b-row>
                <div class="modal-footer">
                    <button
                        type="submit"
                        class="btn btn-primary"
                    >
                        Save changes
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
        <div class="row">
            <div class="col-12">
                <div
                    class="
                        card
                        border-4
                        border-top
                        border-start-0
                        border-end-0
                        border-primary
                    "
                >
                    <div class="card-body">
                        <div
                            class="
                                d-flex
                                justify-content-between
                                align-items-center
                            "
                        >
                            <h4 class="card-title m-0">Target List</h4>
                            <b-dropdown
                                id="dropdown-dropleft"
                                right
                                variant="purple"
                                toggle-class="text-decoration-none"
                                menu-class="dropdown-menu-end"
                                no-caret
                            >
                                <template #button-content>
                                    <i class="bx bx-printer me-1"></i> Reports
                                </template>
                                <b-dropdown-item @click="printPPMPCampus()">PPMP by Campus</b-dropdown-item>
                                <b-dropdown-item @click="printPPMPDU()">PPMP by Delivery Unit</b-dropdown-item>
                                <b-dropdown-item @click="printDULIB()">Delivery Unit LIB</b-dropdown-item>
                            </b-dropdown>
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
                                            v-model="filter"
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
                                class="datatables target-table"
                                :items="tableData"
                                :fields="fields"
                                responsive="sm"
                                :per-page="perPage"
                                :current-page="currentPage"
                                :sort-by.sync="sortBy"
                                :sort-desc.sync="sortDesc"
                                :filter="filter"
                                :filter-included-fields="filterOn"
                                :busy="tableBusy"
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
                                <template #cell(q1)="row">
                                    <div>
                                        Target:
                                        {{
                                            row.item.indicatorItem.isPercentage
                                                ? row.item.q1 + "%"
                                                : row.item.q1
                                        }}
                                    </div>
                                    <hr class="m-1" />
                                    <div v-if="!row.item.actual">
                                        Actual: 0
                                    </div>
                                    <div v-if="row.item.actual">
                                        Actual:
                                        {{
                                            row.item.indicatorItem.isPercentage
                                                ? `${row.item.actual[0].q1}%`
                                                : row.item.actual[0].q1
                                        }}
                                    </div>
                                    <hr class="m-1" />
                                    <div>
                                        Remarks:
                                        {{
                                            row.item.actual
                                                ? row.item.actual[0].q1Remarks
                                                : ""
                                        }}
                                    </div>
                                </template>
                                <template #cell(q2)="row">
                                    <div>
                                        Target:
                                        {{
                                            row.item.indicatorItem.isPercentage
                                                ? row.item.q2 + "%"
                                                : row.item.q2
                                        }}
                                    </div>
                                    <hr class="m-1" />
                                    <div v-if="!row.item.actual">
                                        Actual: 0
                                    </div>
                                    <div v-if="row.item.actual">
                                        Actual:
                                        {{
                                            row.item.indicatorItem.isPercentage
                                                ? `${row.item.actual[0].q2}%`
                                                : row.item.actual[0].q2
                                        }}
                                    </div>
                                    <hr class="m-1" />
                                    <div>
                                        Remarks:
                                        {{
                                            row.item.actual
                                                ? row.item.actual[0].q2Remarks
                                                : ""
                                        }}
                                    </div>
                                </template>
                                <template #cell(q3)="row">
                                    <div>
                                        Target:
                                        {{
                                            row.item.indicatorItem.isPercentage
                                                ? row.item.q3 + "%"
                                                : row.item.q3
                                        }}
                                    </div>
                                    <hr class="m-1" />
                                    <div v-if="!row.item.actual">
                                        Actual: 0
                                    </div>
                                    <div v-if="row.item.actual">
                                        Actual:
                                        {{
                                            row.item.indicatorItem.isPercentage
                                                ? `${row.item.actual[0].q3}%`
                                                : row.item.actual[0].q3
                                        }}
                                    </div>
                                    <hr class="m-1" />
                                    <div>
                                        Remarks:
                                        {{
                                            row.item.actual
                                                ? row.item.actual[0].q3Remarks
                                                : ""
                                        }}
                                    </div>
                                </template>
                                <template #cell(q4)="row">
                                    <div>
                                        Target:
                                        {{
                                            row.item.indicatorItem.isPercentage
                                                ? row.item.q4 + "%"
                                                : row.item.q4
                                        }}
                                    </div>
                                    <hr class="m-1" />
                                    <div v-if="!row.item.actual">
                                        Actual: 0
                                    </div>
                                    <div v-if="row.item.actual">
                                        Actual:
                                        {{
                                            row.item.indicatorItem.isPercentage
                                                ? `${row.item.actual[0].q4}%`
                                                : row.item.actual[0].q4
                                        }}
                                    </div>
                                    <hr class="m-1" />
                                    <div>
                                        Remarks:
                                        {{
                                            row.item.actual
                                                ? row.item.actual[0].q4Remarks
                                                : ""
                                        }}
                                    </div>
                                </template>
                                <template #cell(actions)="row">
                                    <div
                                        class="
                                            float-end
                                            d-flex
                                            align-items-center
                                        "
                                    >
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
                                                    class="fas fa-ellipsis-v"
                                                ></i>
                                            </template>
                                            <b-dropdown-item
                                                @click="showDtls(row)"
                                                ><i
                                                    class="
                                                        bx
                                                        bxs-book-content
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >{{
                                                    row.detailsShowing
                                                        ? "Hide"
                                                        : "Show"
                                                }}
                                                Details</b-dropdown-item
                                            >
                                            <b-dropdown-item
                                                @click="updateItem(row)"
                                                variant="success"
                                                ><i
                                                    class="
                                                        mdi mdi-update
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >Update Actual
                                                Value</b-dropdown-item
                                            >
                                        </b-dropdown>
                                    </div>
                                </template>
                                <template #cell(displayDetails)="row">
                                    <div
                                        class="
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
                                    <transition name="max-height">
                                        <b-card v-if="row.item.showDetails">
                                            <b-row>
                                                <b-col sm="6">
                                                    <b-row class="mb-2">
                                                        <b-col
                                                            sm="4"
                                                            class="text-right"
                                                            ><b
                                                                >Cycle:</b
                                                            ></b-col
                                                        >
                                                        <b-col>{{
                                                            row.item.cycle
                                                        }}</b-col>
                                                    </b-row>
                                                    <b-row class="mb-2">
                                                        <b-col
                                                            sm="4"
                                                            class="text-right"
                                                            ><b
                                                                >Item Name:</b
                                                            ></b-col
                                                        >
                                                        <b-col>{{
                                                            row.item
                                                                .indicatorItem
                                                                .indicatorItemName
                                                        }}</b-col>
                                                    </b-row>
                                                    <b-row class="mb-2">
                                                        <b-col
                                                            sm="4"
                                                            class="text-right"
                                                            ><b
                                                                >Delivery
                                                                Unit:</b
                                                            ></b-col
                                                        >
                                                        <b-col
                                                            >{{
                                                                row.item
                                                                    .deliveryUnit
                                                                    .office
                                                                    .campus
                                                                    .agency
                                                                    .agencyShortName
                                                            }}
                                                            /
                                                            {{
                                                                row.item
                                                                    .deliveryUnit
                                                                    .office
                                                                    .campus
                                                                    .campusName
                                                            }}
                                                            /
                                                            {{
                                                                row.item
                                                                    .deliveryUnit
                                                                    .office
                                                                    .shortName
                                                            }}
                                                            /
                                                            {{
                                                                row.item
                                                                    .deliveryUnit
                                                                    .name
                                                            }}</b-col
                                                        >
                                                    </b-row>
                                                    <b-row class="mb-2">
                                                        <b-col
                                                            sm="4"
                                                            class="text-right"
                                                            ><b>Type:</b></b-col
                                                        >
                                                        <b-col>{{
                                                            row.item
                                                                .indicatorItem
                                                                .prioritizationType
                                                        }}</b-col>
                                                    </b-row>
                                                    <b-row class="mb-2">
                                                        <b-col
                                                            sm="4"
                                                            class="text-right"
                                                            ><b
                                                                >Year to be
                                                                complied:</b
                                                            ></b-col
                                                        >
                                                        <b-col>{{
                                                            row.item
                                                                .indicatorItem
                                                                .yearToBeComplied
                                                        }}</b-col>
                                                    </b-row>
                                                    <b-row class="mb-2">
                                                        <b-col
                                                            sm="4"
                                                            class="text-right"
                                                            ><b
                                                                >Final
                                                                Remarks:</b
                                                            ></b-col
                                                        >
                                                        <b-col>{{
                                                            row.item
                                                                .indicatorItem
                                                                .finalRemarks
                                                        }}</b-col>
                                                    </b-row>
                                                    <b-row class="mb-2">
                                                        <b-col
                                                            sm="4"
                                                            class="text-right"
                                                            ><b
                                                                >Is Percentage
                                                                ?:</b
                                                            ></b-col
                                                        >
                                                        <b-col>{{
                                                            row.item
                                                                .indicatorItem
                                                                .isPercentage
                                                                ? "Yes"
                                                                : "No"
                                                        }}</b-col>
                                                    </b-row>
                                                    <b-row class="mb-2">
                                                        <b-col
                                                            sm="4"
                                                            class="text-right"
                                                            ><b
                                                                >Is Completed
                                                                ?:</b
                                                            ></b-col
                                                        >
                                                        <b-col>{{
                                                            row.item
                                                                .indicatorItem
                                                                .isCompleted
                                                                ? "Yes"
                                                                : "No"
                                                        }}</b-col>
                                                    </b-row>
                                                    <b-row class="mb-2">
                                                        <b-col
                                                            sm="4"
                                                            class="text-right"
                                                            ><b
                                                                >Is Recurring
                                                                ?:</b
                                                            ></b-col
                                                        >
                                                        <b-col>{{
                                                            row.item
                                                                .indicatorItem
                                                                .isRecurring
                                                                ? "Yes"
                                                                : "No"
                                                        }}</b-col>
                                                    </b-row>
                                                </b-col>
                                                <b-col sm="6">
                                                    <div
                                                        class="table-responsive"
                                                    >
                                                        <div class="text-right">
                                                            <button
                                                                type="button"
                                                                @click="
                                                                    row.item.addDocu = true
                                                                "
                                                                class="
                                                                    btn
                                                                    btn-sm
                                                                    btn-outline-success
                                                                    mb-2
                                                                    me-2
                                                                "
                                                                :id="`target-document${row.item.id}`"
                                                            >
                                                                <i
                                                                    class="
                                                                        mdi mdi-upload
                                                                        fs-6
                                                                    "
                                                                ></i>
                                                                Upload Documents
                                                            </button>
                                                            <upload-popover
                                                                :option="
                                                                    uploadOptions
                                                                "
                                                                :sourceId="
                                                                    row.item.id
                                                                "
                                                                @uploaded="
                                                                    uploadedDocument(
                                                                        $event,
                                                                        row.item.id
                                                                    )
                                                                "
                                                                :showPV="
                                                                    row.item.addDocu
                                                                "
                                                                @closePopover="row.item.addDocu = false"
                                                                :dzId="`dropzone-target${row.item.id}`"
                                                                :pvId="`target-document${row.item.id}`"
                                                            ></upload-popover>
                                                            <button
                                                                type="button"
                                                                @click="
                                                                    updateItem(
                                                                        row
                                                                    )
                                                                "
                                                                class="
                                                                    btn
                                                                    btn-sm
                                                                    btn-success
                                                                    mb-2
                                                                    me-2
                                                                "
                                                            >
                                                                <i
                                                                    class="
                                                                        mdi
                                                                        mdi-update
                                                                        fs-6
                                                                    "
                                                                ></i>
                                                                Update Actual
                                                                Value
                                                            </button>
                                                            <button
                                                                v-if="
                                                                    row.item
                                                                        .actual &&
                                                                    row.item
                                                                        .actual[0]
                                                                        .status !==
                                                                        'Posted'
                                                                "
                                                                type="button"
                                                                @click="
                                                                    postItem(
                                                                        row
                                                                    )
                                                                "
                                                                class="
                                                                    btn
                                                                    btn-sm
                                                                    btn-warning
                                                                    mb-2
                                                                "
                                                            >
                                                                <i
                                                                    class="
                                                                        mdi
                                                                        mdi-post
                                                                        fs-6
                                                                    "
                                                                ></i>
                                                                Post Actual
                                                                Value
                                                            </button>
                                                        </div>
                                                        <table
                                                            class="
                                                                table
                                                                table-bordered
                                                                border-primary
                                                                mb-0
                                                            "
                                                        >
                                                            <thead>
                                                                <tr>
                                                                    <th
                                                                        class="
                                                                            text-center
                                                                        "
                                                                        style="width:120px;"
                                                                    >
                                                                        Quarter
                                                                    </th>
                                                                    <th
                                                                        class="
                                                                            text-center
                                                                        "
                                                                        style="width:120px;"
                                                                    >
                                                                        Target
                                                                    </th>
                                                                    <th
                                                                        class="
                                                                            text-center
                                                                        "
                                                                        style="width:120px;"
                                                                    >
                                                                        Actual
                                                                    </th>
                                                                    <th
                                                                        class="
                                                                            text-center
                                                                        "
                                                                    >
                                                                        Remarks
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                            align-middle
                                                                        "
                                                                    >
                                                                        Quarter
                                                                        1
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                    >
                                                                        {{
                                                                            row
                                                                                .item
                                                                                .indicatorItem
                                                                                .isPercentage
                                                                                ? `${row.item.q1}%`
                                                                                : row
                                                                                      .item
                                                                                      .q1
                                                                        }}
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                        v-if="
                                                                            row
                                                                                .item
                                                                                .actual
                                                                        "
                                                                    >
                                                                        {{
                                                                            row
                                                                                .item
                                                                                .indicatorItem
                                                                                .isPercentage
                                                                                ? `${row.item.actual[0].q1}%`
                                                                                : row
                                                                                      .item
                                                                                      .actual[0]
                                                                                      .q1
                                                                        }}
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                        v-if="
                                                                            !row
                                                                                .item
                                                                                .actual
                                                                        "
                                                                    ></td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                    >
                                                                        {{
                                                                            row
                                                                                .item
                                                                                .actual
                                                                                ? row
                                                                                      .item
                                                                                      .actual[0]
                                                                                      .q1Remarks
                                                                                : ""
                                                                        }}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                            align-middle
                                                                        "
                                                                    >
                                                                        Quarter
                                                                        2
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                    >
                                                                        {{
                                                                            row
                                                                                .item
                                                                                .indicatorItem
                                                                                .isPercentage
                                                                                ? `${row.item.q2}%`
                                                                                : row
                                                                                      .item
                                                                                      .q2
                                                                        }}
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                        v-if="
                                                                            row
                                                                                .item
                                                                                .actual
                                                                        "
                                                                    >
                                                                        {{
                                                                            row
                                                                                .item
                                                                                .indicatorItem
                                                                                .isPercentage
                                                                                ? `${row.item.actual[0].q2}%`
                                                                                : row
                                                                                      .item
                                                                                      .actual[0]
                                                                                      .q2
                                                                        }}
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                        v-if="
                                                                            !row
                                                                                .item
                                                                                .actual
                                                                        "
                                                                    ></td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                    >
                                                                        {{
                                                                            row
                                                                                .item
                                                                                .actual
                                                                                ? row
                                                                                      .item
                                                                                      .actual[0]
                                                                                      .q2Remarks
                                                                                : ""
                                                                        }}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                            align-middle
                                                                        "
                                                                    >
                                                                        Quarter
                                                                        3
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                    >
                                                                        {{
                                                                            row
                                                                                .item
                                                                                .indicatorItem
                                                                                .isPercentage
                                                                                ? `${row.item.q3}%`
                                                                                : row
                                                                                      .item
                                                                                      .q3
                                                                        }}
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                        v-if="
                                                                            row
                                                                                .item
                                                                                .actual
                                                                        "
                                                                    >
                                                                        {{
                                                                            row
                                                                                .item
                                                                                .indicatorItem
                                                                                .isPercentage
                                                                                ? `${row.item.actual[0].q3}%`
                                                                                : row
                                                                                      .item
                                                                                      .actual[0]
                                                                                      .q3
                                                                        }}
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                        v-if="
                                                                            !row
                                                                                .item
                                                                                .actual
                                                                        "
                                                                    ></td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                    >
                                                                        {{
                                                                            row
                                                                                .item
                                                                                .actual
                                                                                ? row
                                                                                      .item
                                                                                      .actual[0]
                                                                                      .q3Remarks
                                                                                : ""
                                                                        }}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                            align-middle
                                                                        "
                                                                    >
                                                                        Quarter
                                                                        4
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                    >
                                                                        {{
                                                                            row
                                                                                .item
                                                                                .indicatorItem
                                                                                .isPercentage
                                                                                ? `${row.item.q4}%`
                                                                                : row
                                                                                      .item
                                                                                      .q4
                                                                        }}
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                        v-if="
                                                                            row
                                                                                .item
                                                                                .actual
                                                                        "
                                                                    >
                                                                        {{
                                                                            row
                                                                                .item
                                                                                .indicatorItem
                                                                                .isPercentage
                                                                                ? `${row.item.actual[0].q4}%`
                                                                                : row
                                                                                      .item
                                                                                      .actual[0]
                                                                                      .q4
                                                                        }}
                                                                    </td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                        v-if="
                                                                            !row
                                                                                .item
                                                                                .actual
                                                                        "
                                                                    ></td>
                                                                    <td
                                                                        class="
                                                                            text-center
                                                                        "
                                                                    >
                                                                        {{
                                                                            row
                                                                                .item
                                                                                .actual
                                                                                ? row
                                                                                      .item
                                                                                      .actual[0]
                                                                                      .q4Remarks
                                                                                : ""
                                                                        }}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </b-col>
                                            </b-row>
                                            <b-row class="mt-2">
                                                <b-col>
                                                    <h5>
                                                        <div class="d-flex align-items-center justify-content-between">
                                                            <div class="d-flex align-items-center">
                                                                <i class="bx bx-paperclip me-1"></i>
                                                                <span class="me-1">Attachments</span>
                                                                <span v-if="row.item.attachments.length == 0">- No document found.</span>
                                                                <span v-if="searchDocu(row.item).length == 0 && row.item.fileSearch">- Search not found.</span>
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        justify-content-center
                                                                        align-items-center
                                                                        ms-4
                                                                        font-size-14
                                                                    "
                                                                    v-if="row.item.attachmentLoading"
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
                                                            </div>
                                                            <div>
                                                                <input type="search" class="form-control form-control-sm" placeholder="Search Attachments" v-model="row.item.fileSearch" @input="searchDocu(row.item)">
                                                            </div>
                                                        </div>
                                                    </h5>
                                                    <div class="row">
                                                        <div class="col-md-3" v-for="(y, index) in searchDocu(row.item)" :key="y.id">
                                                            <div
                                                                class="
                                                                    position-relative
                                                                    cursor-pointer
                                                                    border
                                                                    mt-2
                                                                    br-5
                                                                "
                                                                :style="`z-index: ${searchDocu(row.item).length - index}`"
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
                                                                                <template #button-content>
                                                                                    <i class="mdi mdi-dots-horizontal"></i>
                                                                                </template>
                                                                                <b-dropdown-item
                                                                                    @click="openDocument(y)"
                                                                                    ><i class="bx bx-link-external me-1"></i>Open</b-dropdown-item
                                                                                >
                                                                                <b-dropdown-item variant="danger" @click="removeFile(y.id, row.item.id)"
                                                                                    ><i class="bx bx-trash me-1"></i>Remove</b-dropdown-item
                                                                                >
                                                                            </b-dropdown>
                                                                        </div>
                                                                        <div
                                                                            class="
                                                                                avatar-xs
                                                                                me-3
                                                                                mb-2
                                                                            "
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
                                                                                    v-if="y.fileType.includes('application')"
                                                                                    class="
                                                                                        mdi mdi-file-pdf-outline
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
                                                                                    {{y.description}}
                                                                                </h5>
                                                                                <p
                                                                                    class="
                                                                                        text-muted
                                                                                        mb-0
                                                                                    "
                                                                                >
                                                                                    {{formatDateWithTime(new Date(y.dateTimeUploaded))}}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </b-col>
                                            </b-row>
                                        </b-card>
                                    </transition>
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
        <print-options ref="printOpt"></print-options>
    </Layout>
</template>