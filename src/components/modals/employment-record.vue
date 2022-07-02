<script>
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import JobCategory from "@/components/modals/job-category.vue";
import Multiselect from "vue-multiselect";
import DatePicker from "vue2-datepicker";

export default {
    name: "EmploymentRecord",
    components: {
        JobCategory,
        Multiselect,
        DatePicker,
    },
    data() {
        return {
            submitted: false,
            tableData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            perPage: 25,
            pageOptions: [10, 25, 50, 100],
            filter: null,
            filterOn: [],
            sortBy: "company.name",
            sortDesc: false,
            fields: [
                {
                    key: "dateTrackDisplay",
                    sortable: true,
                    label: "Tracked Date",
                    thStyle: { width: "120px" },
                },
                {
                    key: "status",
                    sortable: true,
                    thStyle: { width: "120px" },
                },
                {
                    key: "company.name",
                    sortable: true,
                    label: "Company",
                },
                {
                    key: "jobCategory.category",
                    sortable: true,
                    label: "Job Category",
                },
                {
                    key: "position",
                    sortable: true,
                },
                {
                    key: "actions",
                    thStyle: { width: "90px" },
                },
            ],
            form: {
                id: 0,
                graduateStudentId: 0,
                position: "",
                dateTrack: "",
                jobCategoryId: "",
                companyId: "",
                status: "",
            },
            indexSelected: -1,
            tableBusy: false,
            companies: [],
            company: {},
            jobCategory: {},
            erTitle: "",
            graduateStudentId: 0,
        };
    },
    computed: {
        rows() {
            return this.tableData.length;
        },
    },
    validations: {
        form: {
            // position: { required },
            dateTrack: { required },
            // jobCategoryId: { required },
            status: { required },
        },
        // company: { required },
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addEr() {
            this.onReset();
            this.modalTitle = "Create Employment Record";
            this.$bvModal.show("er-modal");
        },
        onReset() {
            this.form = {
                id: 0,
                graduateStudentId: 0,
                position: "",
                dateTrack: new Date(),
                jobCategoryId: 0,
                companyId: 0,
                status: "",
            };
            var notCompany = this.companies.find(
                    (company) => company.name === "N/A"
                );
            var notJobCategory = this.$refs.jc.getNotTracked();
            this.company = notCompany ? notCompany : {};
            this.jobCategory = notJobCategory ? notJobCategory : {};
        },
        hideModal() {
            this.$bvModal.hide("er-modal");
        },
        onCreate() {
            this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
                return;
            } else {
                this.form.graduateStudentId = this.graduateStudentId;
                var data = cloneDeep(this.form);
                data.dateTrack = this.getDate(this.form.dateTrack);
                data.dateTrackDisplay = this.formatDate(this.form.dateTrack);
                data.jobCategory = this.jobCategory;
                data.company = this.company;
                if (this.form.id > 0) {
                    this.$store
                        .dispatch(
                            "employmentrecord/UpdateEmploymentRecord",
                            data
                        )
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.errorMessage, "error");
                            }
                            this.tableData.splice(this.indexSelected, 1, data);
                            this.$bvModal.hide("er-modal");
                            this.showToast("Successfully updated!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                } else {
                    this.$store
                        .dispatch(
                            "employmentrecord/CreateEmploymentRecord",
                            data
                        )
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.errorMessage, "error");
                            }
                            data.id = res.data.id;
                            this.tableData.push(data);
                            this.$bvModal.hide("er-modal");
                            this.showToast("Successfully created!","success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!","error");
                        });
                }
                this.submitted = false;
            }
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.form.dateTrack = new Date(props.item.dateTrack);
            this.company = this.companies.find(
                (x) => x.id == props.item.companyId
            );
            this.jobCategory = props.item.jobCategory;
            this.indexSelected = this.tableData.indexOf(props.item);
            this.modalTitle = "Update Employment Record";
            this.$bvModal.show("er-modal");
        },
        deleteItem(props) {
            console.log(props.item.id)
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
                            "employmentrecord/DeleteEmploymentRecord",
                            props.item.id
                        )
                        .then((res) => {
                            if(res.data.error){
                                return this.showToast(res.data.errorMessage,"error");
                            }
                            this.tableData.splice(index, 1);
                            this.showToast("Successfully deleted!","success");
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!","error");
                        });
                }
            });
        },
        getRecord(id) {
            this.graduateStudentId = id;
            this.tableBusy = true;
            this.$store
                .dispatch("employmentrecord/GetEmploymentRecordByStudent", id)
                .then((res) => {
                    this.tableBusy = false;
                    res.data.forEach((item) => {
                        item.dateTrackDisplay = this.formatDate(
                            new Date(item.dateTrack)
                        );
                    });
                    this.tableData = res.data;
                })
                .catch(() => {
                    this.tableBusy = false;
                    this.showToast("Something went wrong!","error");
                });
        },
        getJc() {
            this.$bvModal.show("job-category-modal");
        },
        dropData(data) {
            this.jobCategory = data;
            this.form.jobCategoryId = data.id;
        },
        onSelectCompany(value) {
            this.form.companyId = value.id;
        },
        changeStatus() {
            if (this.form.status == "Employed") {
                this.company = {};
                this.jobCategory = {};
                this.form.jobCategoryId = 0;
                this.form.companyId = 0;
            } else {
                var notCompany = this.companies.find(
                    (company) => company.name === "N/A"
                );
                var notJobCategory = this.$refs.jc.getNotTracked();
                this.company = notCompany ? notCompany : {};
                this.jobCategory = notJobCategory ? notJobCategory : {};
                this.form.jobCategoryId = notJobCategory ? notJobCategory.id : 0;
                this.form.companyId = notCompany ? notCompany.id : 0;
                this.form.position = '';
            }
        },
    },
    created() {
        this.$store
            .dispatch("company/GetCompany")
            .then((res) => {
                this.companies = res.data;
            })
            .catch(() => {
                this.tableBusy = false;
                this.showToast("Something went wrong!","error");
            });
    },
};
</script>

