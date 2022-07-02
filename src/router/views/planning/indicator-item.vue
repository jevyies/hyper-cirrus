<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import Sortable from "sortablejs";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";

const createSortable = (el, options) => {
    return Sortable.create(el, {
        ...options,
    });
};
const sortable = {
    name: "sortable",
    bind(el, binding, vnode) {
        const table = el.querySelector("table");
        table._sortable = createSortable(
            table.querySelector("tbody"),
            binding.value,
            vnode
        );
    },
};
export default {
    directives: { sortable },
    page: {
        title: "Indicator Item",
    },
    components: {
        Layout,
        PageHeader,
        MaskedInput,
    },

    data() {
        let self = this;
        return {
            title: "Indicator Item",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Indicator",
                    href: "/planning/indicator",
                },
                {
                    text: "Indicator Item",
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
            sortBy: "sequence",
            sortDesc: false,
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: false,
            }),
            fields: [
                {
                    key: "id",
                    label: "ID",
                    sortable: true,
                    thClass: "d-none",
                    tdClass: "d-none",
                },
                {
                    key: "sequence",
                    sortable: true,
                    thStyle: { width: "10%" },
                },
                {
                    key: "indicatorItemName",
                    sortable: true,
                },
                {
                    key: "type",
                    sortable: true,
                },
                {
                    key: "actions",
                    thStyle: { width: "100px" },
                },
            ],
            form: {
                id: 0,
                indicatorItemName: "",
                type: "",
                prioritizationType: "",
                finalRemarks: "",
                indicatorId: this.$route.params.id,
                sequence: 0,
                isPercentage: false,
                yearToBeComplied: "",
                isCompleted: false,
                isRecurring: false,
            },
            indexSelected: -1,
            tableBusy: false,
            tableUpdate: false,
            indicatorTypes: [
                {
                    value: "",
                    text: "Select Type",
                },
                {
                    text: "Output",
                    value: "Output",
                },
                {
                    text: "Outcome",
                    value: "Outcome",
                },
                {
                    text: "Impact",
                    value: "Impact",
                },
            ],
            priorityTypes: [
                {
                    value: "",
                    text: "Select Prioritization Type",
                },
                {
                    text: "Core",
                    value: "Core",
                },
                {
                    text: "Strategic",
                    value: "Strategic",
                },
                {
                    text: "Mandated",
                    value: "Mandated",
                },
                {
                    text: "Project Based",
                    value: "Project Based",
                },
                {
                    text: "Intervention",
                    value: "Intervention",
                },
            ],
            seqArray: [],
            sortableOptions: {
                animation: 150,
                onEnd: function (evt) {
                    self.tableUpdate = true;
                    var list = evt.from.querySelectorAll("tr");
                    var sequence = 1;
                    var newIndex = [];
                    list.forEach(function (item) {
                        if (item.getAttribute("aria-rowindex")) {
                            var id = item.querySelector("td").innerText;
                            var text = cloneDeep(
                                item.getAttribute("aria-rowindex")
                            );
                            item.childNodes[1].innerText =
                                text + " to " + sequence;
                            newIndex.push({ sequence: sequence, id: id });
                            sequence++;
                        }
                        self.seqArray = newIndex;
                    });
                },
            },
        };
    },
    validations: {
        form: {
            indicatorItemName: { required },
            type: { required },
            prioritizationType: { required },
            yearToBeComplied: { required },
        },
    },
    computed: {
        rows() {
            return this.tableData.length;
        },
    },
    created() {
        this.$store
            .dispatch("indicator/GetSingleIndicator", this.$route.params.id)
            .then((res) => {
                this.title = `${res.data.indicatorName} - Indicator Items`;
            })
            .catch(() => {
                this.showToast("Something went wrong!","error");
            });
        this.getData();
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addItem() {
            this.onReset();
            this.modalTitle = "Create New Indicator Item";
            this.$bvModal.show("modal-standard");
        },
        onCreate() {
            this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
                return;
            } else {
                if (this.form.id > 0) {
                    this.$store
                        .dispatch(
                            "indicatoritem/UpdateIndicatorItem",
                            this.form
                        )
                        .then((res) => {
                            this.tableData.splice(
                                this.indexSelected,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("modal-standard");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.form.sequence = this.tableData.length + 1;
                    this.$store
                        .dispatch(
                            "indicatoritem/CreateIndicatorItem",
                            this.form
                        )
                        .then((res) => {
                            this.tableData.push(res.data);
                            this.$bvModal.hide("modal-standard");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        onReset() {
            this.form = {
                id: 0,
                indicatorItemName: "",
                type: "",
                prioritizationType: "",
                finalRemarks: "",
                indicatorId: this.$route.params.id,
                sequence: 0,
                isPercentage: false,
                yearToBeComplied: "",
                isCompleted: false,
                isRecurring: false,
            };
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.indexSelected = this.tableData.indexOf(props.item);
            this.modalTitle = "Update Indicator Item";
            this.$bvModal.show("modal-standard");
        },
        hideModal() {
            this.$bvModal.hide("modal-standard");
        },
        deleteItem(props) {
            var index = this.tableData.indexOf(props.item);
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
                        .dispatch(
                            "indicatoritem/DeleteIndicatorItem",
                            props.item.id
                        )
                        .then((res) => {
                            if (res.status == 204) {
                                this.tableData.splice(index, 1);
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        updateSequence() {
            this.$store
                .dispatch(
                    "indicatoritem/UpdateIndicatorItemSequence",
                    this.seqArray
                )
                .then((res) => {
                    if (res) {
                        this.tableUpdate = false;
                        this.getData();
                        this.showToast("Successfully updated sequence!","success");
                    }
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                });
        },
        cancelSequence() {
            this.tableUpdate = false;
            this.getData();
        },
        getData() {
            this.totalRows = this.items.length;
            this.tableBusy = true;
            this.$store
                .dispatch(
                    "indicatoritem/GetIndicatorItemByIndicator",
                    this.$route.params.id
                )
                .then((res) => {
                    this.tableBusy = false;
                    this.tableData = res.data;
                })
                .catch(() => {
                    this.tableBusy = false;
                    this.showToast("Something went wrong!","error");
                });
        },
        viewTargets(id) {
            this.$router.push(`/planning/target/${id}`);
        },
    },
};
</script>

<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <div class="row">
            <div class="col-12">

                <div class="card border">
                    <div class="card-body">
                        <div
                            class="
                                d-flex
                                justify-content-between
                                align-items-center
                            "
                        >
                            <h4 class="card-title m-0">Table List</h4>
                            <button
                                type="button"
                                @click="addItem()"
                                class="
                                    btn btn-md btn-info
                                    d-flex
                                    align-items-center
                                "
                            >
                                <i class="bx bx-plus fs-6"></i>Create New
                            </button>
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
                                    <div class="row">
                                        <div class="col-6">
                                            <div class="mb-3">
                                                <label for="indicatorItemName"
                                                    >Item Name
                                                </label>
                                                <textarea
                                                    id="indicatorItemName"
                                                    rows="3"
                                                    v-model="
                                                        form.indicatorItemName
                                                    "
                                                    placeholder="Enter Item Name..."
                                                    class="form-control"
                                                    :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form
                                                                .indicatorItemName
                                                                .$error,
                                                    }"
                                                ></textarea>
                                                <div
                                                    v-if="
                                                        submitted &&
                                                        $v.form
                                                            .indicatorItemName
                                                            .$error
                                                    "
                                                    class="invalid-feedback"
                                                >
                                                    <span
                                                        v-if="
                                                            !$v.form
                                                                .indicatorItemName
                                                                .required
                                                        "
                                                        >This value is
                                                        required.</span
                                                    >
                                                </div>
                                            </div>
                                            <div class="mb-3">
                                                <label for="type">Type </label>
                                                <b-form-select
                                                    class="
                                                        form-select
                                                        
                                                    "
                                                    v-model="form.type"
                                                    size="sm"
                                                    :options="indicatorTypes"
                                                    :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form.type.$error,
                                                    }"
                                                ></b-form-select>
                                                <!-- <input
                                                    autocomplete="off"
                                                    id="type"
                                                    type="text"
                                                    v-model="form.type"
                                                    placeholder="Enter Type..."
                                                    class="form-control"
                                                    :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form.type.$error,
                                                    }"
                                                /> -->
                                                <div
                                                    v-if="
                                                        submitted &&
                                                        $v.form.type.$error
                                                    "
                                                    class="invalid-feedback"
                                                >
                                                    <span
                                                        v-if="
                                                            !$v.form.type
                                                                .required
                                                        "
                                                        >This value is
                                                        required.</span
                                                    >
                                                </div>
                                            </div>
                                            <div
                                                class="mb-3"
                                                v-if="form.id > 0"
                                            >
                                                <label for="prioritizationType"
                                                    >Prioritization Type
                                                </label>
                                                <b-form-select
                                                    class="
                                                        form-select
                                                        
                                                    "
                                                    v-model="
                                                        form.prioritizationType
                                                    "
                                                    size="sm"
                                                    :options="priorityTypes"
                                                    :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form
                                                                .prioritizationType
                                                                .$error,
                                                    }"
                                                ></b-form-select>
                                                <!-- <input
                                                    autocomplete="off"
                                                    id="prioritizationType"
                                                    type="text"
                                                    v-model="
                                                        form.prioritizationType
                                                    "
                                                    placeholder="Enter Prioritization Type..."
                                                    class="form-control"
                                                    :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form
                                                                .prioritizationType
                                                                .$error,
                                                    }"
                                                /> -->
                                                <div
                                                    v-if="
                                                        submitted &&
                                                        $v.form
                                                            .prioritizationType
                                                            .$error
                                                    "
                                                    class="invalid-feedback"
                                                >
                                                    <span
                                                        v-if="
                                                            !$v.form
                                                                .prioritizationType
                                                                .required
                                                        "
                                                        >This value is
                                                        required.</span
                                                    >
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div
                                                class="mb-3"
                                                v-if="form.id == 0"
                                            >
                                                <label for="prioritizationType"
                                                    >Prioritization Type
                                                </label>
                                                <b-form-select
                                                    class="
                                                        form-select
                                                        
                                                    "
                                                    v-model="
                                                        form.prioritizationType
                                                    "
                                                    size="sm"
                                                    :options="priorityTypes"
                                                    :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form
                                                                .prioritizationType
                                                                .$error,
                                                    }"
                                                ></b-form-select>
                                                <!-- <input
                                                    autocomplete="off"
                                                    id="prioritizationType"
                                                    type="text"
                                                    v-model="
                                                        form.prioritizationType
                                                    "
                                                    placeholder="Enter Prioritization Type..."
                                                    class="form-control"
                                                    :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form
                                                                .prioritizationType
                                                                .$error,
                                                    }"
                                                /> -->
                                                <div
                                                    v-if="
                                                        submitted &&
                                                        $v.form
                                                            .prioritizationType
                                                            .$error
                                                    "
                                                    class="invalid-feedback"
                                                >
                                                    <span
                                                        v-if="
                                                            !$v.form
                                                                .prioritizationType
                                                                .required
                                                        "
                                                        >This value is
                                                        required.</span
                                                    >
                                                </div>
                                            </div>
                                            <div
                                                class="mb-3"
                                                v-if="form.id > 0"
                                            >
                                                <label for="finalRemarks"
                                                    >Final Remarks
                                                </label>
                                                <input
                                                    autocomplete="off"
                                                    id="finalRemarks"
                                                    type="text"
                                                    v-model="form.finalRemarks"
                                                    placeholder="Enter Final Remarks..."
                                                    class="form-control"
                                                />
                                            </div>
                                            <div class="mb-3">
                                                <label for="yearToBeComplied"
                                                    >Year to be complied
                                                </label>
                                                <masked-input
                                                    autocomplete="off"
                                                    id="yearToBeComplied"
                                                    type="text"
                                                    v-model="
                                                        form.yearToBeComplied
                                                    "
                                                    placeholder="Enter Year to be complied..."
                                                    class="form-control"
                                                    :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form
                                                                .yearToBeComplied
                                                                .$error,
                                                    }"
                                                    :mask="currencyMask"
                                                ></masked-input>
                                                <div
                                                    v-if="
                                                        submitted &&
                                                        $v.form.yearToBeComplied
                                                            .$error
                                                    "
                                                    class="invalid-feedback"
                                                >
                                                    <span
                                                        v-if="
                                                            !$v.form
                                                                .yearToBeComplied
                                                                .required
                                                        "
                                                        >This value is
                                                        required.</span
                                                    >
                                                </div>
                                            </div>
                                            <div class="mb-3">
                                                <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    id="isPercentage"
                                                    v-model="form.isPercentage"
                                                />&nbsp;&nbsp;
                                                <label
                                                    class="form-check-label"
                                                    for="isPercentage"
                                                    >Is Percentage?</label
                                                >
                                            </div>
                                            <div
                                                class="mb-3"
                                                v-if="form.id > 0"
                                            >
                                                <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    id="isCompleted"
                                                    v-model="form.isCompleted"
                                                />&nbsp;&nbsp;
                                                <label
                                                    class="form-check-label"
                                                    for="isCompleted"
                                                    >Is Completed?</label
                                                >
                                            </div>
                                            <div class="mb-3">
                                                <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    id="isRecurring"
                                                    v-model="form.isRecurring"
                                                />&nbsp;&nbsp;
                                                <label
                                                    class="form-check-label"
                                                    for="isRecurring"
                                                    >Is Recurring?</label
                                                >
                                            </div>
                                        </div>
                                    </div>
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
                                class="datatables draggable-table"
                                ref="table"
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
                                v-sortable="sortableOptions"
                            >
                                <template #cell(actions)="row">
                                    <div
                                        class="
                                            float-end
                                            d-flex
                                            align-items-center
                                        "
                                    >
                                        <!-- <b-form-checkbox
                                            v-model="row.detailsShowing"
                                            @change="row.toggleDetails"
                                        >
                                            View Details
                                        </b-form-checkbox> -->
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
                                                @click="
                                                    viewTargets(row.item.id)
                                                "
                                                variant="secondary"
                                                ><i
                                                    class="
                                                        mdi mdi-view-list
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >View Targets</b-dropdown-item
                                            >
                                            <b-dropdown-item
                                                @click="row.toggleDetails"
                                                variant="secondary"
                                                ><i
                                                    class="
                                                        bx bx-menu-alt-right
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
                                                variant="secondary"
                                                ><i
                                                    class="
                                                        mdi mdi-update
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >Edit</b-dropdown-item
                                            >
                                            <b-dropdown-item
                                                @click="deleteItem(row)"
                                                variant="danger"
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
                                </template>
                                <template #row-details="row">
                                    <b-card>
                                        <b-row>
                                            <b-col sm="6">
                                                <b-row class="mb-2">
                                                    <b-col
                                                        sm="4"
                                                        class="text-right"
                                                        ><b>Sequence:</b></b-col
                                                    >
                                                    <b-col>{{
                                                        row.item.sequence
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
                                                            .indicatorItemName
                                                    }}</b-col>
                                                </b-row>
                                                <b-row class="mb-2">
                                                    <b-col
                                                        sm="4"
                                                        class="text-right"
                                                        ><b>Type:</b></b-col
                                                    >
                                                    <b-col>{{
                                                        row.item.type
                                                    }}</b-col>
                                                </b-row>
                                                <b-row class="mb-2">
                                                    <b-col
                                                        sm="4"
                                                        class="text-right"
                                                        ><b
                                                            >Prioritazation
                                                            Type:</b
                                                        ></b-col
                                                    >
                                                    <b-col>{{
                                                        row.item
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
                                                            .yearToBeComplied
                                                    }}</b-col>
                                                </b-row>
                                            </b-col>
                                            <b-col sm="6">
                                                <b-row class="mb-2">
                                                    <b-col
                                                        sm="4"
                                                        class="text-right"
                                                        ><b
                                                            >Final Remarks:</b
                                                        ></b-col
                                                    >
                                                    <b-col>{{
                                                        row.item.finalRemarks
                                                    }}</b-col>
                                                </b-row>
                                                <b-row class="mb-2">
                                                    <b-col
                                                        sm="4"
                                                        class="text-right"
                                                        ><b
                                                            >Is Percentage ?:</b
                                                        ></b-col
                                                    >
                                                    <b-col>{{
                                                        row.item.isPercentage
                                                            ? "Yes"
                                                            : "No"
                                                    }}</b-col>
                                                </b-row>
                                                <b-row class="mb-2">
                                                    <b-col
                                                        sm="4"
                                                        class="text-right"
                                                        ><b
                                                            >Is Completed ?:</b
                                                        ></b-col
                                                    >
                                                    <b-col>{{
                                                        row.item.isCompleted
                                                            ? "Yes"
                                                            : "No"
                                                    }}</b-col>
                                                </b-row>
                                                <b-row class="mb-2">
                                                    <b-col
                                                        sm="4"
                                                        class="text-right"
                                                        ><b
                                                            >Is Recurring ?:</b
                                                        ></b-col
                                                    >
                                                    <b-col>{{
                                                        row.item.isRecurring
                                                            ? "Yes"
                                                            : "No"
                                                    }}</b-col>
                                                </b-row>
                                            </b-col>
                                        </b-row>
                                    </b-card>
                                </template>
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
                            </b-table>
                        </div>
                        <div class="row">
                            <div class="col d-flex" v-if="tableUpdate">
                                <button
                                    type="button"
                                    @click="cancelSequence()"
                                    class="
                                        btn btn-sm btn-link
                                        d-flex
                                        align-items-center
                                        me-1
                                    "
                                >
                                    <i class="bx bx-x fs-6"></i>Cancel
                                </button>
                                <button
                                    type="button"
                                    @click="updateSequence()"
                                    class="
                                        btn btn-sm btn-success
                                        d-flex
                                        align-items-center
                                    "
                                >
                                    <i class="bx bx-check fs-6"></i>Update
                                    Sequence
                                </button>
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
    </Layout>
</template>
<style>
.datatables.draggable-table .table {
    cursor: grab;
}
.custom-control.custom-checkbox label {
    margin-bottom: 0 !important;
}
</style>