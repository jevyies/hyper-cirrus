<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import BeneficiaryModal from "@/components/modals/beneficiary";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";

export default {
    page: {
        title: "Extension Activity",
    },
    components: {
        Layout,
        PageHeader,
        DatePicker,
        BeneficiaryModal,
        MaskedInput,
    },
    data() {
        return {
            title: "Extension Activity",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Extension Activity",
                    active: true,
                },
            ],
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: false,
            }),
            tableData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [10, 25, 50, 100],
            filter: null,
            filterOn: [],
            sortBy: "activityName",
            sortDesc: false,
            fields: [
                {
                    key: "activityName",
                    sortable: true,
                },
                {
                    key: "activityDescription",
                    sortable: true,
                    label: "Description",
                },
                {
                    key: "activityDuration",
                    sortable: true,
                    label: "Duration",
                },
                {
                    key: "actions",
                },
            ],
            form: {
                id: 0,
                activityName: "",
                activityDescription: "",
                activityDuration: "",
                totalParticipants: "",
                totalSurveyed: "",
                quality1P: "",
                quality2F: "",
                quality3S: "",
                quality4Vs: "",
                quality5E: "",
                isTraining: true,
                dateFrom: "",
                dateTo: "",
                beneficiaryId: "",
                deliveryUnitId: "",
                deliveryUnit: "",
                lengthOfTraining: "",
                extensionProgramId: this.$route.params.id,
            },
            beneficiaryName: "",
            indexSelected: -1,
            tableBusy: false,
            agencies: [],
            offices: [],
            campuses: [],
            dus: [],
            activities: {}
        };
    },
    validations: {
        form: {
            activityName: { required },
            activityDescription: { required },
            activityDuration: { required },
            totalParticipants: { required },
            totalSurveyed: { required },
            quality1P: { required },
            quality2F: { required },
            quality3S: { required },
            quality4Vs: { required },
            quality5E: { required },
            dateFrom: { required },
            dateTo: { required },
            beneficiaryId: { required },
            deliveryUnitId: { required },
            agency: { required },
            office: { required },
            campus: { required },
            lengthOfTraining: { required },
        },
    },
    computed: {
        rows() {
            return this.tableData.length;
        },
    },
    async created() {
        this.totalRows = this.items.length;
        this.tableBusy = true;
        this.$store
            .dispatch(
                "extensionactivity/GetExtensionActivityByEP",
                this.$route.params.id
            )
            .then((res) => {
                this.tableBusy = false;
                res.data.forEach(async (item) => {
                    item.fromDisplay = this.formatDate(new Date(item.dateFrom));
                    item.toDisplay = this.formatDate(new Date(item.dateTo));
                });
                console.log(res.data)
                this.tableData = res.data;
            })
            .catch(() => {
                this.tableBusy = false;
                this.showToast("Something went wrong!","error");
            });
        this.$store.dispatch("agency/GetAgency").then((res) => {
            var agencies = [{ value: 0, text: "" }];
            res.data.forEach(function (item) {
                agencies.push({ value: item.id, text: item.agencyShortName });
            });
            this.agencies = agencies;
        });
        const activities = await this.$store.dispatch(
            "extensionprogram/GetSingleExtensionProgram",
            this.$route.params.id
        );
        this.title = activities.data.extensionName + " Activities";
        this.activities = activities.data;
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addEP() {
            this.onReset();
            this.modalTitle = "Create New Extension Activity";
            this.$bvModal.show("modal-standard");
        },
        onCreate() {
            this.submitted = true;
            this.$v.$touch();
            var data = cloneDeep(this.form);
            data.dateFrom = this.getDate(this.form.dateFrom);
            data.dateTo = this.getDate(this.form.dateTo);
            if (this.$v.$invalid) {
                return;
            } else {
                if (this.form.id > 0) {
                    this.$store
                        .dispatch(
                            "extensionactivity/UpdateExtensionActivity",
                            data
                        )
                        .then((res) => {
                            res.data.fromDisplay = this.formatDate(
                                this.form.dateFrom
                            );
                            res.data.toDisplay = this.formatDate(
                                this.form.dateTo
                            );
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
                        .dispatch(
                            "extensionactivity/CreateExtensionActivity",
                            data
                        )
                        .then((res) => {
                            res.data.fromDisplay = this.formatDate(
                                this.form.dateFrom
                            );
                            res.data.toDisplay = this.formatDate(
                                this.form.dateTo
                            );
                            var deliveryUnit = {
                                office: {
                                    campusId: this.form.campus,
                                    campus: {
                                        agencyId: this.form.agency,
                                    },
                                },
                                officeId: this.form.office,
                            };
                            res.data.deliveryUnit = deliveryUnit;
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
                activityName: this.activities.extensionName,
                activityDescription: "",
                activityDuration: "",
                totalParticipants: "",
                totalSurveyed: "",
                quality1P: "",
                quality2F: "",
                quality3S: "",
                quality4Vs: "",
                quality5E: "",
                isTraining: true,
                dateFrom: new Date(this.activities.dateFrom),
                dateTo: new Date(this.activities.dateTo),
                beneficiaryId: "",
                deliveryUnitId: "",
                deliveryUnit: "",
                extensionProgramId: this.$route.params.id,
            };
            this.beneficiaryName = ''
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.form.quality1P = props.item.quality1P.toString();
            this.form.quality2F = props.item.quality2F.toString();
            this.form.quality3S = props.item.quality3S.toString();
            this.form.quality4Vs = props.item.quality4Vs.toString();
            this.form.quality5E = props.item.quality5E.toString();
            this.form.activityDuration = props.item.activityDuration.toString();
            this.form.totalParticipants =
                props.item.totalParticipants.toString();
            this.form.totalSurveyed = props.item.totalSurveyed.toString();
            this.form.lengthOfTraining = props.item.lengthOfTraining.toString();
            this.form.dateFrom = new Date(props.item.dateFrom);
            this.form.dateTo = new Date(props.item.dateTo);
            this.form.agency = props.item.deliveryUnit.office.campus.agencyId;
            this.changeAgency();
            this.form.campus = props.item.deliveryUnit.office.campusId;
            this.changeCampus();
            this.form.office = props.item.deliveryUnit.officeId;
            this.changeOffice();
            this.beneficiaryName = props.item.beneficiary.beneficiaryName;
            this.indexSelected = this.tableData.indexOf(props.item);
            this.modalTitle = "Update Extension Activity";
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
            }).then(async (result) => {
                if (result.value) {
                    await this.$store
                        .dispatch(
                            "extensionactivity/DeleteExtensionActivity",
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
        changeAgency() {
            this.$store
                .dispatch("campus/GetCampusByAgency", this.form.agency)
                .then((res) => {
                    var campuses = [{ value: 0, text: "" }];
                    res.data.forEach(function (item) {
                        campuses.push({ value: item.id, text: item.shortName });
                    });
                    this.campuses = campuses;
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                });
        },
        changeCampus() {
            this.$store
                .dispatch("office/GetOfficeByCampus", this.form.campus)
                .then((res) => {
                    var offices = [{ value: 0, text: "" }];
                    res.data.forEach(function (item) {
                        offices.push({ value: item.id, text: item.shortName });
                    });
                    this.offices = offices;
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                });
        },
        changeOffice() {
            this.$store
                .dispatch(
                    "deliveryunit/GetDeliveryUnitByOffice",
                    this.form.office
                )
                .then((res) => {
                    if (res.data) {
                        var dus = [{ value: 0, text: "" }];
                        res.data.forEach(function (item) {
                            dus.push({ value: item.id, text: item.shortName });
                        });
                        this.dus = dus;
                        // this.form.deliveryUnitId = res.data.id;
                        // this.form.deliveryUnit = res.data.name;
                    } else {
                        this.dus = [];
                    }
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                });
        },
        getBeneficiary() {
            this.$bvModal.show("beneficiary-modal");
        },
        dropData(data) {
            var modalData = cloneDeep(data);
            this.beneficiaryName = modalData.beneficiaryName;
            this.form.beneficiaryId = modalData.id;
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
                                @click="addEP()"
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
                                size="xl"
                                title-class="font-18"
                                hide-footer
                                no-close-on-backdrop
                            >
                                <form
                                    @submit.prevent="onCreate"
                                    class="needs-validation"
                                    ref="fcForm"
                                >
                                    <div class="mb-3 row">
                                        <b-col sm="3">
                                            <label for="activityName"
                                                >Title of Training
                                            </label>
                                            <textarea
                                                autocomplete="off"
                                                id="activityName"
                                                rows="4"
                                                v-model="form.activityName"
                                                placeholder="Enter Title of Training..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.activityName
                                                            .$error,
                                                }"
                                            ></textarea>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.activityName.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.activityName
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col sm="6">
                                            <label for="activityDescription">
                                                Proof of Training
                                            </label>
                                            <textarea
                                                autocomplete="off"
                                                id="activityDescription"
                                                rows="4"
                                                v-model="
                                                    form.activityDescription
                                                "
                                                placeholder="Enter Activity Proof of Training..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form
                                                            .activityDescription
                                                            .$error,
                                                }"
                                            ></textarea>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.activityDescription
                                                        .$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form
                                                            .activityDescription
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col sm="3">
                                            <div class="mb-1">
                                                <label for="totalParticipants" class="mb-0"
                                                    >No. of Trainees
                                                </label>
                                                <masked-input
                                                    autocomplete="off"
                                                    id="totalParticipants"
                                                    type="text"
                                                    v-model="form.totalParticipants"
                                                    placeholder="Enter No. of Trainees..."
                                                    class="form-control"
                                                    :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form
                                                                .totalParticipants
                                                                .$error,
                                                    }"
                                                    :mask="currencyMask"
                                                ></masked-input>
                                                <div
                                                    v-if="
                                                        submitted &&
                                                        $v.form.totalParticipants
                                                            .$error
                                                    "
                                                    class="invalid-feedback"
                                                >
                                                    <span
                                                        v-if="
                                                            !$v.form
                                                                .totalParticipants
                                                                .required
                                                        "
                                                        >This value is
                                                        required.</span
                                                    >
                                                </div>
                                            </div>
                                            <div>
                                                <label for="totalSurveyed" class="mb-0"
                                                    >No. of Trainees Surveyed
                                                </label>
                                                <masked-input
                                                    autocomplete="off"
                                                    id="totalSurveyed"
                                                    type="text"
                                                    v-model="form.totalSurveyed"
                                                    placeholder="Enter No. of Trainees Surveyed..."
                                                    class="form-control"
                                                    :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form.totalSurveyed
                                                                .$error,
                                                    }"
                                                    :mask="currencyMask"
                                                ></masked-input>
                                                <div
                                                    v-if="
                                                        submitted &&
                                                        $v.form.totalSurveyed.$error
                                                    "
                                                    class="invalid-feedback"
                                                >
                                                    <span
                                                        v-if="
                                                            !$v.form.totalSurveyed
                                                                .required
                                                        "
                                                        >This value is
                                                        required.</span
                                                    >
                                                </div>
                                            </div>
                                        </b-col>
                                    </div>
                                    <div class="mb-3 row">
                                        <b-col sm="3">
                                            <label for="activityDuration">
                                                Duration
                                            </label>
                                            <masked-input
                                                autocomplete="off"
                                                id="activityDuration"
                                                type="text"
                                                v-model="form.activityDuration"
                                                placeholder="Enter Activity Duration..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.activityDuration
                                                            .$error,
                                                }"
                                                :mask="currencyMask"
                                            ></masked-input>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.activityDuration
                                                        .$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form
                                                            .activityDuration
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col sm="3">
                                            <label for="lengthOfTraining">
                                                Length of Training
                                            </label>
                                            <masked-input
                                                autocomplete="off"
                                                id="lengthOfTraining"
                                                type="text"
                                                v-model="form.lengthOfTraining"
                                                placeholder="Enter Length of Training..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.lengthOfTraining
                                                            .$error,
                                                }"
                                                :mask="currencyMask"
                                            ></masked-input>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.lengthOfTraining
                                                        .$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form
                                                            .lengthOfTraining
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col sm="3">
                                            <label for="dateFrom">From </label>
                                            <date-picker
                                                v-model="form.dateFrom"
                                                :first-day-of-week="1"
                                                lang="en"
                                                placeholder="Enter Date From..."
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.dateFrom.$error,
                                                }"
                                            ></date-picker>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.dateFrom.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.dateFrom
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col sm="3">
                                            <label for="dateTo">To </label>
                                            <date-picker
                                                v-model="form.dateTo"
                                                :first-day-of-week="1"
                                                lang="en"
                                                placeholder="Enter Date To..."
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.dateTo.$error,
                                                }"
                                            ></date-picker>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.dateTo.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.dateTo.required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                    </div>
                                    <div class="mb-2 row">
                                        <b-col sm="3">
                                            <label for="prexcClass"
                                                >Agency
                                            </label>
                                            <b-form-select
                                                class="
                                                    form-select 
                                                "
                                                v-model="form.agency"
                                                size="sm"
                                                :options="agencies"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.agency.$error,
                                                }"
                                                @change="changeAgency"
                                            ></b-form-select>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.agency.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.agency.required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col sm="3">
                                            <label for="prexcClass"
                                                >Campus
                                            </label>
                                            <b-form-select
                                                class="
                                                    form-select 
                                                "
                                                v-model="form.campus"
                                                size="sm"
                                                :options="campuses"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.campus.$error,
                                                }"
                                                @change="changeCampus"
                                            ></b-form-select>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.campus.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.campus.required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col sm="3">
                                            <label for="prexcClass"
                                                >Office
                                            </label>
                                            <b-form-select
                                                class="
                                                    form-select 
                                                "
                                                v-model="form.office"
                                                size="sm"
                                                :options="offices"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.office.$error,
                                                }"
                                                @change="changeOffice"
                                            ></b-form-select>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.office.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.office.required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col sm="3">
                                            <label for="prexcClass"
                                                >Delivery Unit
                                            </label>
                                            <!-- <input
                                                autocomplete="off"
                                                id="DU"
                                                type="text"
                                                v-model="form.deliveryUnit"
                                                placeholder="Delivery Unit..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.deliveryUnitId
                                                            .$error,
                                                }"
                                                disabled
                                            /> -->
                                            <b-form-select
                                                class="
                                                    form-select 
                                                "
                                                v-model="form.deliveryUnitId"
                                                size="sm"
                                                :options="dus"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.deliveryUnitId
                                                            .$error,
                                                }"
                                            ></b-form-select>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.deliveryUnitId
                                                        .$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.deliveryUnitId
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                    </div>
                                    <div class="mb-2 row">
                                        <b-col sm="3">
                                            <label for="quality1P"
                                                >Quality 1P
                                            </label>
                                            <masked-input
                                                autocomplete="off"
                                                id="quality1P"
                                                type="text"
                                                v-model="form.quality1P"
                                                placeholder="Enter Quality 1P..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.quality1P
                                                            .$error,
                                                }"
                                                :mask="currencyMask"
                                            ></masked-input>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.quality1P.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.quality1P
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col sm="3">
                                            <label for="quality2F"
                                                >Quality 2F
                                            </label>
                                            <masked-input
                                                autocomplete="off"
                                                id="quality2F"
                                                type="text"
                                                v-model="form.quality2F"
                                                placeholder="Enter Quality 1P..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.quality2F
                                                            .$error,
                                                }"
                                                :mask="currencyMask"
                                            ></masked-input>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.quality2F.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.quality2F
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col sm="3">
                                            <label for="quality3S"
                                                >Quality 3S
                                            </label>
                                            <masked-input
                                                autocomplete="off"
                                                id="quality3S"
                                                type="text"
                                                v-model="form.quality3S"
                                                placeholder="Enter Quality 1P..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.quality3S
                                                            .$error,
                                                }"
                                                :mask="currencyMask"
                                            ></masked-input>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.quality3S.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.quality3S
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col sm="3">
                                            <label for="quality4Vs"
                                                >Quality 4Vs
                                            </label>
                                            <masked-input
                                                autocomplete="off"
                                                id="quality4Vs"
                                                type="text"
                                                v-model="form.quality4Vs"
                                                placeholder="Enter Quality 4Vs..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.quality4Vs
                                                            .$error,
                                                }"
                                                :mask="currencyMask"
                                            ></masked-input>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.quality4Vs.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.quality4Vs
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                    </div>
                                    <div class="row mb-2">
                                        <b-col sm="3">
                                            <label for="quality5E"
                                                >Quality 5E
                                            </label>
                                            <masked-input
                                                autocomplete="off"
                                                id="quality5E"
                                                type="text"
                                                v-model="form.quality5E"
                                                placeholder="Enter Quality 5E..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.quality5E
                                                            .$error,
                                                }"
                                                :mask="currencyMask"
                                            ></masked-input>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.quality5E.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.quality5E
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col sm="9">
                                            <label for="beneficiaryId"
                                                >Beneficiary
                                            </label>
                                            <b-input-group>
                                                <template #append>
                                                    <b-button
                                                        @click="getBeneficiary"
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
                                                    placeholder="Search Beneficiary..."
                                                    class="form-control"
                                                    :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form
                                                                .beneficiaryId
                                                                .$error,
                                                    }"
                                                    v-model="beneficiaryName"
                                                />
                                            </b-input-group>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.beneficiaryId.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.beneficiaryId
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </b-col>
                                    </div>
                                    <div class="row mt-2">
                                        <div class="col">
                                            <input
                                                autocomplete="off"
                                                class="form-check-input"
                                                type="checkbox"
                                                id="isTraining"
                                                v-model="form.isTraining"
                                            />&nbsp;&nbsp;
                                            <label
                                                class="form-check-label"
                                                for="isTraining"
                                                >Is Training?</label
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
        <beneficiary-modal v-on:dropData="dropData($event)"></beneficiary-modal>
    </Layout>
</template>