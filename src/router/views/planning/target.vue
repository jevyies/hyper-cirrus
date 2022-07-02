<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required, numeric } from "vuelidate/lib/validators";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";
import Multiselect from "vue-multiselect";

export default {
    page: {
        title: "Target",
    },
    components: {
        Layout,
        PageHeader,
        MaskedInput,
        Multiselect,
    },
    data() {
        return {
            title: "Target",
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
                    text: "Target",
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
            sortBy: "id",
            sortDesc: false,
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: false,
                allowDecimal: true,
            }),
            fields: [
                {
                    key: "displayDetails",
                    sortable: false,
                    label: " ",
                    thStyle: { width: "30px" },
                },
                {
                    key: "officeName",
                    sortable: true,
                    label: "Office",
                    thStyle: { width: "240px" },
                },
                {
                    key: "remarks",
                    sortable: true,
                    label: "Target Description",
                },
                {
                    key: "finalRemarks",
                    sortable: true,
                    label: 'Final Remarks/Catchup Plans'
                },
                {
                    key: "actions",
                    thStyle: { width: "100px" },
                },
            ],
            form: {
                id: 0,
                q1: "",
                q2: "",
                q3: "",
                q4: "",
                cycle: 0,
                indicatorItemId: this.$route.params.id,
                remarks: "",
                finalRemarks: "",
                agency: "",
                office: "",
                deliveryUnit: "",
                priorityApi: "",
                points: "0",
            },
            indexSelected: -1,
            indicatorItem: {},
            tableBusy: false,
            agencies: [],
            offices: [],
            campuses: [],
            dus: [],
            deliveryUnits: [],
            deliveryUnit: {},
            mandatoryApis: [],
            priorityApis: [],
            priorityApi: {},
        };
    },
    validations: {
        form: {
            cycle: { required },
            q1: { required, numeric },
            q2: { required, numeric },
            q3: { required, numeric },
            q4: { required, numeric },
            agency: { required },
            campus: { required },
            office: { required },
            deliveryUnitId: { required },
            points: { required },
        },
    },
    computed: {
        rows() {
            return this.tableData.length;
        },
    },
    created() {
        this.tableBusy = true;
        this.totalRows = this.items.length;
        this.$store
            .dispatch(
                "indicatoritem/GetSingleIndicatorItem",
                this.$route.params.id
            )
            .then((res) => {
                this.indicatorItem = res.data;
                this.title = `${res.data.indicatorItemName} - Targets`;
            })
            .catch(() => {
                this.showToast("Something went wrong!","error");
            });
        this.$store
            .dispatch(
                "apitemplate/GetPriorityApiTemplate"
            )
            .then((res) => {
                this.mandatoryApis = res.data
            })
            .catch(() => {
                this.showToast("Something went wrong!","error");
            });
        this.$store.dispatch("agency/GetAgency").then((res) => {
            var agencies = [{ value: 0, text: "" }];
            res.data.forEach(function (item) {
                agencies.push({ value: item.id, text: item.agencyShortName });
            });
            this.agencies = agencies;
        });
        this.changeCycle(this.$store.state.data.cycle);
    },
    methods: {
        changeCycle(cycle) {
            this.$store
                .dispatch("target/GetTargetByIndicator", {
                    id: this.$route.params.id,
                    cycle: cycle,
                })
                .then((res) => {
                    res.data.forEach((item) => {
                        if (item.indicatorItem.isPercentage) {
                            item.q1Display = item.q1 + "%";
                            item.q2Display = item.q2 + "%";
                            item.q3Display = item.q3 + "%";
                            item.q4Display = item.q4 + "%";
                        } else {
                            item.q1Display = item.q1;
                            item.q2Display = item.q2;
                            item.q3Display = item.q3;
                            item.q4Display = item.q4;
                        }
                        item.rotateChevy = false;
                        item.showDetails = false;
                        item.officeName = item.deliveryUnit.name;
                    });
                    this.tableData = res.data;
                    this.tableBusy = false;
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                    this.tableBusy = false;
                });
        },
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addTarget() {
            this.onReset();
            this.modalTitle = "Create New Target";
            this.$bvModal.show("modal-standard");
        },
        onCreate() {
            if (this.form.id == 0) {
                this.form.deliveryUnitId = [];
                this.deliveryUnits.forEach((item) => {
                    this.form.deliveryUnitId.push(item.id);
                });
                this.form.priorityApi = [];
                this.priorityApis.forEach((item) => {
                    this.form.priorityApi.push(item.id);
                });
            }
            this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
                return;
            } else {
                if (this.form.id > 0) {
                    var data = cloneDeep(this.form);
                    data.deliveryUnitId = this.form.deliveryUnitId[0];
                    this.$store
                        .dispatch(`target/UpdateTarget`, data)
                        .then((res) => {
                            if (res.data.indicatorItem.isPercentage) {
                                res.data.q1Display = res.data.q1 + "%";
                                res.data.q2Display = res.data.q2 + "%";
                                res.data.q3Display = res.data.q3 + "%";
                                res.data.q4Display = res.data.q4 + "%";
                            } else {
                                res.data.q1Display = res.data.q1;
                                res.data.q2Display = res.data.q2;
                                res.data.q3Display = res.data.q3;
                                res.data.q4Display = res.data.q4;
                            }
                            res.data.officeName = this.deliveryUnit.name;
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
                    this.form.indicatorItem = cloneDeep(this.indicatorItem);
                    this.$store
                        .dispatch(`target/CreateTarget`, this.form)
                        .then(async (res) => {
                            // var dataPush = cloneDeep(this.form);
                            // this.deliveryUnits.forEach((item) => {
                            //     if (this.form.indicatorItem.isPercentage) {
                            //         dataPush.q1Display = this.form.q1 + "%";
                            //         dataPush.q2Display = this.form.q2 + "%";
                            //         dataPush.q3Display = this.form.q3 + "%";
                            //         dataPush.q4Display = this.form.q4 + "%";
                            //     } else {
                            //         dataPush.q1Display = this.form.q1;
                            //         dataPush.q2Display = this.form.q2;
                            //         dataPush.q3Display = this.form.q3;
                            //         dataPush.q4Display = this.form.q4;
                            //     }
                            //     this.tableData.push({
                            //         ...dataPush,
                            //         officeName: item.name,
                            //         deliveryUnit: item,
                            //         status: "Pending",
                            //     });
                            // });
                            await this.changeCycle(this.$store.state.data.cycle);
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
                q1: "",
                q2: "",
                q3: "",
                q4: "",
                cycle: this.$store.state.data.cycle,
                indicatorItemId: this.$route.params.id,
                remarks: "",
                finalRemarks: "",
                agency: this.$store.state.data.agency.id,
                campus: "",
                office: "",
                points: "0",
                deliveryUnitId: [],
            };
            this.changeAgency()
            this.deliveryUnit = {};
            this.deliveryUnits = []
        },
        updateItem(props) {
            var item = cloneDeep(props.item);
            console.log(item);
            this.form = {
                id: item.id,
                indicatorItemId: item.indicatorItemId,
                cycle: item.cycle,
                q1: item.q1.toString(),
                q2: item.q2.toString(),
                q3: item.q3.toString(),
                q4: item.q4.toString(),
                points: item.points.toString(),
                remarks: item.remarks,
                finalRemarks: item.finalRemarks,
            };
            this.form.agency = item.deliveryUnit.office.campus.agencyId;
            this.changeAgency();
            this.form.campus = item.deliveryUnit.office.campusId;
            this.changeCampus();
            this.form.office = item.deliveryUnit.officeId;
            this.changeOffice();
            this.deliveryUnit = item.deliveryUnit;
            this.priorityApi = item.priorityApi;
            this.form.deliveryUnitId = item.deliveryUnit.id;
            this.indexSelected = this.tableData.indexOf(props.item);
            this.modalTitle = "Update Target";
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
                        .dispatch(`target/DeleteTarget`, props.item.id)
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
        postTarget(props) {
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
                        .dispatch("target/PostTarget", props.item.id)
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
        viewAPI(id) {
            this.$router.push(`/planning/api/${id}`);
        },
        changeAgency() {
            this.$store
                .dispatch("campus/GetCampusByAgency", this.form.agency)
                .then((res) => {
                    var campuses = [{ value: 0, text: "" }];
                    res.data.forEach(function (item) {
                        campuses.push({ value: item.id, text: item.campusName });
                    });
                    this.campuses = campuses;
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                });
        },
        changeCampus() {
            this.offices = [];
            this.$store
                .dispatch("office/GetOfficeByCampus", this.form.campus)
                .then((res) => {
                    var offices = [{ value: 0, text: "" }];
                    res.data.forEach(function (item) {
                        offices.push({ value: item.id, text: item.name });
                    });
                    this.offices = offices;
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                });
        },
        changeOffice() {
            this.form.deliveryUnit = "";
            this.dus = [];
            this.$store
                .dispatch(
                    "deliveryunit/GetDeliveryUnitByOffice",
                    this.form.office
                )
                .then((res) => {
                    this.dus = res.data;
                })
                .catch(() => {
                    this.showToast("Something went wrong!","error");
                });
        },
        selectDU(value) {
            this.form.deliveryUnitId = [value.id];
        },
        selectApi(value) {
            this.form.priorityApi = [value.id];
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
                    row.item.showDetails = !row.item.showDetails;
                }, 50);
            }
        },
    },
};
</script>

<template>
    <Layout @changeCycle="changeCycle">
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
                                @click="addTarget()"
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
                                        <label for="remarks"
                                            >Target Description
                                        </label>
                                        <textarea
                                            autocomplete="off"
                                            id="remarks"
                                            rows="3"
                                            v-model="form.remarks"
                                            placeholder="Enter Target Description..."
                                            class="form-control"
                                        ></textarea>
                                    </div>
                                    <div class="mb-3" v-if="form.id > 0">
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
                                    <div class="row mb-3">
                                        <div class="col-6">
                                            <label for="q1">Quarter 1 </label>
                                            <masked-input
                                                autocomplete="off"
                                                id="q1"
                                                type="text"
                                                v-model="form.q1"
                                                placeholder="Enter Quarter 1..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.q1.$error,
                                                }"
                                                :mask="currencyMask"
                                            ></masked-input>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.q1.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="!$v.form.q1.required"
                                                    >This value is
                                                    required.</span
                                                >
                                                <span v-if="!$v.form.q1.numeric"
                                                    >This value should be a
                                                    valid number.</span
                                                >
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <label for="q2">Quarter 2 </label>
                                            <masked-input
                                                autocomplete="off"
                                                id="q2"
                                                type="text"
                                                v-model="form.q2"
                                                placeholder="Enter Quarter 2..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.q2.$error,
                                                }"
                                                :mask="currencyMask"
                                            ></masked-input>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.q2.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="!$v.form.q2.required"
                                                    >This value is
                                                    required.</span
                                                >
                                                <span v-if="!$v.form.q2.numeric"
                                                    >This value should be a
                                                    valid number.</span
                                                >
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-6">
                                            <label for="q3">Quarter 3 </label>
                                            <masked-input
                                                autocomplete="off"
                                                id="q3"
                                                type="text"
                                                v-model="form.q3"
                                                placeholder="Enter Quarter 3..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.q3.$error,
                                                }"
                                                :mask="currencyMask"
                                            ></masked-input>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.q3.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="!$v.form.q3.required"
                                                    >This value is
                                                    required.</span
                                                >
                                                <span v-if="!$v.form.q3.numeric"
                                                    >This value should be a
                                                    valid number.</span
                                                >
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <label for="q4">Quarter 4 </label>
                                            <masked-input
                                                autocomplete="off"
                                                id="q4"
                                                type="text"
                                                v-model="form.q4"
                                                placeholder="Enter Quarter 4..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.q4.$error,
                                                }"
                                                :mask="currencyMask"
                                            ></masked-input>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.q4.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="!$v.form.q4.required"
                                                    >This value is
                                                    required.</span
                                                >
                                                <span v-if="!$v.form.q4.numeric"
                                                    >This value should be a
                                                    valid number.</span
                                                >
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mb-3" v-if="form.id > 0">
                                        <label for="points">Points </label>
                                        <masked-input
                                            autocomplete="off"
                                            id="points"
                                            type="text"
                                            v-model="form.points"
                                            placeholder="Enter Points..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.points.$error,
                                            }"
                                            :mask="currencyMask"
                                        ></masked-input>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.points.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="!$v.form.points.required"
                                                >This value is
                                                required.</span
                                            >
                                            <span v-if="!$v.form.points.numeric"
                                                >This value should be a
                                                valid number.</span
                                            >
                                        </div>
                                    </div>
                                    <b-row class="mb-3">
                                        <!-- <b-col sm="6">
                                            <label for="prexcClass"
                                                >Agency
                                            </label>
                                            <b-form-select
                                                class="form-select"
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
                                        </b-col> -->
                                        <b-col sm="12">
                                            <label for="prexcClass"
                                                >Campus
                                            </label>
                                            <b-form-select
                                                class="form-select"
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
                                    </b-row>
                                    <div class="mb-3">
                                        <label for="prexcClass">Office </label>
                                        <b-form-select
                                            class="form-select"
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
                                                v-if="!$v.form.office.required"
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="deliveryUnit"
                                            >Delivery Unit
                                        </label>
                                        <multiselect
                                            v-if="form.id > 0"
                                            v-model="deliveryUnit"
                                            :options="dus"
                                            label="name"
                                            @select="selectDU"
                                            track-by="id"
                                            value="id"
                                            :allow-empty="false"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.deliveryUnitId
                                                        .$error,
                                            }"
                                        />
                                        <multiselect
                                            v-if="!form.id > 0"
                                            v-model="deliveryUnits"
                                            :options="dus"
                                            label="name"
                                            track-by="id"
                                            value="id"
                                            :multiple="true"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.deliveryUnitId
                                                        .$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.deliveryUnitId.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.deliveryUnitId
                                                        .required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3" v-if="form.id == 0">
                                        <label for="priorityApi"
                                            >Mandatory API/s
                                        </label>
                                        <!-- <multiselect
                                            v-if="form.id > 0"
                                            v-model="priorityApi"
                                            :options="mandatoryApis"
                                            label="name"
                                            @select="selectApi"
                                            track-by="id"
                                            value="id"
                                            :allow-empty="true"
                                        /> -->
                                        <multiselect
                                            v-if="!form.id > 0"
                                            v-model="priorityApis"
                                            :options="mandatoryApis"
                                            label="name"
                                            track-by="id"
                                            value="id"
                                            :multiple="true"
                                        />
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
                                <template #cell(office)="row">
                                    <div>{{ row.item.deliveryUnit.name }}</div>
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
                                                v-if="
                                                    row.item.status !== 'Posted'
                                                "
                                                @click="postTarget(row)"
                                                variant="success"
                                                ><i
                                                    class="
                                                        bx bx-check
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >Post Target</b-dropdown-item
                                            >
                                            <b-dropdown-item
                                                @click="viewAPI(row.item.id)"
                                                variant="dark"
                                                ><i
                                                    class="
                                                        bx bx-detail
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >View APIs</b-dropdown-item
                                            >
                                            <b-dropdown-item
                                                @click="updateItem(row)"
                                                variant="dark"
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
                                <template #cell(displayDetails)="row">
                                    <div
                                        class="
                                            d-flex
                                            align-items-center
                                            justify-content-center
                                        "
                                        @click="showDtls(row)"
                                    >
                                        <i class="bx bx-chevron-right rotate font-size-16 cursor-pointer" :class="{'rotate-90': row.item.rotateChevy}"></i>
                                    </div>
                                </template>
                                <template #cell(finalRemarks)="row">
                                    <div>{{row.value}}</div>
                                    <hr v-if="row.item.isCatchup && row.value">
                                    <div v-if="row.item.isCatchup">
                                        {{row.item.catchUpPlans}}
                                    </div>
                                </template>
                                <template #row-details="row">
                                    <transition name="max-height">
                                        <div class="row" v-if="row.item.showDetails">
                                            <div class="col-md-3">
                                                <div class="card">
                                                    <div class="card-header">
                                                        <h5 class="card-title mb-0">
                                                            Quarter 1
                                                        </h5>
                                                    </div>
                                                    <div class="card-body">
                                                        <div>
                                                            Target:
                                                            {{
                                                                row.item
                                                                    .indicatorItem
                                                                    .isPercentage
                                                                    ? row.item.q1 +
                                                                    "%"
                                                                    : row.item.q1
                                                            }}
                                                        </div>
                                                        <div
                                                            v-if="!row.item.actual"
                                                        >
                                                            Actual: N/A
                                                        </div>
                                                        <div v-if="row.item.actual">
                                                            Actual:
                                                            {{
                                                                row.item
                                                                    .indicatorItem
                                                                    .isPercentage
                                                                    ? row.item
                                                                        .actual[0]
                                                                        .q1 + "%"
                                                                    : row.item
                                                                        .actual[0]
                                                                        .q1
                                                            }}
                                                        </div>
                                                        <div>
                                                            Remarks:
                                                            {{
                                                                row.item.actual
                                                                    ? row.item
                                                                        .actual[0]
                                                                        .q1Remarks
                                                                    : "N/A"
                                                            }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="card">
                                                    <div class="card-header">
                                                        <h5 class="card-title mb-0">
                                                            Quarter 2
                                                        </h5>
                                                    </div>
                                                    <div class="card-body">
                                                        <div>
                                                            Target:
                                                            {{
                                                                row.item
                                                                    .indicatorItem
                                                                    .isPercentage
                                                                    ? row.item.q2 +
                                                                    "%"
                                                                    : row.item.q2
                                                            }}
                                                        </div>
                                                        <div
                                                            v-if="!row.item.actual"
                                                        >
                                                            Actual: N/A
                                                        </div>
                                                        <div v-if="row.item.actual">
                                                            Actual:
                                                            {{
                                                                row.item
                                                                    .indicatorItem
                                                                    .isPercentage
                                                                    ? row.item
                                                                        .actual[0]
                                                                        .q2 + "%"
                                                                    : row.item
                                                                        .actual[0]
                                                                        .q2
                                                            }}
                                                        </div>
                                                        <div>
                                                            Remarks:
                                                            {{
                                                                row.item.actual
                                                                    ? row.item
                                                                        .actual[0]
                                                                        .q2Remarks
                                                                    : "N/A"
                                                            }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="card">
                                                    <div class="card-header">
                                                        <h5 class="card-title mb-0">
                                                            Quarter 3
                                                        </h5>
                                                    </div>
                                                    <div class="card-body">
                                                        <div>
                                                            Target:
                                                            {{
                                                                row.item
                                                                    .indicatorItem
                                                                    .isPercentage
                                                                    ? row.item.q3 +
                                                                    "%"
                                                                    : row.item.q3
                                                            }}
                                                        </div>
                                                        <div
                                                            v-if="!row.item.actual"
                                                        >
                                                            Actual: N/A
                                                        </div>
                                                        <div v-if="row.item.actual">
                                                            Actual:
                                                            {{
                                                                row.item
                                                                    .indicatorItem
                                                                    .isPercentage
                                                                    ? row.item
                                                                        .actual[0]
                                                                        .q3 + "%"
                                                                    : row.item
                                                                        .actual[0]
                                                                        .q3
                                                            }}
                                                        </div>
                                                        <div>
                                                            Remarks:
                                                            {{
                                                                row.item.actual
                                                                    ? row.item
                                                                        .actual[0]
                                                                        .q3Remarks
                                                                    : "N/A"
                                                            }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="card">
                                                    <div class="card-header">
                                                        <h5 class="card-title mb-0">
                                                            Quarter 4
                                                        </h5>
                                                    </div>
                                                    <div class="card-body">
                                                        <div>
                                                            Target:
                                                            {{
                                                                row.item
                                                                    .indicatorItem
                                                                    .isPercentage
                                                                    ? row.item.q4 +
                                                                    "%"
                                                                    : row.item.q4
                                                            }}
                                                        </div>
                                                        <div
                                                            v-if="!row.item.actual"
                                                        >
                                                            Actual: N/A
                                                        </div>
                                                        <div v-if="row.item.actual">
                                                            Actual:
                                                            {{
                                                                row.item
                                                                    .indicatorItem
                                                                    .isPercentage
                                                                    ? row.item
                                                                        .actual[0]
                                                                        .q4 + "%"
                                                                    : row.item
                                                                        .actual[0]
                                                                        .q4
                                                            }}
                                                        </div>
                                                        <div>
                                                            Remarks:
                                                            {{
                                                                row.item.actual
                                                                    ? row.item
                                                                        .actual[0]
                                                                        .q4Remarks
                                                                    : "N/A"
                                                            }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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
    </Layout>
</template>
<style>
hr {
    margin: 0.5em 0;
}
</style>