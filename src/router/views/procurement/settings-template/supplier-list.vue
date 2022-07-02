<script>
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import Multiselect from "vue-multiselect";

export default {
    page: {
        title: "Supplier List",
    },
    components: {
        Multiselect
    },
    data() {
        return {
            title: "Suppliers",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Supplier",
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
                    thStyle: { width: "35%" },
                },
                {
                    key: "address",
                    sortable: true,
                },
                {
                    key: "note",
                    sortable: true,
                    thStyle: { width: "20%" },
                },
                {
                    key: "categories",
                    sortable: true,
                    thStyle: { width: "180px" },
                },
                {
                    key: "actions",
                    thStyle: { width: "90px" },
                },
            ],
            form: {
                id: 0,
                name: "",
                address: "",
                tin: "",
                email: "",
                contactNumber: "",
                note: "",
                owner: "",
                businessOrgType: "",
                businessType: "",
                philgeps: "",
                bank: "",
                bankAddress: "",
                accountNumber: "",
                status: "Active",
                vatType: "",
                dtiPermitNumber: "",
                mayorsPermitNumber: "",
                secLicenseNumber: "",
                pcabLicenseNumber: "",
            },
            indexSelected: -1,
            tableBusy: false,
            companyType: "",
            unit: "",
            itemCategory: "",
            categories: []
        };
    },
    validations: {
        form: {
            name: { required },
            address: { required },
            tin: { required },
            email: { required },
            contactNumber: { required },
            // vatType: { required },
            status: { required },
        },
    },
    computed: {
        rows() {
            if(this.filter){
                return this.totalRows;
            }
            return this.tableData.length;
        },
    },
    created() {
        this.totalRows = this.items.length;
        this.tableBusy = true;
        this.$store
            .dispatch("supplier/GetSupplier")
            .then((res) => {
                this.tableBusy = false;
                res.data.forEach(item => {
                    item.selectedCategory = []
                })
                this.tableData = res.data;
            })
            .catch(() => {
                this.tableBusy = false;
                this.showToast("Something went wrong! - getting Supplier", 'error');
            });
        this.$store
            .dispatch("itemcategory/GetItemCategory")
            .then((res) => {
                this.categories = res.data.sort((a, b) => {
                    if(a.name < b.name) { return -1; }
                    if(a.name > b.name) { return 1; }
                    return 0;
                });
            })
            .catch(() => {
                this.showToast("Something went wrong! - getting Item Category", 'error');
            });
    },
    methods: {
        onFiltered(filteredSuppliers) {
            this.totalRows = filteredSuppliers.length;
            this.currentPage = 1;
        },
        addSupplier() {
            this.onReset();
            this.modalTitle = "Create New Supplier";
            this.$bvModal.show("supplier-modal");
        },
        onCreate() {
            this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
                return;
            } else {
                if (this.form.id > 0) {
                    this.$store
                        .dispatch("supplier/UpdateSupplier", this.form)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.errorMessage, "error");
                            }
                            this.tableData.splice(
                                this.indexSelected,
                                1,
                                res.data
                            );
                            this.$bvModal.hide("supplier-modal");
                            this.showToast("Successfully updated!", "success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!", "error");
                        });
                } else {
                    this.$store
                        .dispatch("supplier/CreateSupplier", this.form)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.errorMessage, "error");
                            }
                            this.tableData.push(res.data);
                            this.$bvModal.hide("supplier-modal");
                            this.showToast("Successfully created!", "success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong!", "error");
                        });
                }
                this.submitted = false;
            }
        },
        onReset() {
            this.form = {
                id: 0,
                name: "",
                address: "",
                tin: "",
                email: "",
                contactNumber: "",
                note: "",
                owner: "",
                businessOrgType: "",
                businessType: "",
                philgeps: "",
                bank: "",
                bankAddress: "",
                accountNumber: "",
                status: "Active",
                vatType: "",
                dtiPermitNumber: "",
                mayorsPermitNumber: "",
                secLicenseNumber: "",
                pcabLicenseNumber: "",
            };
            this.unit = "";
            this.itemCategory = "";
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.indexSelected = this.tableData.indexOf(props.item);
            this.modalTitle = "Update Supplier";
            this.$bvModal.show("supplier-modal");
        },
        hideModal() {
            this.$bvModal.hide("supplier-modal");
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
                        .dispatch("supplier/DeleteSupplier", props.item.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.tableData.splice(index, 1);
                                this.showToast("Successfully deleted!", "success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!", "error");
                        });
                }
            });
        },
        viewCategories(props) {
            props.toggleDetails()
            if(!props.detailShowing){
                this.getItemCategory(props);
            }
        },
        getItemCategory(props) {
            this.$store
                .dispatch("supplier/GetSupplierCategory", props.item.id)
                .then((res) => {
                    props.item.selectedCategory = res.data;
                })
                .catch((err) => {
                    this.showToast("Something went wrong! - getting supplier category", "error");
                });
        },
        saveAssignedItems(row) {
            var data = {supplierId: row.id,itemCategoryIds: []};
            row.categorySelection.forEach((item) => {
                data.itemCategoryIds.push(item.id);
            });
            this.$store
                .dispatch("supplier/CreateSupplierCategory", data)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    row.selectedCategory = res.data;
                    row.categorySelection = [];
                    this.showToast("Successfully assigned Item Category!", "success");
                })
                .catch((err) => {
                    this.showToast("Something went wrong!", "error");
                });
        },
        removeAssignedItem(row, item) {
            if (!item.id) {
                return;
            }
            this.$store
                .dispatch(
                    "supplier/DeleteSupplierCategory",
                    item.id
                )
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    row.selectedCategory.splice(
                        row.selectedCategory.indexOf(item),
                        1
                    );
                    this.showToast("Successfully deleted!", "success");
                })
                .catch((err) => {
                    this.showToast("Cannot be removing item!", "error");
                });
        },
    },
};
</script>

