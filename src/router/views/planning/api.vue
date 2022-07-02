<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required, numeric } from "vuelidate/lib/validators";
import ApiType from "@/components/modals/api-type.vue";
import DatePicker from "vue2-datepicker";

export default {
    page: {
        title: "API",
    },
    components: {
        Layout,
        PageHeader,
        ApiType,
        DatePicker,
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
                    text: "Indicator",
                    href: "/planning/indicator",
                },
                {
                    text: "Target",
                    href: "/planning/target/",
                },
                {
                    text: "API",
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
            sortBy: "name",
            sortDesc: false,
            fields: [
                {
                    key: "name",
                    sortable: true,
                },
                {
                    key: "description",
                    sortable: true,
                },
                {
                    key: "score",
                    sortable: true,
                    thStyle: { width: "10%" },
                },
                {
                    key: "status",
                    sortable: true,
                    thStyle: { width: "10%" },
                },
                {
                    key: "actions",
                    thStyle: { width: "8%" },
                },
            ],
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
            indexSelected: -1,
            tableBusy: false,
            cycles: [],
            apiType: "",
            cycle: "",
        };
    },
    validations: {
        form: {
            name: { required },
            description: { required },
            apiTypeId: { required },
            scoreEfficiency: { required, numeric },
            scoreQuality: { required, numeric },
            scoreTimeliness: { required, numeric },
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
        this.tableBusy = true;
        this.$store
            .dispatch("api/GetApiByTarget", this.$route.params.id)
            .then((res) => {
                this.tableBusy = false;
                this.tableData = res.data;
            })
            .catch(() => {
                this.tableBusy = false;
                this.showToast("Something went wrong!","error");
            });
        var cycles = [{ text: "", value: 0 }];
        this.$store
            .dispatch("cycle/GetAllCycle")
            .then((res) => {
                res.data.forEach((item) => {
                    cycles.push({ value: item.year, text: item.year });
                });
                this.cycles = cycles;
            })
            .catch(() => {
                this.showToast("Something went wrong!","error");
            });
        this.$store
            .dispatch("target/GetSingleTarget", this.$route.params.id)
            .then((res) => {
                this.items[2].href += res.data.indicatorItemId;
                this.cycle = res.data.cycle;
                this.title = `${res.data.cycle} API`;
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
            this.modalTitle = "Create New API";
            this.$bvModal.show("modal-standard");
        },
        onCreate() {
            this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
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
                            this.tableData.splice(
                                this.indexSelected,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("modal-standard");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch(() => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch("api/CreateApi", data)
                        .then((res) => {
                            this.tableData.push(res.data);
                            this.$bvModal.hide("modal-standard");
                            this.showToast("Successfully created!","success");
                        })
                        .catch(() => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        onReset() {
            this.form = {
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
            };
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.form.dateCompleted = new Date(props.item.dateCompleted);
            this.apiType = props.item.apiType.type;
            this.indexSelected = this.tableData.indexOf(props.item);
            this.modalTitle = "Update API";
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
                        .dispatch("api/DeleteApi", props.item.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.tableData.splice(index, 1);
                                this.showToast("Successfully deleted!","success");
                            }
                        })
                        .catch(() => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        getApiType() {
            this.$bvModal.show("api-type-modal");
        },
        dropType(data) {
            this.apiType = data.type;
            this.form.apiTypeId = data.id;
        },
        markAsApproved(row){
            Swal.fire({
                title: "Are you sure?",
                text: "You want to approve this Work?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#34c38f",
                cancelButtonColor: "#f46a6a",
                confirmButtonText: "Yes, approve it!",
            }).then((result) => {
                if (result.isConfirmed) {
                    this.$store
                        .dispatch(
                            "api/ApproveApi",
                            row.id
                        )
                        .then((res) => {
                            row.status = 'Approved';
                            this.showToast("Successfully approved!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
            });
        }
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
                            <h4 class="card-title m-0">API List</h4>
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
                                    <label for="scoreEfficiency">Score </label>
                                    <b-row class="mb-3">
                                        <b-col>
                                            <input
                                                autocomplete="off"
                                                id="scoreEfficiency"
                                                type="text"
                                                v-model="form.scoreEfficiency"
                                                placeholder="Enter Efficiency..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.scoreEfficiency
                                                            .$error,
                                                }"
                                            />
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.scoreEfficiency
                                                        .$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.scoreEfficiency
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                                <span
                                                    v-if="
                                                        !$v.form.scoreEfficiency
                                                            .numeric
                                                    "
                                                    >This value should be a
                                                    valid number.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col>
                                            <input
                                                autocomplete="off"
                                                id="scoreQuality"
                                                type="text"
                                                v-model="form.scoreQuality"
                                                placeholder="Enter Quality..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.scoreQuality
                                                            .$error,
                                                }"
                                            />
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.scoreQuality.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.scoreQuality
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                                <span
                                                    v-if="
                                                        !$v.form.scoreQuality
                                                            .numeric
                                                    "
                                                    >This value should be a
                                                    valid number.</span
                                                >
                                            </div>
                                        </b-col>
                                        <b-col>
                                            <input
                                                autocomplete="off"
                                                id="scoreTimeliness"
                                                type="text"
                                                v-model="form.scoreTimeliness"
                                                placeholder="Enter Timelines..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.scoreTimeliness
                                                            .$error,
                                                }"
                                            />
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.scoreTimeliness
                                                        .$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.scoreTimeliness
                                                            .required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                                <span
                                                    v-if="
                                                        !$v.form.scoreTimeliness
                                                            .numeric
                                                    "
                                                    >This value should be a
                                                    valid number.</span
                                                >
                                            </div>
                                        </b-col>
                                    </b-row>
                                    <div class="mb-3">
                                        <label for="finalRemarks"
                                            >Final Remarks
                                        </label>
                                        <textarea
                                            id="finalRemarks"
                                            rows="3"
                                            v-model="form.finalRemarks"
                                            placeholder="Enter Final Remarks..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.finalRemarks.$error,
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
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <!-- <div class="mb-3">
                                        <input
                                            autocomplete="off"
                                            class="form-check-input"
                                            type="checkbox"
                                            id="isCatchUp"
                                            v-model="form.isCatchUp"
                                        />&nbsp;&nbsp;
                                        <label
                                            class="form-check-label"
                                            for="isCatchUp"
                                            >Is CatchUp?</label
                                        >
                                    </div>
                                    <div class="mb-3" v-if="form.isCatchUp">
                                        <label for="catchUpPlans"
                                            >CatchUp Plans
                                        </label>
                                        <textarea
                                            id="catchUpPlans"
                                            rows="5"
                                            v-model="form.catchUpPlans"
                                            placeholder="Enter CatchUp Plans..."
                                            class="form-control"
                                        ></textarea>
                                    </div> -->
                                    <div class="mb-3">
                                        <input
                                            autocomplete="off"
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
                                    <div class="mb-3" v-if="form.isCompleted">
                                        <label for="dateCompleted"
                                            >Date Completed
                                        </label>
                                        <date-picker
                                            v-model="form.dateCompleted"
                                            :first-day-of-week="1"
                                            lang="en"
                                            placeholder="Enter Date Completed..."
                                        ></date-picker>
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
                                            class="
                                                form-select form-select-sm
                                                mx-1
                                            "
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
                                                @click="markAsApproved(row.item)"
                                                variant="success"
                                                v-if="row.item.status.toUpperCase() === 'POSTED'"
                                                ><i
                                                    class="
                                                        bx bx-check
                                                        font-size-18
                                                        me-1
                                                    "
                                                ></i
                                                >Mark As Approved</b-dropdown-item
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
                                                >Update Score</b-dropdown-item
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
        <api-type @dropData="dropType($event)"></api-type>
    </Layout>
</template>
