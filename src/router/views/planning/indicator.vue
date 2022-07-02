<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import Multiselect from "vue-multiselect";
import Sortable from "sortablejs";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";
import ApiClassification from "@/components/modals/api-classification.vue";

const createSortable = (el, options) => {
    return Sortable.create(el, {
        ...options,
    });
};
const sortable = {
    name: "sortable",
    bind(el, binding, vnode) {
        const table = el.querySelector(".draggable-card");
        table._sortable = createSortable(
            table.querySelector(".card-mover"),
            binding.value,
            vnode
        );
    },
};

export default {
    directives: { sortable },
    page: {
        title: "KPI List",
    },
    components: {
        Layout,
        PageHeader,
        Multiselect,
        MaskedInput,
        ApiClassification,
    },
    data() {
        let self = this;
        return {
            title: "KPI List",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "KPI List",
                    active: true,
                },
            ],
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: false,
                allowDecimal: true,
            }),
            tableData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [10, 25, 50, 100],
            filter: null,
            filterOn: [],
            sortBy: "indicatorName",
            sortDesc: false,
            fields: [
                {
                    key: "item",
                    label: "",
                    thStyle: { width: "20px" },
                },
                {
                    key: "prexc.prexcName",
                    sortable: true,
                    label: "Prexc Name",
                },
                {
                    key: "indicatorName",
                    sortable: true,
                    label: "Indicator Groups & Goals",
                    thStyle: { width: "45%" },
                },
                {
                    key: "actions",
                    thStyle: { width: "10%" },
                },
            ],
            form: {
                id: 0,
                indicatorName: "",
                prexcId: null,
            },
            indexSelected: -1,
            tableBusy: false,
            prexcs: [],

            // indicator item
            seqArray: [],
            sortableOptions: {
                animation: 150,
                onEnd: function (evt) {
                    var list = evt.from.querySelectorAll(".card");
                    var sequence = 1;
                    var newIndex = [];
                    list.forEach(function (item) {
                        var detail = item.getAttribute("id").split("-");
                        var id = detail[0];
                        var text = cloneDeep(detail[1]);
                        item.querySelector("h3").innerText =
                            text + " to " + sequence;
                        newIndex.push({ sequence: sequence, id: id });
                        sequence++;
                    });
                    self.seqArray = newIndex;
                },
            },
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
            indicatorForm: {
                id: 0,
                indicatorItemName: "",
                type: "",
                indicatorItemClassificationId: "",
                finalRemarks: "",
                indicatorId: this.$route.params.id,
                sequence: 0,
                isPercentage: false,
                yearToBeComplied: "",
                isCompleted: false,
                isRecurring: false,
                points: '0'
            },
            apiClassification: "",
            indicatorItemClassification: {}
        };
    },
    validations: {
        form: {
            indicatorName: { required },
            prexc: { required },
        },
        indicatorForm: {
            indicatorItemName: { required },
            type: { required },
            indicatorItemClassificationId: { required },
            yearToBeComplied: { required },
            points: { required },
        },
    },
    computed: {
        rows() {
            if (this.filter) {
                return this.totalRows;
            }
            return this.tableData.length;
        },
    },
    created() {
        this.totalRows = this.items.length;
        this.tableBusy = true;
        this.$store
            .dispatch("indicator/GetIndicator")
            .then((res) => {
                this.tableBusy = false;
                res.data.forEach((item) => {
                    item.rotateChevy = false;
                    item.showDetails = false;
                    item.updateSequence = false;
                    item.indicatorItems
                        .sort((a, b) => a.sequence - b.sequence)
                        .forEach((x) => {
                            x.visible = false;
                        });
                });
                this.tableData = res.data;
            })
            .catch(() => {
                this.tableBusy = false;
                this.showToast("Something went wrong!","error");
            });
        this.$store
            .dispatch("prexc/GetPrexc")
            .then((res) => {
                this.prexcs = res.data;
            })
            .catch(() => {
                this.showToast("Something went wrong!","error");
            });
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addFC() {
            this.onReset();
            this.modalTitle = "Create New Indicator";
            this.$bvModal.show("modal-standard");
        },
        onCreate() {
            this.submitted = true;
            this.$v.form.$touch();
            if (this.$v.form.$invalid) {
                return;
            } else {
                if (this.form.id > 0) {
                    this.$store
                        .dispatch("indicator/UpdateIndicator", this.form)
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
                    this.$store
                        .dispatch("indicator/CreateIndicator", this.form)
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
                indicatorName: "",
                prexcId: null,
            };
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.indexSelected = this.tableData.indexOf(props.item);
            this.modalTitle = "Update Indicator";
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
                        .dispatch("indicator/DeleteIndicator", props.item.id)
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
        selectPrexc(value) {
            this.form.prexcId = value.id;
        },
        viewItem(id) {
            this.$router.push(`/planning/indicator-item/${id}`);
        },
        showDtls(row) {
            row.item.rotateChevy = !row.item.rotateChevy;
            // if (row.item.showDetails) {
                row.item.showDetails = !row.item.showDetails;
            //     setTimeout(() => {
                    row.toggleDetails();
            //     }, 600);
            // } else {
            //     row.toggleDetails();
            //     setTimeout(() => {
            //         row.item.showDetails = !row.item.showDetails;
            //     }, 50);
            // }
        },
        toggleSequence(row) {
            var sequence = cloneDeep(row.updateSequence);
            this.tableData.forEach((item) => (item.updateSequence = false));
            if (!sequence) {
                this.seqArray = [];
            }
            row.updateSequence = !sequence;
        },
        viewTargets(id) {
            this.$router.push(`/planning/target/${id}`);
        },
        onResetIndicatorItem() {
            this.indicatorForm = {
                id: 0,
                indicatorItemName: "",
                type: "",
                indicatorItemClassificationId: "",
                finalRemarks: "",
                sequence: 0,
                isPercentage: false,
                yearToBeComplied: "",
                isCompleted: false,
                isRecurring: false,
                points: '0'
            };
            this.indicatorItemClassification = {}
        },
        addIndicatorItem(row) {
            this.onResetIndicatorItem();
            this.indexSelected = this.tableData.findIndex(
                (x) => x.id == row.id
            );
            this.modalTitle = "Create New Indicator Item";
            this.$bvModal.show("indicator-item-modal");
        },
        async onCreateIndicatorItem() {
            this.submitted = true;
            this.$v.indicatorForm.$touch();
            if (this.$v.indicatorForm.$invalid) {
                return;
            }
            var data = cloneDeep(this.indicatorForm);
            if (this.indicatorForm.id > 0) {
                var yIndex = this.tableData[
                    this.indexSelected
                ].indicatorItems.findIndex(
                    (x) => x.id == this.indicatorForm.id
                );
                await this.$store
                    .dispatch(
                        "indicatoritem/UpdateIndicatorItem",
                        this.indicatorForm
                    )
                    .then((res) => {
                        if(res.data.error){
                            return this.showToast(res.data.errorMessage,'warning');
                        }
                        this.indicatorForm.indicatorItemClassification = this.indicatorItemClassification;
                        this.tableData[this.indexSelected].indicatorItems.splice(
                            yIndex,
                            1,
                            this.indicatorForm
                        );
                        this.$bvModal.hide("indicator-item-modal");
                        this.showToast("Successfully updated!","success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong!","error");
                    });
            } else {
                data.sequence =
                    this.tableData[this.indexSelected].indicatorItems
                        .length + 1;
                data.indicatorId =
                    this.tableData[this.indexSelected].id;
                data.visible = false;
                await this.$store
                    .dispatch(
                        "indicatoritem/CreateIndicatorItem",
                        data
                    )
                    .then((res) => {
                        if(res.data.error){
                            return this.showToast(res.data.errorMessage,'warning');
                        }
                        data.id = res.data.id;
                        data.indicatorItemClassification = this.indicatorItemClassification;
                        this.tableData[
                            this.indexSelected
                        ].indicatorItems.push(data);
                        this.$bvModal.hide("indicator-item-modal");
                        this.showToast("Successfully created!","success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong!","error");
                    });
            }
            this.submitted = false;
        },
        updateIndicatorItem(props) {
            this.indicatorForm = cloneDeep(props);
            this.indicatorForm.yearToBeComplied =
                this.indicatorForm.yearToBeComplied.toString();
            this.indicatorItemClassification = props.indicatorItemClassification
            this.indicatorForm.points = props.points.toString();
            this.indexSelected = this.tableData.findIndex(
                (x) => x.id == props.indicatorId
            );
            this.modalTitle = "Update Indicator Item";
            this.$bvModal.show("indicator-item-modal");
        },
        deleteIndicatorItem(props) {
            var xIndex = this.tableData.findIndex(
                (x) => x.id == props.indicatorId
            );
            var yIndex = this.tableData[xIndex].indicatorItems.findIndex(
                (x) => x.id == props.id
            );
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
                        .dispatch("indicatoritem/DeleteIndicatorItem", props.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.tableData[xIndex].indicatorItems.splice(
                                    yIndex,
                                    1
                                );
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        updateSequence(row) {
            this.$store
                .dispatch(
                    "indicatoritem/UpdateIndicatorItemSequence",
                    this.seqArray
                )
                .then((res) => {
                    if (res) {
                        var xIndex = this.tableData.findIndex(
                            (x) => x.id == row.id
                        );
                        this.seqArray.forEach((item) => {
                            var data = this.tableData[
                                xIndex
                            ].indicatorItems.find((y) => y.id == item.id);
                            data.sequence = item.sequence;
                        });
                        this.tableData[xIndex].indicatorItems.sort(
                            (a, b) => a.sequence - b.sequence
                        );
                        row.updateSequence = false;
                        this.showToast("Successfully updated sequence!","success");
                    }
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                });
        },
        getApiClass() {
            this.$bvModal.show("api-classification-modal");
        },
        dropClass(data) {
            this.indicatorItemClassification = data;
            this.indicatorForm.indicatorItemClassificationId = data.id;
        },
    },
};
</script>

<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="indicator-item-modal"
            :title="modalTitle"
            size="lg"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreateIndicatorItem"
                class="needs-validation"
                ref="fcForm"
            >
                <div class="row">
                    <div class="col-6">
                        <div class="mb-3">
                            <label for="indicatorItemName">Item Name </label>
                            <textarea
                                id="indicatorItemName"
                                rows="3"
                                v-model="indicatorForm.indicatorItemName"
                                placeholder="Enter Item Name..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.indicatorForm.indicatorItemName
                                            .$error,
                                }"
                            ></textarea>
                            <div
                                v-if="
                                    submitted &&
                                    $v.indicatorForm.indicatorItemName.$error
                                "
                                class="invalid-feedback"
                            >
                                <span
                                    v-if="
                                        !$v.indicatorForm.indicatorItemName
                                            .required
                                    "
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="type">Type </label>
                            <b-form-select
                                class="form-select"
                                v-model="indicatorForm.type"
                                size="sm"
                                :options="indicatorTypes"
                                :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.indicatorForm.type.$error,
                                }"
                            ></b-form-select>
                            <div
                                v-if="submitted && $v.indicatorForm.type.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.indicatorForm.type.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="points"
                                >Points
                            </label>
                            <masked-input
                                autocomplete="off"
                                id="points"
                                type="text"
                                v-model="indicatorForm.points"
                                placeholder="Enter Points..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.indicatorForm.points
                                            .$error,
                                }"
                                :mask="currencyMask"
                            ></masked-input>
                            <div
                                v-if="
                                    submitted &&
                                    $v.indicatorForm.points.$error
                                "
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.indicatorForm.points.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="mb-3">
                            <label
                                for="indicatorItemClassificationId"
                                >Indicator Item
                                Classification
                            </label>
                            <b-input-group>
                                <template
                                    #append
                                >
                                    <b-button
                                        @click="
                                            getApiClass
                                        "
                                        variant="outline-info"
                                        ><i
                                            class="
                                                mdi
                                                mdi-clipboard-text-search-outline
                                            "
                                        ></i
                                    ></b-button>
                                </template>
                                <input
                                    autocomplete="off"
                                    type="text"
                                    disabled
                                    placeholder="Search Indicator Item Classification..."
                                    class="
                                        form-control
                                    "
                                    :class="{
                                        'is-invalid':
                                            submitted &&
                                            $v
                                                .indicatorForm
                                                .indicatorItemClassificationId
                                                .$error,
                                    }"
                                    v-model="
                                        indicatorItemClassification.classification
                                    "
                                />
                            </b-input-group>
                            <div
                                v-if="
                                    submitted &&
                                    $v.indicatorForm
                                        .indicatorItemClassificationId
                                        .$error
                                "
                                class="
                                    invalid-feedback
                                "
                            >
                                <span
                                    v-if="
                                        !$v.indicatorForm
                                            .indicatorItemClassificationId
                                            .required
                                    "
                                    >This value
                                    is
                                    required.</span
                                >
                            </div>
                        </div>
                        <div class="mb-3" v-if="indicatorForm.id > 0">
                            <label for="finalRemarks">Final Remarks </label>
                            <input
                                autocomplete="off"
                                id="finalRemarks"
                                type="text"
                                v-model="indicatorForm.finalRemarks"
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
                                v-model="indicatorForm.yearToBeComplied"
                                placeholder="Enter Year to be complied..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted &&
                                        $v.indicatorForm.yearToBeComplied
                                            .$error,
                                }"
                                :mask="currencyMask"
                            ></masked-input>
                            <div
                                v-if="
                                    submitted &&
                                    $v.indicatorForm.yearToBeComplied.$error
                                "
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.indicatorForm.yearToBeComplied.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div class="d-flex mb-3">
                            <div class="me-3">
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    id="isPercentage"
                                    v-model="indicatorForm.isPercentage"
                                />&nbsp;&nbsp;
                                <label class="form-check-label" for="isPercentage"
                                    >Percentage</label
                                >
                            </div>
                            <div class="me-3" v-if="indicatorForm.id > 0">
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    id="isCompleted"
                                    v-model="indicatorForm.isCompleted"
                                />&nbsp;&nbsp;
                                <label class="form-check-label" for="isCompleted"
                                    >Completed</label
                                >
                            </div>
                            <div>
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    id="isRecurring"
                                    v-model="indicatorForm.isRecurring"
                                />&nbsp;&nbsp;
                                <label class="form-check-label" for="isRecurring"
                                    >Recurring</label
                                >
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Save changes
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="$bvModal.hide('indicator-item-modal')"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <div class="row mb-5">
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
                            <h4 class="card-title m-0">
                                Indicator Groups & Goals
                            </h4>
                            <button
                                type="button"
                                @click="addFC()"
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
                                size="md"
                                title-class="font-18"
                                hide-footer
                                no-close-on-backdrop
                            >
                                <form
                                    @submit.prevent="onCreate"
                                    class="needs-validation"
                                    ref="fcForm"
                                >
                                    <div class="mb-3">
                                        <label for="indicatorName"
                                            >Indicator Group & Goals
                                        </label>
                                        <textarea
                                            id="indicatorName"
                                            rows="5"
                                            type="text"
                                            v-model="form.indicatorName"
                                            placeholder="Enter Indicator Group & Goals..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.indicatorName
                                                        .$error,
                                            }"
                                        ></textarea>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.indicatorName.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.indicatorName
                                                        .required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="prexcId">Prexc </label>
                                        <multiselect
                                            v-model="form.prexc"
                                            :options="prexcs"
                                            label="prexcName"
                                            @select="selectPrexc"
                                            track-by="id"
                                            value="id"
                                            deselect-label=""
                                            select-label=""
                                            :allow-empty="false"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.prexc.$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.prexc.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span v-if="!$v.form.prexc.required"
                                                >This value is required.</span
                                            >
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
                                class="datatables"
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
                                <template #cell(item)="row">
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
                                                'rotate-90':
                                                    row.item.rotateChevy,
                                            }"
                                        ></i>
                                    </div>
                                </template>
                                <template #cell(actions)="row">
                                    <div class="float-end">
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
                                                variant="dark"
                                                ><i
                                                    class="
                                                        mdi mdi-view-list
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >{{ row.item.rotateChevy ? 'Hide' : 'Show'}}
                                                Indicators</b-dropdown-item
                                            >
                                            <b-dropdown-item
                                                @click="updateItem(row)"
                                                variant="dark"
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
                                    <transition name="max-height">
                                        <b-card
                                            no-body
                                            class="p-3 mb-5"
                                            v-if="row.item.showDetails"
                                        >
                                            <div class="row mb-2">
                                                <div class="col-md-6">
                                                    <h5 class="mb-0">
                                                        List of Indicator Items
                                                    </h5>
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                        "
                                                    >
                                                        <small class="me-1"
                                                            ><a
                                                                href="javascript:void(0);"
                                                                @click="
                                                                    toggleSequence(
                                                                        row.item
                                                                    )
                                                                "
                                                                >{{
                                                                    row.item
                                                                        .updateSequence
                                                                        ? "Cancel Updating Sequence"
                                                                        : "Update Sequence"
                                                                }}</a
                                                            ></small
                                                        >
                                                        <div
                                                            v-if="
                                                                row.item
                                                                    .updateSequence
                                                            "
                                                        >
                                                            |
                                                        </div>
                                                        <small
                                                            v-if="
                                                                row.item
                                                                    .updateSequence
                                                            "
                                                            class="glow ms-1"
                                                            >You can start
                                                            dragging the
                                                            cards.</small
                                                        >
                                                    </div>
                                                </div>
                                                <div
                                                    class="col-md-6 text-right"
                                                >
                                                    <b-button
                                                        @click="
                                                            addIndicatorItem(
                                                                row.item
                                                            )
                                                        "
                                                        variant="primary"
                                                        size="sm"
                                                        class="me-3"
                                                    >
                                                    <i class="bx bx-plus"></i>
                                                    Add Indicator Item</b-button>
                                                    <a
                                                        href="javascript:void(0);"
                                                        @click="showDtls(row)"
                                                        class="
                                                            text-dark
                                                            font-size-16
                                                        "
                                                        ><i class="bx bx-x"></i
                                                    ></a>
                                                </div>
                                            </div>
                                            <div
                                                class="row"
                                                v-if="row.item.updateSequence"
                                            >
                                                <div
                                                    class="col-md-12"
                                                    v-sortable="sortableOptions"
                                                >
                                                    <div class="draggable-card">
                                                        <div class="card-mover">
                                                            <b-card
                                                                no-body
                                                                class="
                                                                    mb-1
                                                                    shadow-none
                                                                "
                                                                v-for="x in row
                                                                    .item
                                                                    .indicatorItems"
                                                                :key="x.id"
                                                                :id="`${x.id}-${x.sequence}`"
                                                            >
                                                                <b-card-header
                                                                    header-tag="header"
                                                                    role="tab"
                                                                    class="
                                                                        border
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            justify-content-between
                                                                            align-items-center
                                                                        "
                                                                    >
                                                                        <div
                                                                            class="
                                                                                d-flex
                                                                                align-items-center
                                                                            "
                                                                        >
                                                                            <div
                                                                                class="
                                                                                    bg-purple
                                                                                    text-center
                                                                                    me-2
                                                                                    py-1
                                                                                    position-relative
                                                                                    px-2
                                                                                "
                                                                            >
                                                                                <h3
                                                                                    class="
                                                                                        mb-0
                                                                                        position-relative
                                                                                        no-wrap
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        x.sequence
                                                                                    }}
                                                                                </h3>
                                                                            </div>
                                                                            <div
                                                                                class="
                                                                                    text-muted
                                                                                "
                                                                            >
                                                                                <h5
                                                                                    class="
                                                                                        mb-0
                                                                                    "
                                                                                >
                                                                                    {{
                                                                                        x.indicatorItemName
                                                                                    }}
                                                                                </h5>
                                                                                <div
                                                                                    style="
                                                                                        line-height: 0.8;
                                                                                    "
                                                                                >
                                                                                    <small
                                                                                        >{{
                                                                                            x.type
                                                                                        }}</small
                                                                                    >
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </b-card-header>
                                                            </b-card>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-12 mt-2">
                                                    <div
                                                        class="
                                                            d-flex
                                                            justify-content-end
                                                        "
                                                    >
                                                        <button
                                                            type="button"
                                                            @click="
                                                                updateSequence(
                                                                    row.item
                                                                )
                                                            "
                                                            class="
                                                                btn
                                                                btn-sm
                                                                btn-success
                                                                d-flex
                                                                align-items-center
                                                            "
                                                        >
                                                            <i
                                                                class="
                                                                    bx bx-check
                                                                    fs-6
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Update Sequence
                                                        </button>
                                                        <button
                                                            type="button"
                                                            @click="
                                                                toggleSequence(
                                                                    row.item
                                                                )
                                                            "
                                                            class="
                                                                btn btn-sm
                                                                d-flex
                                                                align-items-center
                                                                me-1
                                                            "
                                                        >
                                                            <i
                                                                class="
                                                                    bx bx-x
                                                                    fs-6
                                                                "
                                                            ></i
                                                            >Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-else>
                                                <b-card
                                                    no-body
                                                    class="mb-1 shadow-none"
                                                    v-for="(x, index) in row
                                                        .item.indicatorItems"
                                                    :key="x.id"
                                                    :style="{
                                                        'z-index':
                                                            row.item
                                                                .indicatorItems
                                                                .length - index,
                                                    }"
                                                >
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
                                                                class="
                                                                    d-flex
                                                                    align-items-center
                                                                "
                                                            >
                                                                <div
                                                                    style="
                                                                        min-width: 30px;
                                                                    "
                                                                    class="
                                                                        bg-success
                                                                        bg-gradient
                                                                        text-center
                                                                        me-2
                                                                        py-1
                                                                        position-relative
                                                                    "
                                                                >
                                                                    <h3
                                                                        class="
                                                                            mb-0
                                                                            position-relative
                                                                        "
                                                                    >
                                                                        {{
                                                                            index +
                                                                            1
                                                                        }}
                                                                    </h3>
                                                                </div>
                                                                <div
                                                                    class="
                                                                        text-muted
                                                                    "
                                                                >
                                                                    <h5
                                                                        class="
                                                                            mb-0
                                                                        "
                                                                    >
                                                                        {{
                                                                            x.indicatorItemName
                                                                        }}
                                                                    </h5>
                                                                    <div>
                                                                        <small
                                                                            class="
                                                                                d-flex
                                                                                align-items-center
                                                                            "
                                                                            >{{
                                                                                x.type
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
                                                                                    x.visible =
                                                                                        !x.visible
                                                                                "
                                                                            >
                                                                                {{
                                                                                    x.visible
                                                                                        ? "Hide"
                                                                                        : "Show"
                                                                                }}
                                                                                Details
                                                                                <i
                                                                                    class="
                                                                                        bx
                                                                                        bx-chevron-right
                                                                                        rotate
                                                                                        font-size-14
                                                                                    "
                                                                                    :class="{
                                                                                        'rotate-90':
                                                                                            x.visible,
                                                                                    }"
                                                                                ></i>
                                                                            </a>
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
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
                                                                    <template
                                                                        #button-content
                                                                    >
                                                                        <i
                                                                            class="
                                                                                fas
                                                                                fa-ellipsis-v
                                                                            "
                                                                        ></i>
                                                                    </template>
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            viewTargets(
                                                                                x.id
                                                                            )
                                                                        "
                                                                        variant="dark"
                                                                        ><i
                                                                            class="
                                                                                mdi
                                                                                mdi-view-list
                                                                                font-size-18
                                                                                me-1
                                                                            "
                                                                        ></i
                                                                        >View
                                                                        Targets</b-dropdown-item
                                                                    >
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            updateIndicatorItem(
                                                                                x
                                                                            )
                                                                        "
                                                                        variant="dark"
                                                                        ><i
                                                                            class="
                                                                                mdi
                                                                                mdi-update
                                                                                font-size-18
                                                                                me-1
                                                                            "
                                                                        ></i
                                                                        >Edit</b-dropdown-item
                                                                    >
                                                                    <b-dropdown-item
                                                                        @click="
                                                                            deleteIndicatorItem(
                                                                                x
                                                                            )
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
                                                        </div>
                                                    </b-card-header>
                                                    <b-collapse
                                                        :visible="x.visible"
                                                        :accordion="`detail-accordion-${x.id}`"
                                                        role="tabpanel"
                                                    >
                                                        <b-card-body
                                                            class="border"
                                                        >
                                                            <div
                                                                class="
                                                                    d-flex
                                                                    align-items-center
                                                                    mb-1
                                                                "
                                                            >
                                                                <span class="d-flex align-items-center border p-1 me-2">
                                                                    <i class="bx font-size-18 font-weight-bolder" :class="{'bx-check text-success': x.isPercentage, 'bx-x text-danger': !x.isPercentage}"></i>
                                                                    <div>Percentage</div>
                                                                </span>
                                                                <span class="d-flex align-items-center border p-1 me-2">
                                                                    <i class="bx font-size-18 font-weight-bolder" :class="{'bx-check text-success': x.isCompleted, 'bx-x text-danger': !x.isCompleted}"></i>
                                                                    <div>Completed</div>
                                                                </span>
                                                                <span class="d-flex align-items-center border p-1 me-1">
                                                                    <i class="bx font-size-18 font-weight-bolder" :class="{'bx-check text-success': x.isRecurring, 'bx-x text-danger': !x.isRecurring}"></i>
                                                                    <div>Recurring</div>
                                                                </span>
                                                            </div>
                                                            <b-row
                                                                class="
                                                                    mb-2
                                                                "
                                                            >
                                                                <b-col
                                                                    sm="12"
                                                                >
                                                                    <b
                                                                        class="
                                                                            me-1
                                                                        "
                                                                    >
                                                                        Indicator Item Classification:</b
                                                                    >
                                                                    <u
                                                                        >{{
                                                                            x.indicatorItemClassification.classification
                                                                        }}</u
                                                                    >
                                                                </b-col>
                                                            </b-row>
                                                            <b-row
                                                                class="
                                                                    mb-2
                                                                "
                                                            >
                                                                <b-col
                                                                    sm="12"
                                                                >
                                                                    <b
                                                                        class="
                                                                            me-1
                                                                        "
                                                                        >Year
                                                                        to
                                                                        be
                                                                        complied:</b
                                                                    >
                                                                    <u
                                                                        >{{
                                                                            x.yearToBeComplied
                                                                        }}</u
                                                                    >
                                                                </b-col>
                                                                <b-col></b-col>
                                                            </b-row>
                                                            <b-row
                                                                class="
                                                                    mb-2
                                                                "
                                                            >
                                                                <b-col
                                                                    sm="12"
                                                                >
                                                                    <b
                                                                        class="
                                                                            me-1
                                                                        "
                                                                        >Final
                                                                        Remarks:</b
                                                                    >
                                                                <u>{{
                                                                    x.finalRemarks
                                                                }}</u>
                                                                </b-col>
                                                            </b-row>
                                                        </b-card-body>
                                                    </b-collapse>
                                                </b-card>
                                            </div>
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
        <api-classification @dropData="dropClass($event)"></api-classification>
    </Layout>
</template>