<template>
    <div>
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
                            <h4 class="card-title m-0">Supplier List</h4>
                            <button
                                type="button"
                                @click="addSupplier()"
                                class="
                                    btn btn-md btn-info
                                    d-flex
                                    align-items-center
                                "
                            >
                                <i class="bx bx-plus fs-6"></i>Create New
                            </button>
                            <b-modal
                                id="supplier-modal"
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
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="name">
                                                Supplier Name
                                            </label>
                                            <input
                                                autocomplete="off"
                                                id="name"
                                                type="text"
                                                v-model="form.name"
                                                placeholder="Enter Supplier Name..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.name.$error,
                                                }"
                                            />
                                            <div
                                                v-if="
                                                    submitted && $v.form.name.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span v-if="!$v.form.name.required"
                                                    >This value is required.</span
                                                >
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="address">Address </label>
                                            <textarea
                                                id="address"
                                                rows="2"
                                                v-model="form.address"
                                                placeholder="Enter Address..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.address.$error,
                                                }"
                                            ></textarea>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.address.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="!$v.form.address.required"
                                                    >This value is required.</span
                                                >
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <label for="email"> Email </label>
                                                <input
                                                    autocomplete="off"
                                                    id="email"
                                                    type="email"
                                                    v-model="form.email"
                                                    placeholder="Enter Email..."
                                                    class="form-control"
                                                    :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form.email.$error,
                                                    }"
                                                />
                                                <div
                                                    v-if="
                                                        submitted &&
                                                        $v.form.email.$error
                                                    "
                                                    class="invalid-feedback"
                                                >
                                                    <span v-if="!$v.form.email.required"
                                                        >This value is required.</span
                                                    >
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                 <div class="mb-3">
                                                    <label for="contactNumber">
                                                        Contact Number
                                                    </label>
                                                    <input
                                                        autocomplete="off"
                                                        id="contactNumber"
                                                        type="contactNumber"
                                                        v-model="form.contactNumber"
                                                        placeholder="Enter Contact Number..."
                                                        class="form-control"
                                                        :class="{
                                                            'is-invalid':
                                                                submitted &&
                                                                $v.form.contactNumber
                                                                    .$error,
                                                        }"
                                                    />
                                                    <div
                                                        v-if="
                                                            submitted &&
                                                            $v.form.contactNumber.$error
                                                        "
                                                        class="invalid-feedback"
                                                    >
                                                        <span
                                                            v-if="
                                                                !$v.form.contactNumber
                                                                    .required
                                                            "
                                                            >This value is required.</span
                                                        >
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label for="tin"> VAT Type </label>
                                                    <select class="form-select" v-model="form.vatType" 
                                                    >
                                                    <!-- :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form.vatType
                                                                .$error,
                                                    }" -->
                                                        <option></option>
                                                        <option>VAT - Goods</option>
                                                        <option>VAT - Services</option>
                                                        <option>Non-VAT - Goods</option>
                                                        <option>Non-VAT - Services</option>
                                                    </select>
                                                    <!-- <div
                                                        v-if="
                                                            submitted && $v.form.vatType.$error
                                                        "
                                                        class="invalid-feedback"
                                                    >
                                                        <span v-if="!$v.form.vatType.required"
                                                            >This value is required.</span
                                                        >
                                                    </div> -->
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label for="tin"> TIN </label>
                                                    <input
                                                        autocomplete="off"
                                                        id="tin"
                                                        type="text"
                                                        v-model="form.tin"
                                                        placeholder="Enter TIN..."
                                                        class="form-control"
                                                        :class="{
                                                            'is-invalid':
                                                                submitted &&
                                                                $v.form.tin.$error,
                                                        }"
                                                    />
                                                    <div
                                                        v-if="
                                                            submitted && $v.form.tin.$error
                                                        "
                                                        class="invalid-feedback"
                                                    >
                                                        <span v-if="!$v.form.tin.required"
                                                            >This value is required.</span
                                                        >
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row mb-3">
                                            <div class="col-md-6">
                                                <label for="owner">
                                                    Owner
                                                </label>
                                                <input
                                                    autocomplete="off"
                                                    id="owner"
                                                    type="text"
                                                    v-model="form.owner"
                                                    placeholder="Enter Owner..."
                                                    class="form-control"
                                                />
                                            </div>
                                            <div class="col-md-6">
                                                <label for="bstatus">
                                                    Status
                                                </label>
                                                <select id="bstatus" class="form-select" v-model="form.status"
                                                    placeholder="Select Status..." :class="{
                                                        'is-invalid':
                                                            submitted &&
                                                            $v.form.status
                                                                .$error,
                                                    }">
                                                    <option></option>
                                                    <option>Active</option>
                                                    <option>Inactive</option>
                                                </select>
                                                <div
                                                    v-if="
                                                        submitted && $v.form.status.$error
                                                    "
                                                    class="invalid-feedback"
                                                >
                                                    <span v-if="!$v.form.status.required"
                                                        >This value is required.</span
                                                    >
                                                </div>
                                                <!-- <input
                                                    autocomplete="off"
                                                    id="bstatus"
                                                    type="text"
                                                    v-model="form.status"
                                                    placeholder="Enter Status..."
                                                    class="form-control"
                                                /> -->
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="note">Note </label>
                                            <textarea
                                                id="note"
                                                rows="2"
                                                v-model="form.note"
                                                placeholder="Enter Note..."
                                                class="form-control"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="businessType">
                                                Business Type
                                            </label>
                                            <select  autocomplete="off" id="businessType" v-model="form.businessType" placeholder="Select Business Type..."
                                                class="form-select">
                                                <option></option>
                                                <option>Advertisement</option>
                                                <option>Air-conditioning</option>
                                                <option>Books</option>
                                                <option>Catering and Accommodation</option>
                                                <option>Communication</option>
                                                <option>Construction, Supplies and Materials</option>
                                                <option>Consulting Services</option>
                                                <option>Courier</option>
                                                <option>Drug and Medicines Supplies and Equipment</option>
                                                <option>Electrical Supplies and Materials</option>
                                                <option>Fire Fighting Equipment</option>
                                                <option>Furniture and Fixtures</option>
                                                <option>Garments Supplies and Materials</option>
                                                <option>General Merchandise</option>
                                                <option>Hardware Supply</option>
                                                <option>Information Technology and Equipment Supplies</option>
                                                <option>Janitorial Supplies and Equipment</option>
                                                <option>Laboratories, Chemical Supplies and Equipment</option>
                                                <option>Magazine and Journal</option>
                                                <option>Office Supplies, Materials & Equipment</option>
                                                <option>Ornaments</option>
                                                <option>Power Supply</option>
                                                <option>Printing Services</option>
                                                <option>Rentals</option>
                                                <option>Sports Supplies and Equipment</option>
                                                <option>Waste Disposal</option>
                                            </select>
                                            <!-- <input
                                                autocomplete="off"
                                                id="businessType"
                                                type="text"
                                                v-model="form.businessType"
                                                placeholder="Enter Business Type..."
                                                class="form-control"
                                            /> -->
                                        </div>
                                        <div class="row mb-3">
                                            <div class="col-md-6">
                                                <label for="philgeps">
                                                    Philgeps
                                                </label>
                                                <input
                                                    autocomplete="off"
                                                    id="philgeps"
                                                    type="text"
                                                    v-model="form.philgeps"
                                                    placeholder="Enter Philgeps..."
                                                    class="form-control"
                                                />
                                            </div>
                                            <div class="col-md-6">
                                                <label for="businessOrgType">
                                                    Organization Type
                                                </label>
                                                <select  autocomplete="off" id="businessOrgType" v-model="form.businessOrgType" placeholder="Select Organization Type..."
                                                    class="form-select">
                                                    <option></option>
                                                    <option>Sole Proprietorship</option>
                                                    <option>Partnership</option>
                                                    <option>Corporation</option>
                                                    <option>Limited Liability Company (LLC)</option>
                                                </select>
                                                <!-- <input
                                                    autocomplete="off"
                                                    id="businessOrgType"
                                                    type="text"
                                                    v-model="form.businessOrgType"
                                                    placeholder="Enter Organization Type..."
                                                    class="form-control"
                                                /> -->
                                            </div>
                                        </div>
                                        
                                        <div class="row mb-3">
                                            <div class="col-md-6">
                                                <label for="bank">
                                                    Bank
                                                </label>
                                                <input
                                                    autocomplete="off"
                                                    id="bank"
                                                    type="text"
                                                    v-model="form.bank"
                                                    placeholder="Enter Bank..."
                                                    class="form-control"
                                                />
                                            </div>
                                            <div class="col-md-6">
                                                <label for="accountNumber">
                                                    Account Number
                                                </label>
                                                <input
                                                    autocomplete="off"
                                                    id="accountNumber"
                                                    type="text"
                                                    v-model="form.accountNumber"
                                                    placeholder="Enter Account Number..."
                                                    class="form-control"
                                                />
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="bankAddress">
                                                Bank Address
                                            </label>
                                            <textarea
                                                autocomplete="off"
                                                id="bankAddress"
                                                rows="3"
                                                v-model="form.bankAddress"
                                                placeholder="Enter Bank Address..."
                                                class="form-control"
                                            ></textarea>
                                        </div>
                                        <div class="row mb-3">
                                            <div class="col-md-6">
                                                <label for="dtiPermitNumber">
                                                    DTI Permit Number
                                                </label>
                                                <input
                                                    autocomplete="off"
                                                    id="dtiPermitNumber"
                                                    type="text"
                                                    v-model="form.dtiPermitNumber"
                                                    placeholder="Enter DTI Permit Number..."
                                                    class="form-control"
                                                />
                                            </div>
                                            <div class="col-md-6">
                                                <label for="mayorsPermitNumber">
                                                    Mayor's Permit Number
                                                </label>
                                                <input
                                                    autocomplete="off"
                                                    id="mayorsPermitNumber"
                                                    type="text"
                                                    v-model="form.mayorsPermitNumber"
                                                    placeholder="Enter Mayor's Permit Number..."
                                                    class="form-control"
                                                />
                                            </div>
                                        </div>
                                        <div class="row mb-3">
                                            <div class="col-md-6">
                                                <label for="secLicenseNumber">
                                                    SEC Licence Number
                                                </label>
                                                <input
                                                    autocomplete="off"
                                                    id="secLicenseNumber"
                                                    type="text"
                                                    v-model="form.secLicenseNumber"
                                                    placeholder="Enter SEC Licence Number..."
                                                    class="form-control"
                                                />
                                            </div>
                                            <div class="col-md-6">
                                                <label for="pcabLicenseNumber">
                                                    PCAB Licence Number
                                                </label>
                                                <input
                                                    autocomplete="off"
                                                    id="pcabLicenseNumber"
                                                    type="text"
                                                    v-model="form.pcabLicenseNumber"
                                                    placeholder="Enter PCAB Licence Number..."
                                                    class="form-control"
                                                />
                                            </div>
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
                                <template #cell(name)="row">
                                    <div>{{row.item.name}}</div>
                                    <div class="d-flex">
                                        <small class="me-1 text-muted">{{row.item.email}} <span v-if="row.item.contactNumber && row.item.email">|&nbsp;</span></small>
                                        <small class="me-1 text-muted">{{row.item.contactNumber}} <span v-if="row.item.email && row.item.tin">|&nbsp;</span></small>
                                        <small class="text-muted">{{row.item.tin}}</small>
                                    </div>
                                </template>
                                <template #cell(categories)="row">
                                    <div
                                        class="
                                            d-flex
                                            justify-content-center
                                            mb-2
                                        "
                                    >
                                        <a
                                            href="javascript:void(0);"
                                            @click="viewCategories(row)"
                                            class="
                                                text-white
                                                d-flex
                                                align-items-center
                                            "
                                            ><i class="bx bx-food-menu me-1"></i
                                            >{{
                                                row.detailsShowing
                                                    ? "Hide"
                                                    : "Show"
                                            }}
                                            Categories</a
                                        >
                                    </div>
                                </template>
                                <template #row-details="row">
                                    <div class="p-3 border border-primary">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <h4 class="font-size-15">
                                                    Assigned Supplier Category
                                                </h4>
                                            </div>
                                            <div class="col-md-6 text-right">
                                                <i
                                                    title="Hide Details"
                                                    class="
                                                        font-size-18
                                                        bx bx-x
                                                        cursor-pointer
                                                    "
                                                    @click="row.toggleDetails"
                                                ></i>
                                            </div>
                                        </div>
                                        <div class="mb-2">
                                            <span
                                                class="multiselect__tag"
                                                v-for="x in row.item
                                                    .selectedCategory"
                                                :key="x.id"
                                                ><span>{{ x.itemCategory.name }}</span>
                                                <i
                                                    class="
                                                        multiselect__tag-icon
                                                    "
                                                    @click="
                                                        removeAssignedItem(
                                                            row.item,
                                                            x
                                                        )
                                                    "
                                                ></i
                                            ></span>
                                        </div>
                                        <div class="row mt-2">
                                            <div class="col-md-10">
                                                <multiselect
                                                    v-model="
                                                        row.item
                                                            .categorySelection
                                                    "
                                                    :options="categories"
                                                    label="name"
                                                    track-by="id"
                                                    value="id"
                                                    :allow-empty="true"
                                                    :close-on-select="false"
                                                    :clear-on-select="true"
                                                    :preserve-search="true"
                                                    :multiple="true"
                                                    :hide-selected="true"
                                                    placeholder="Select some Supplier Category"
                                                />
                                            </div>
                                            <div
                                                class="
                                                    col-md-2
                                                    d-flex
                                                    align-items-center
                                                "
                                            >
                                                <button
                                                    class="
                                                        btn
                                                        btn-primary
                                                        btn-block
                                                    "
                                                    type="button"
                                                    @click="
                                                        saveAssignedItems(
                                                            row.item
                                                        )
                                                    "
                                                >
                                                    <i class="bx bx-save"></i
                                                    >Save Changes
                                                </button>
                                            </div>
                                        </div>
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
    </div>
</template>