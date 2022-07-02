<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import Multiselect from "vue-multiselect";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";

export default {
    page: {
        title: "Department Allocation",
    },
    components: {
        Layout,
        PageHeader,
        Multiselect,
        MaskedInput,
    },
    data() {
        return {
            title: "Department Allocation",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Department Allocation",
                    active: true,
                },
            ],
            currencyMask: createNumberMask({
                prefix: "",
                allowDecimal: true,
            }),
            tableData: [],
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            filter: "",
            filterOn: [],
            sortBy: "title",
            sortDesc: false,
            form: {
                id: 0,
                departmentId: "",
                amount: "",
                year: "",
                department: "",
            },
            indexSelected: -1,
            tableBusy: false,
            showDetail: false,
            yearOptions: [],
            departments: [],
            selectedDepartment: "",
            officeId: this.$store.state.data.deliveryUnit.id,
        };
    },
    validations: {
        form: {
            departmentId: { required },
            amount: { required },
            year: { required },
        },
    },
    computed: {
        filteredDepartment() {
            let data = this.tableData;
            var total = this.currentPage * 12;
            if (this.filter.trim() != "" && this.filter) {
                data = data.filter((item) => {
                    return item.department.departmentName
                        .toUpperCase()
                        .includes(this.filter.toUpperCase());
                });
            }
            var currentData = data.slice(total - 12, total);
            if (this.currentPage > 1 && currentData.length == 0) {
                total = (this.currentPage - 1) * 12;
                currentData = data.slice(total - 12, total);
            }
            return currentData;
        },
        rows() {
            if (this.filter.trim() != "" && this.filter) {
                return this.filteredDepartment.length;
            } else {
                return this.tableData.length;
            }
        },
    },
    created() {
        this.changeCycle(this.$store.state.data.cycle);
        this.searchDepartment(this.officeId);
    },
    methods: {
        changeCycle(cycle) {
            this.getData(cycle);
        },
        searchDepartment(id) {
            this.departments = [];
            this.form.department = "";
            this.$store
                .dispatch("department/GetDepartmentByDU", id)
                .then((res) => {
                    this.departments = res.data;
                })
                .catch((err) => {
                    this.showToast("Something went wrong!","error");
                });
        },
        inputDepartment(value) {
            this.form.departmentId = value.id;
        },
        getData(event) {
            this.tableBusy = true;
            this.$store
                .dispatch(
                    "departmentallocation/GetDepartmentAllocationByDeliveryUnit",
                    {
                        year: event,
                        deliveryUnitId: this.officeId,
                    }
                )
                .then((res) => {
                    this.tableData = res.data;
                    this.tableBusy = false;
                })
                .catch((err) => {
                    let stringErr = err.toString();
                    this.showToast("Something went wrong!","error");
                    this.tableBusy = false;
                });
        },
        addRs() {
            this.onReset();
            this.modalTitle = "Create New Allocation";
            this.$bvModal.show("modal-standard");
        },
        hideModal() {
            this.$bvModal.hide("modal-standard");
        },
        onReset() {
            this.form = {
                id: 0,
                departmentId: "",
                amount: "",
                year: this.$store.state.data.cycle,
                department: "",
            };
        },
        onCreate() {
            this.submitted = true;
            this.$v.form.$touch();
            if (this.$v.form.$invalid) {
                return;
            } else {
                var data = cloneDeep(this.form);
                if (this.form.id > 0) {
                    this.$store
                        .dispatch(
                            "departmentallocation/UpdateDepartmentAllocation",
                            data
                        )
                        .then((res) => {
                            res.data.department = this.form.department;
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
                            "departmentallocation/CreateDepartmentAllocation",
                            data
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
        updateItem(row) {
            this.form = cloneDeep(row);
            this.form.amount = row.amount.toString();
            this.indexSelected = this.tableData.indexOf(row);
            this.selectedDepartment = row.id;
            this.form.department = cloneDeep(row.department);
            this.modalTitle = "Update Allocation";
            this.$bvModal.show("modal-standard");
        },
        deleteItem(props) {
            var index = this.tableData.indexOf(props);
            this.selectedDepartment = props.id;
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
                            "departmentallocation/DeleteDepartmentAllocation",
                            props.id
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
                ref="fcForm"
            >
                <div class="mb-2">
                    <label class="m-0" for="department">Department </label>
                    <multiselect
                        v-model="form.department"
                        :options="departments"
                        label="departmentName"
                        @select="inputDepartment"
                        track-by="id"
                        value="id"
                        deselect-label=""
                        select-label=""
                        :allow-empty="false"
                        :class="{
                            'is-invalid':
                                submitted && $v.form.department.$error,
                        }"
                    />
                    <div
                        v-if="submitted && $v.form.department.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.form.department.required"
                            >This value is required.</span
                        >
                    </div>
                </div>

                <b-row class="mb-2">
                    <b-col>
                        <label for="yearList">Allocation Year</label>
                        <input
                            autocomplete="off"
                            type="text"
                            id="yearList"
                            placeholder="Input Year..."
                            class="form-control"
                            v-model="form.year"
                            :class="{
                                'is-invalid': submitted && $v.form.year.$error,
                            }"
                            disabled
                        />
                        <div
                            v-if="submitted && $v.form.year.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.form.year.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-col>
                    <b-col>
                        <label for="yearList">Amount</label>
                        <masked-input
                            autocomplete="off"
                            type="text"
                            placeholder="Input Amount..."
                            class="form-control"
                            v-model="form.amount"
                            :class="{
                                'is-invalid':
                                    submitted && $v.form.amount.$error,
                            }"
                            :mask="currencyMask"
                        ></masked-input>
                        <div
                            v-if="submitted && $v.form.amount.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.form.amount.required"
                                >This value is required.</span
                            >
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
                        @click="hideModal"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <div class="row">
            <div class="col-9">
                <div class="row">
                    <div class="col-4" v-for="n in 3" :key="n">
                        <b-skeleton-wrapper :loading="tableBusy">
                            <template #loading>
                                <b-card>
                                    <div class="mb-4 mt-2">
                                        <b-skeleton
                                            width="100%"
                                            height="24px"
                                        ></b-skeleton>
                                        <b-skeleton
                                            width="50%"
                                            height="24px"
                                        ></b-skeleton>
                                    </div>
                                    <b-skeleton
                                        width="100%"
                                        height="14px"
                                        class="mb-2"
                                    ></b-skeleton>
                                </b-card>
                            </template>
                        </b-skeleton-wrapper>
                    </div>
                </div>
                <div
                    class="row"
                    v-if="!tableBusy && filteredDepartment.length > 0"
                >
                    <div
                        class="col-4"
                        v-for="x in filteredDepartment"
                        :key="x.id"
                    >
                        <div
                            class="
                                card
                                p-1
                                border
                                shadow-none
                                position-relative
                            "
                            :style="`z-index:${
                                filteredDepartment.length - x.id
                            }`"
                            :class="{
                                'border-primary': x.id === selectedDepartment,
                            }"
                        >
                            <div class="hide-detail-btn-sm">
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
                                        @click="updateItem(x)"
                                        variant="secondary"
                                        ><i
                                            class="bx bx-edit font-size-18 me-1"
                                        ></i
                                        >Edit</b-dropdown-item
                                    >
                                    <b-dropdown-item
                                        @click="deleteItem(x)"
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
                            <div class="px-3 pt-4 pb-2">
                                <h5 class="me-2 text-muted">
                                    {{ x.department.departmentName }}
                                </h5>
                                <ul class="list-group list-inline">
                                    <li class="list-inline-item me-3">
                                        <a
                                            href="javascript:void(0);"
                                            class="text-muted"
                                        >
                                            <i
                                                class="
                                                    fas
                                                    fa-coins
                                                    align-middle
                                                    text-muted
                                                    me-1
                                                "
                                            ></i
                                            >{{
                                                Intl.NumberFormat("ja-JP", {
                                                    currency: "PHP",
                                                    style: "currency",
                                                }).format(x.amount)
                                            }}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="row"
                    v-if="!tableBusy && filteredDepartment.length == 0"
                >
                    <h5>No data found.</h5>
                </div>
                <hr class="my-4" />
                <div
                    class="text-center"
                    v-if="!tableBusy && filteredDepartment.length > 0"
                >
                    <ul
                        class="
                            pagination
                            justify-content-center
                            pagination-rounded
                        "
                    >
                        <b-pagination
                            v-model="currentPage"
                            :total-rows="rows"
                            per-page="12"
                        ></b-pagination>
                    </ul>
                </div>
            </div>
            <div class="col-3">
                <div class="card">
                    <div class="card-body p-4">
                        <div class="search-box">
                            <p class="text-muted">Search</p>
                            <div class="position-relative">
                                <input
                                    autocomplete="off"
                                    type="text"
                                    class="form-control rounded border-light"
                                    placeholder="Search Department..."
                                    v-model="filter"
                                />
                                <i class="mdi mdi-magnify search-icon"></i>
                            </div>
                        </div>

                        <hr class="my-3" />
                        <button
                            type="button"
                            @click="addRs()"
                            class="
                                btn btn-md btn-block btn-primary
                                d-flex
                                align-items-center
                                justify-content-center
                            "
                        >
                            <i class="bx bx-plus fs-6"></i>Create New Department
                            Allocation
                        </button>
                        <hr class="my-3" />
                    </div>
                </div>
                <!-- end card -->
            </div>
        </div>
    </Layout>
</template>