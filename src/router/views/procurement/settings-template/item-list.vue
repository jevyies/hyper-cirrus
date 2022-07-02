<script>
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import ItemCategory from "@/components/modals/item-category.vue";
import Unit from "@/components/modals/unit.vue";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";

export default {
    components: {
        ItemCategory,
        Unit,
        MaskedInput
    },
    data() {
        return {
            title: "Items",
            submitted: false,
            currencyMask: createNumberMask({
                prefix: "",
                allowDecimal: true,
            }),
            modalTitle: "",
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [10, 25, 50, 100],
            filter: null,
            filterOn: [],
            tableData: [],
            sortBy: "itemName",
            sortDesc: false,
            fields: [
                {
                    key: "itemName",
                    sortable: true,
                },
                {
                    key: "description",
                    sortable: true,
                },
                {
                    key: "cost",
                    sortable: true,
                    label: "Unit Cost",
                },
                {
                    key: "actions",
                    thStyle: { width: "90px" },
                },
            ],
            form: {
                id: 0,
                itemName: "",
                description: "",
                unitId: "",
                itemCategoryId: "",
                unitCost: "",
                type: "",
                year: "",
                isProcurable: false,
                inDbm: false,
                subType: '',
            },
            indexSelected: -1,
            tableBusy: false,
            unitType: "",
            unit: "",
            itemCategory: "",
            subType: "",
        };
    },
    validations: {
        form: {
            itemName: { required },
            description: { required },
            unitId: { required },
            itemCategoryId: { required },
            unitCost: { required },
            type: { required },
            year: { required },
        },
        subType: {required}
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
        this.tableBusy = true;
        this.$store
            .dispatch("item/GetItem")
            .then((res) => {
                this.tableBusy = false;
                res.data.forEach(
                    (item) =>
                        (item.cost = new Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(item.unitCost))
                );
                this.tableData = res.data;
            })
            .catch(() => {
                this.tableBusy = false;
                this.showToast("Something went wrong! - getting Item", 'error');
            });
    },
    methods: {
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
        addItem() {
            this.onReset();
            this.modalTitle = "Create New Item";
            this.$bvModal.show("modal-standard");
        },
        getCt() {
            this.$bvModal.show("Item-type-modal");
        },
        onCreate() {
            this.submitted = true;
            this.$v.form.$touch();
            if (this.$v.form.$invalid) {
                return;
            } 
            if(this.form.isProcurable){
                this.$v.subType.$touch();
                if (this.$v.subType.$invalid) {
                    return;
                }
                this.form.subType = cloneDeep(this.subType)
            }else{
                this.form.subType = "";
            }
            if (this.form.id > 0) {
                this.$store
                    .dispatch("item/UpdateItem", this.form)
                    .then((res) => {
                        if (res.data.error) {
                            return this.showToast(res.data.errorMessage, "error");
                        }
                        res.data.cost = new Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(res.data.unitCost);
                        this.tableData.splice(
                            this.indexSelected,
                            1,
                            res.data
                        );
                        this.$bvModal.hide("modal-standard");
                        this.showToast("Successfully updated!", "success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong! - updating item", "error");
                    });
            } else {
                this.$store
                    .dispatch("item/CreateItem", this.form)
                    .then((res) => {
                        if (res.data.error) {
                            return this.showToast(res.data.errorMessage, "error");
                        }
                        res.data.cost = new Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(res.data.unitCost);
                        this.tableData.push(res.data);
                        this.$bvModal.hide("modal-standard");
                        this.showToast("Successfully created!", "success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong! - creating item", "error");
                    });
            }
            this.submitted = false;
        },
        onReset() {
            this.form = {
                id: 0,
                itemName: "",
                description: "",
                unitId: "",
                itemCategoryId: "",
                unitCost: "",
                type: "",
                year: "",
                subType: "",
                isProcurable: false,
                inDbm: false,
            };
            this.unit = "";
            this.itemCategory = "";
            this.$v.$reset();
        },
        updateItem(props) {
            this.form = cloneDeep(props.item);
            this.subType = props.item.subType;
            this.indexSelected = this.tableData.indexOf(props.item);
            this.unit = props.item.unit.unitName;
            this.itemCategory = props.item.itemCategory.name;
            this.modalTitle = "Update Item";
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
                        .dispatch("item/DeleteItem", props.item.id)
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
        dropData(data) {
            this.unitType = data.type;
            this.form.unitTypeId = data.id;
        },
        getUnit() {
            this.$refs.unit.getData();
            this.$bvModal.show("unit-modal");
        },
        dropUnit(data) {
            this.unit = data.unitName;
            this.form.unitId = data.id;
        },
        getItemCategory() {
            this.$bvModal.show("item-category-modal");
        },
        dropItemCat(data) {
            this.itemCategory = data.name;
            this.form.itemCategoryId = data.id;
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
                            <h4 class="card-title m-0">Item List</h4>
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
                                        <label for="itemName">
                                            Item Name
                                        </label>
                                        <input
                                            autocomplete="off"
                                            id="itemName"
                                            type="text"
                                            v-model="form.itemName"
                                            placeholder="Enter Item Name..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.itemName.$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.itemName.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.itemName.required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="description"
                                            >Specifications
                                        </label>
                                        <textarea
                                            id="description"
                                            type="text"
                                            v-model="form.description"
                                            placeholder="Enter Specifications..."
                                            class="form-control"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.form.description.$error,
                                            }"
                                        ></textarea>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.description.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.description
                                                        .required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="unitId">Unit </label>
                                        <b-input-group>
                                            <template #append>
                                                <b-button
                                                    @click="getUnit"
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
                                                placeholder="Search Unit..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.unitId.$error,
                                                }"
                                                v-model="unit"
                                            />
                                        </b-input-group>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.unitId.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="!$v.form.unitId.required"
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="itemCategoryId"
                                            >Item Category
                                        </label>
                                        <b-input-group>
                                            <template #append>
                                                <b-button
                                                    @click="getItemCategory"
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
                                                placeholder="Search Item Category..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.itemCategoryId
                                                            .$error,
                                                }"
                                                v-model="itemCategory"
                                            />
                                        </b-input-group>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.itemCategoryId.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.itemCategoryId
                                                        .required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="unitCost">Unit Cost </label>
                                        <masked-input
                                            autocomplete="off"
                                            id="unitCost"
                                            type="text"
                                            v-model="form.unitCost"
                                            class="form-control"
                                            :class="{
                                                'is-invalid': $v.form.unitCost.$error,
                                            }"
                                            :mask="currencyMask"
                                        ></masked-input>
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.form.unitCost.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.form.unitCost.required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label for="type">Type </label>
                                            <b-form-select
                                                id="type"
                                                v-model="form.type"
                                                class="
                                                    form-select
                                                    custom-select
                                                "
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.type.$error,
                                                }"
                                            >
                                                <option></option>
                                                <option>CSE</option>
                                                <option>NON-CSE</option>
                                            </b-form-select>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.type.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.type.required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <label for="year">Year </label>
                                            <input
                                                autocomplete="off"
                                                id="year"
                                                type="text"
                                                v-model="form.year"
                                                placeholder="Enter Year..."
                                                class="form-control"
                                                :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.form.year.$error,
                                                }"
                                            />
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.form.year.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.form.year.required
                                                    "
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </div>
                                        <div class="d-flex mt-2 mb-3">
                                            <div class="me-2">
                                                <input
                                                    autocomplete="off"
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    id="isProcurable"
                                                    v-model="form.isProcurable"
                                                />&nbsp;&nbsp;
                                                <label
                                                    class="form-check-label"
                                                    for="isProcurable"
                                                    >Is Procurable?</label
                                                >
                                            </div>
                                            <div>
                                                <input
                                                    autocomplete="off"
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    id="inDbm"
                                                    v-model="form.inDbm"
                                                />&nbsp;&nbsp;
                                                <label
                                                    class="form-check-label"
                                                    for="inDbm"
                                                    >In DBM?</label
                                                >
                                            </div>
                                        </div>
                                        <div v-if="form.isProcurable">
                                            <label for="subType">Sub Type </label>
                                            <select class="form-select"  id="subType" v-model="subType" placeholder="Select Sub Type..." :class="{
                                                    'is-invalid':
                                                        submitted &&
                                                        $v.subType.$error,
                                                }">
                                                <option></option>
                                                <option>Goods</option>
                                                <option>Services</option>
                                            </select>
                                            <div
                                                v-if="
                                                    submitted &&
                                                    $v.subType.$error
                                                "
                                                class="invalid-feedback"
                                            >
                                                <span
                                                    v-if="
                                                        !$v.subType.required
                                                    "
                                                    >This value is
                                                    required.</span
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
        <unit ref="unit" @dropData="dropUnit($event)"></unit>
        <item-category @dropData="dropItemCat($event)"></item-category>
    </div>
</template>