<template>
    <b-modal
        id="employment-record-modal"
        :title="erTitle"
        size="xl"
        title-class="font-18"
        hide-footer
        no-close-on-backdrop
    >
        <div class="row mt-1">
            <div class="col-sm-12 col-md-6">
                <div id="tickets-table_filter" class="dataTables_filter">
                    <label class="d-inline-flex align-items-center">
                        Search:
                        <b-form-input
                            autocomplete="off"
                            v-model="filter"
                            type="search"
                            placeholder="Search..."
                            class="form-control form-control-sm ms-2"
                        ></b-form-input>
                    </label>
                </div>
            </div>
            <!-- Search -->
            <div class="col-sm-12 col-md-6">
                <div class="d-flex justify-content-end align-items-center">
                    <button
                        type="button"
                        @click="addEr()"
                        class="btn btn-sm btn-info d-flex align-items-center"
                    >
                        <i class="bx bx-plus fs-6"></i>Create New
                    </button>
                    <b-modal
                        id="er-modal"
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
                                <label for="dateTrack">Latest Update </label>
                                <date-picker
                                    v-model="form.dateTrack"
                                    :first-day-of-week="1"
                                    lang="en"
                                    placeholder="Enter Date Track..."
                                    :class="{
                                        'is-invalid':
                                            submitted &&
                                            $v.form.dateTrack.$error,
                                    }"
                                ></date-picker>
                                <div
                                    v-if="submitted && $v.form.dateTrack.$error"
                                    class="invalid-feedback"
                                >
                                    <span v-if="!$v.form.dateTrack.required"
                                        >This value is required.</span
                                    >
                                </div>
                            </div>
                            <div class="mb-3">
                                <label>Status </label>
                                <select
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            submitted && $v.form.status.$error,
                                    }"
                                    v-model="form.status"
                                    @change="changeStatus"
                                >
                                    <option></option>
                                    <option>Unemployed</option>
                                    <option>Employed</option>
                                    <option>Not Tracked</option>
                                </select>
                                <div
                                    v-if="submitted && $v.form.status.$error"
                                    class="invalid-feedback"
                                >
                                    <span v-if="!$v.form.status.required"
                                        >This value is required.</span
                                    >
                                </div>
                            </div>
                            <div class="mb-3" v-if="form.status === 'Employed'">
                                <label for="company">Company </label>
                                <multiselect
                                    v-model="company"
                                    @select="onSelectCompany"
                                    :options="companies"
                                    label="name"
                                    track-by="id"
                                    placeholder="Select company..."
                                    :searchable="true"
                                    :allow-empty="false"
                                    value="id"
                                >
                                </multiselect>
                            </div>
                            <div class="mb-3" v-if="form.status === 'Employed'">
                                <label for="jobCategoryId">Job Category </label>
                                <b-input-group>
                                    <template #append>
                                        <b-button
                                            @click="getJc"
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
                                        placeholder="Search Job Category..."
                                        class="form-control"
                                        v-model="jobCategory.category"
                                    />
                                </b-input-group>
                            </div>
                            <div class="mb-3" v-if="form.status === 'Employed'">
                                <label for="position">Position </label>
                                <input
                                    autocomplete="off"
                                    id="position"
                                    type="text"
                                    v-model="form.position"
                                    placeholder="Enter Position..."
                                    class="form-control"
                                />
                            </div>
                            <div class="modal-footer">
                                <button type="submit" class="btn btn-primary">
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
                    <div class="text-center">{{ scope.emptyText }}</div>
                </template>
                <template #table-busy>
                    <div
                        class="d-flex justify-content-center align-items-center"
                    >
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
                                <i class="fas fa-ellipsis-v"></i>
                            </template>
                            <b-dropdown-item
                                @click="updateItem(row)"
                                variant="secondary"
                                ><i class="mdi mdi-update font-size-18 me-1"></i
                                >Edit</b-dropdown-item
                            >
                            <b-dropdown-item
                                @click="deleteItem(row)"
                                variant="danger"
                                ><i
                                    class="mdi mdi-trash-can font-size-18 me-1"
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
                    class="dataTables_paginate paging_simple_numbers float-end"
                >
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
        <job-category v-on:dropData="dropData($event)" ref="jc"></job-category>
    </b-modal>
</template>