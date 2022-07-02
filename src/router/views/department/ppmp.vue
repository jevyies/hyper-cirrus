<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { Carousel, Slide } from "vue-carousel";
import ItemList from "@/components/modals/item-list.vue";
import { required } from "vuelidate/lib/validators";
import ItemCategory from "@/components/modals/item-category.vue";
import Unit from "@/components/modals/unit.vue";

export default {
    page: {
        title: "My PPMPs",
    },
    components: {
        Layout,
        PageHeader,
        Carousel,
        Slide,
        ItemList,
        ItemCategory,
        Unit,
    },
    data() {
        return {
            title: "My PPMPs",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "My PPMPs",
                    active: true,
                },
            ],
            tableData: [],
            modalTitle: "",
            totalRows: 1,
            pageOptions: [10, 25, 50, 100],
            form: {
                id: 0,
            },
            alert: {
                type: "",
                message: "",
            },
            alertForm: {
                type: "",
                message: "",
            },

            // PPMP
            ppmpData: [],
            filterPPMP: "",
            perPagePPMP: 10,
            currentPagePPMP: 1,
            ppmpLoading: false,
            budgetItem: "",
            ppmpIndex: -1,
            selectedPPMPStatus: "",
            ppmp: {
                id: 0,
                description: "",
                year: "",
            },
            yearOptions: [],

            // PPMP Items
            ppmpItems: [],
            ppmpItemLoading: false,
            selectedPPMP: "",
            selectedPPMPId: 0,
            filterItem: "",
            perPageItem: 10,
            currentPageItem: 1,
            item: {
                itemName: "",
                description: "",
                unitId: "",
                type: "",
                itemCategoryId: "",
                unitCost: 0,
            },
            itemName: "",
            itemCategory: "",
            unit: "",
            itemDetails: [],
            itemIndex: -1,
        };
    },
    validations: {
        item: {
            itemName: { required },
            description: { required },
            unitId: { required },
            type: { required },
            itemCategoryId: { required },
            unitCost: { required },
        },
        ppmp: {
            description: { required },
            year: { required },
        },
    },
    computed: {
        filteredPPMP() {
            let data = this.ppmpData;
            var total = this.currentPagePPMP * this.perPagePPMP;
            if (this.filterPPMP.trim() != "" && this.filterPPMP) {
                data = data.filter((item) => {
                    return item.description
                        .toUpperCase()
                        .includes(this.filterPPMP.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPagePPMP, total);
            if (this.currentPagePPMP > 1 && currentData.length == 0) {
                total = (this.currentPagePPMP - 1) * this.perPagePPMP;
                currentData = data.slice(total - this.perPagePPMP, total);
            }
            data = currentData;
            return data;
        },
        rowsPPMP() {
            if (this.filterPPMP.trim() != "" && this.filterPPMP) {
                return this.filteredPPMP.length;
            } else {
                return this.ppmpData.length;
            }
        },
        filteredPPMPItems() {
            let data = this.ppmpItems;
            var total = this.currentPageItem * this.perPageItem;
            if (this.filterItem.trim() != "" && this.filterItem) {
                data = data.filter((item) => {
                    return item.itemName
                        .toUpperCase()
                        .includes(this.filterItem.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageItem, total);
            if (this.currentPageItem > 1 && currentData.length == 0) {
                total = (this.currentPageItem - 1) * this.perPageItem;
                currentData = data.slice(total - this.perPageItem, total);
            }
            data = currentData;
            return data;
        },
        rowsPPMPItem() {
            if (this.filterItem.trim() != "" && this.filterItem) {
                return this.filteredPPMPItems.length;
            } else {
                return this.ppmpItems.length;
            }
        },
    },
    created() {
        this.getPPMP(this.$store.state.data.cycle);
    },
    methods: {
        // PPMP
        getPPMP(year) {
            this.ppmpLoading = true;
            this.$store
                .dispatch("departmentppmp/GetDepartmentPpmpByYear", year)
                .then((res) => {
                    this.ppmpLoading = false;
                    this.ppmpData = res.data;
                })
                .catch(() => {
                    this.ppmpLoading = false;
                    this.alert = {
                        type: "danger",
                        message: "Something went wrong!",
                    };
                });
        },
        onSearchYear() {
            this.$v.year.$touch();
            if (this.$v.year.$invalid) {
                return;
            }
        },
        onResetPPMP() {
            this.ppmp = {
                id: 0,
                description: "",
                year: this.$store.state.data.cycle,
            };
        },
        addNewPPMP() {
            this.onResetPPMP();
            this.modalTitle = "Create New PPMP";
            this.$bvModal.show("ppmp-modal");
        },
        hideModalPPMP() {
            this.$bvModal.hide("ppmp-modal");
        },
        dropObi(data) {
            this.budgetItem = data.budgetItem;
            this.ppmp.officeBudgetItemId = data.id;
        },
        onCreatePPMP() {
            this.submitted = true;
            this.$v.ppmp.$touch();
            if (this.$v.ppmp.$invalid) {
                return;
            }
            var data = cloneDeep(this.ppmp);
            data.departmentId = JSON.parse(
                localStorage.getItem("user")
            ).department.id;
            if (this.ppmp.id > 0) {
                this.$store
                    .dispatch("departmentppmp/UpdateDepartmentPpmp", data)
                    .then((res) => {
                        if (res.data.error) {
                            return (this.alertForm = {
                                type: "danger",
                                message: res.data.errorMessage,
                            });
                        }
                        this.ppmpData.splice(this.ppmpIndex, 1, res.data);
                        this.$bvModal.hide("ppmp-modal");
                        this.alert = {
                            type: "success",
                            message: "Successfully updated!",
                        };
                    })
                    .catch(() => {
                        this.alert = {
                            type: "danger",
                            message: "Something went wrong!",
                        };
                    });
            } else {
                this.$store
                    .dispatch("departmentppmp/CreateDepartmentPpmp", data)
                    .then((res) => {
                        if (res.data.error) {
                            return (this.alertForm = {
                                type: "danger",
                                message: res.data.errorMessage,
                            });
                        }
                        this.ppmpData.push(res.data);
                        this.$bvModal.hide("ppmp-modal");
                        this.alert = {
                            type: "success",
                            message: "Successfully created!",
                        };
                    })
                    .catch((err) => {
                        this.alert = {
                            type: "danger",
                            message: "Something went wrong!",
                        };
                    });
            }
            this.submitted = false;
        },
        updatePPMPItem(props) {
            this.item = cloneDeep(props);
            this.unit = props.unit.unitName;
            this.itemCategory = props.itemCategory.name;
            this.itemIndex = this.ppmpItems.indexOf(props);
            this.modalTitle = "Update PPMP Item";
            this.$bvModal.show("create-item-modal");
            this.getItemDetails(props.id);
        },
        deletePPMPItem(props) {
            var index = this.ppmpItems.indexOf(props);
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
                            "departmentppmp/DeleteDepartmentPpmpItem",
                            props.id
                        )
                        .then((res) => {
                            if (res.status == 204) {
                                this.ppmpItems.splice(index, 1);
                                this.alert = {
                                    type: "success",
                                    message: "Successfully deleted",
                                };
                            }
                        })
                        .catch(() => {
                            this.alert = {
                                type: "danger",
                                message: "Cannot be deleted!",
                            };
                        });
                }
            });
        },
        getItemDetails(id) {
            this.$store
                .dispatch("itemdetail/GetItemDetailByPPMPItem", id)
                .then((res) => {
                    res.data.forEach((item) => {
                        item.totalAmt =
                            parseFloat(item.quantity) *
                            parseFloat(this.item.unitCost);
                        item.total = Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(item.totalAmt);
                    });
                    this.itemDetails = res.data;
                })
                .catch(() => {
                    this.alert = {
                        type: "danger",
                        message: "Something went wrong!",
                    };
                });
        },
        updatePPMP(row) {
            if (row.status === "Posted") {
                return (this.alert = {
                    type: "warning",
                    message: "This PPMP is already Posted!",
                });
            }
            this.ppmp = cloneDeep(row);
            this.ppmpIndex = this.ppmpData.indexOf(row);
            this.modalTitle = "Update PPMP";
            this.$bvModal.show("ppmp-modal");
        },
        deletePPMP(props) {
            if (props.status === "Posted") {
                return (this.alert = {
                    type: "warning",
                    message: "Cannot be deleted! Already Posted!",
                });
            }
            var index = this.ppmpData.indexOf(props);
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
                            "departmentppmp/DeleteDepartmentPpmp",
                            props.id
                        )
                        .then((res) => {
                            if (res.status == 204) {
                                this.ppmpData.splice(index, 1);
                                this.alert = {
                                    type: "success",
                                    message: "Successfully deleted",
                                };
                            }
                        })
                        .catch(() => {
                            this.alert = {
                                type: "danger",
                                message: "Cannot be deleted!",
                            };
                        });
                }
            });
        },
        postPPMP() {
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
                        .dispatch(
                            "departmentppmp/PostDepartmentPpmp",
                            this.selectedPPMPId
                        )
                        .then((res) => {
                            this.ppmpData[this.ppmpIndex].status = "Posted";
                            this.selectedPPMPStatus = "Posted";
                            this.alert = {
                                type: "success",
                                message: "Successfully posted",
                            };
                        })
                        .catch((err) => {
                            this.alert = {
                                type: "danger",
                                message: "Something went wrong!",
                            };
                        });
                }
            });
        },

        // PPMP Details
        returnToPpmp() {
            this.title = "PPMPs";
            this.$refs.carousel.goToPage(this.$refs.carousel.getPreviousPage());
        },
        viewPPMPDetails(row) {
            this.selectedPPMP = `${row.description}'s Details`;
            this.selectedPPMPId = row.id;
            this.selectedPPMPStatus = row.status;
            this.ppmpIndex = this.ppmpData.indexOf(row);
            this.title = "PPMP Details";
            this.$refs.carousel.goToPage(this.$refs.carousel.getNextPage());
            this.getPPMPDetails(row.id);
        },
        getPPMPDetails(id) {
            this.ppmpItemLoading = true;
            this.$store
                .dispatch("departmentppmpitem/GetDepartmentPpmpItemByPpmp", id)
                .then((res) => {
                    this.ppmpItems = res.data;
                    this.ppmpItemLoading = false;
                })
                .catch(() => {
                    this.ppmpItemLoading = false;
                    this.alert = {
                        type: "danger",
                        message: "Something went wrong!",
                    };
                });
        },
        onResetPPMPItem() {
            this.item = {
                itemName: "",
                description: "",
                unitId: "",
                type: "",
                itemCategoryId: "",
                unitCost: 0,
            };
            this.unit = "";
            this.itemCategory = "";
        },
        addNewPPMPItem() {
            this.onResetPPMPItem();
            this.modalTitle = "Create New PPMP Item";
            this.$bvModal.show("create-item-modal");
        },
        getItems() {
            this.$bvModal.show("item-list-modal");
        },
        dropItem(data) {
            delete data.id;
            this.item = cloneDeep(data);
            this.unit = data.unit.unitName;
            this.itemCategory = data.itemCategory.name;
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
        selectMonth(data) {
            this.detail.monthId = data.id;
        },
        hideModalDetail() {
            this.$bvModal.hide("create-item-modal");
        },
        updateItemDetail(row) {
            this.selectedBudgetAmount += row.item.totalAmt;
            this.editMode = true;
            this.detail = cloneDeep(row.item);
            this.detailIndex = this.itemDetails.indexOf(row.item);
        },
        deleteItemDetail(row) {
            var index = this.itemDetails.indexOf(row.item);
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
                    if (row.item.id > 0) {
                        this.$store
                            .dispatch(
                                "departmentppmp/DeleteDepartmentPpmpItem",
                                row.item.id
                            )
                            .then((res) => {
                                if (res.status == 204) {
                                    this.selectedBudgetAmount +=
                                        row.item.totalAmt;
                                    this.itemDetails.splice(index, 1);
                                    this.alert = {
                                        type: "success",
                                        message: "Successfully deleted",
                                    };
                                }
                            })
                            .catch(() => {
                                this.alert = {
                                    type: "danger",
                                    message: "Cannot be deleted!",
                                };
                            });
                    } else {
                        this.selectedBudgetAmount += row.item.totalAmt;
                        this.itemDetails.splice(index, 1);
                    }
                }
            });
        },
        onSubmitPPMPItem() {
            this.submitted = true;
            this.$v.item.$touch();
            if (this.$v.item.$invalid) {
                this.submitted = false;
                return;
            }
            var data = cloneDeep(this.item);
            if (this.item.id > 0) {
                this.$store
                    .dispatch("departmentppmp/UpdateDepartmentPpmpItem", data)
                    .then((res) => {
                        this.ppmpItems.splice(this.ppmpIndex, 1, res.data);
                        this.$bvModal.hide("create-item-modal");
                        this.submitted = false;
                        this.alert = {
                            type: "success",
                            message: "Successfully updated!",
                        };
                    })
                    .catch(() => {
                        this.alert = {
                            type: "danger",
                            message: "Something went wrong!",
                        };
                        this.submitted = false;
                    });
            } else {
                data.departmentPpmpId = this.selectedPPMPId;
                this.$store
                    .dispatch("departmentppmp/CreateDepartmentPpmpItem", data)
                    .then((res) => {
                        this.ppmpItems.push(res.data);
                        this.$bvModal.hide("create-item-modal");
                        this.submitted = false;
                        this.alert = {
                            type: "success",
                            message: "Successfully created!",
                        };
                    })
                    .catch(() => {
                        this.alert = {
                            type: "danger",
                            message: "Something went wrong!",
                        };

                        this.submitted = false;
                    });
            }
        },
    },
};
</script>

<template>
    <Layout @changeCycle="getPPMP">
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="create-item-modal"
            :title="modalTitle"
            size="lg"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form @submit.prevent="onSubmitPPMPItem">
                <div class="mb-2">
                    <label for="itemName" class="mb-0">Item Name</label>
                    <b-input-group>
                        <template #append>
                            <b-button
                                @click="getItems"
                                variant="outline-info"
                                :disabled="selectedPPMPStatus === 'Posted'"
                                ><i
                                    class="
                                        mdi mdi-clipboard-text-search-outline
                                    "
                                ></i
                            ></b-button>
                        </template>
                        <input
                            type="text"
                            placeholder="Input/Search Item..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted && $v.item.itemName.$error,
                            }"
                            :disabled="selectedPPMPStatus === 'Posted'"
                            v-model="item.itemName"
                        />
                    </b-input-group>
                    <div
                        v-if="submitted && $v.item.itemName.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.item.itemName.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <b-row class="mb-2">
                    <b-col sm="9">
                        <label for="description" class="mb-0"
                            >Description
                        </label>
                        <input
                            autocomplete="off"
                            id="name"
                            type="text"
                            v-model="item.description"
                            placeholder="Enter Description..."
                            class="form-control"
                            :class="{
                                'is-invalid':
                                    submitted && $v.item.description.$error,
                            }"
                            :disabled="selectedPPMPStatus === 'Posted'"
                        />
                        <div
                            v-if="submitted && $v.item.description.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.item.description.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-col>
                    <b-col sm="3">
                        <label for="name" class="mb-0">Type </label>
                        <input
                            autocomplete="off"
                            id="name"
                            type="text"
                            v-model="item.type"
                            class="form-control"
                            :class="{
                                'is-invalid': submitted && $v.item.type.$error,
                            }"
                            :disabled="selectedPPMPStatus === 'Posted'"
                        />
                        <div
                            v-if="submitted && $v.item.type.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.item.type.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-col>
                </b-row>
                <b-row class="mb-2">
                    <b-col sm="5">
                        <label for="itemCategoryId" class="mb-0"
                            >Item Category
                        </label>
                        <b-input-group>
                            <template #append>
                                <b-button
                                    @click="getItemCategory"
                                    variant="outline-info"
                                    :disabled="selectedPPMPStatus === 'Posted'"
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
                                        $v.item.itemCategoryId.$error,
                                }"
                                v-model="itemCategory"
                            />
                        </b-input-group>
                        <div
                            v-if="submitted && $v.item.itemCategoryId.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.item.itemCategoryId.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-col>
                    <b-col sm="3">
                        <label for="unitId" class="mb-0">Unit </label>
                        <b-input-group>
                            <template #append>
                                <b-button
                                    @click="getUnit"
                                    variant="outline-info"
                                    :disabled="selectedPPMPStatus === 'Posted'"
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
                                        submitted && $v.item.unitId.$error,
                                }"
                                v-model="unit"
                            />
                        </b-input-group>
                        <div
                            v-if="submitted && $v.item.unitId.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.item.unitId.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-col>
                    <b-col sm="4">
                        <label for="unitId" class="mb-0">Unit Cost</label>
                        <input
                            autocomplete="off"
                            id="unitId"
                            type="text"
                            v-model="item.unitCost"
                            class="form-control text-right"
                            :class="{
                                'is-invalid':
                                    submitted && $v.item.unitCost.$error,
                            }"
                            :disabled="selectedPPMPStatus === 'Posted'"
                        />
                        <div
                            v-if="submitted && $v.item.unitCost.$error"
                            class="invalid-feedback"
                        >
                            <span v-if="!$v.item.unitCost.required"
                                >This value is required.</span
                            >
                        </div>
                    </b-col>
                </b-row>
                <div class="modal-footer">
                    <button
                        type="submit"
                        v-if="selectedPPMPStatus !== 'Posted'"
                        class="btn btn-primary"
                    >
                        Save changes
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="hideModalDetail"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-modal
            id="ppmp-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <div>
                <b-alert
                    :show="alertForm.type === 'success'"
                    dismissible
                    @dismissed="alertForm.type = ''"
                    variant="success"
                >
                    <i class="mdi mdi-check-all me-2"></i
                    >{{ alertForm.message }}
                </b-alert>
                <b-alert
                    :show="alertForm.type === 'danger'"
                    dismissible
                    @dismissed="alertForm.type = ''"
                    variant="danger"
                >
                    <i class="mdi mdi-block-helper me-2"></i
                    >{{ alertForm.message }}
                </b-alert>
                <b-alert
                    :show="alertForm.type === 'warning'"
                    dismissible
                    @dismissed="alertForm.type = ''"
                    variant="warning"
                >
                    <i class="mdi mdi-alert-outline me-2"></i
                    >{{ alertForm.message }}
                </b-alert>
            </div>
            <form
                @submit.prevent="onCreatePPMP"
                class="needs-validation"
                ref="apiForm"
            >
                <b-row>
                    <b-col>
                        <div class="mb-3">
                            <label for="description">Description </label>
                            <textarea
                                id="description"
                                rows="3"
                                v-model="ppmp.description"
                                placeholder="Enter Description..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.ppmp.description.$error,
                                }"
                            ></textarea>
                            <div
                                v-if="submitted && $v.ppmp.description.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.ppmp.description.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                        <div>
                            <label for="yearList">Year</label>
                            <input
                                type="text"
                                id="yearList"
                                placeholder="Input Year..."
                                class="form-control"
                                v-model="ppmp.year"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.ppmp.year.$error,
                                }"
                                disabled
                            />
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
                        @click="hideModalPPMP"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-alert
            :show="alert.type === 'success'"
            dismissible
            @dismissed="alert.type = ''"
            variant="success"
        >
            <i class="mdi mdi-check-all me-2"></i>{{ alert.message }}
        </b-alert>
        <b-alert
            :show="alert.type === 'danger'"
            dismissible
            @dismissed="alert.type = ''"
            variant="danger"
        >
            <i class="mdi mdi-block-helper me-2"></i>{{ alert.message }}
        </b-alert>
        <b-alert
            :show="alert.type === 'warning'"
            dismissible
            @dismissed="alert.type = ''"
            variant="warning"
        >
            <i class="mdi mdi-alert-outline me-2"></i>{{ alert.message }}
        </b-alert>
        <carousel
            ref="carousel"
            class="events navs-carousel"
            id="timeline-carousel"
            :navigation-enabled="false"
            :pagination-enabled="false"
            :perPage="1"
            :autoplay="false"
            :minSwipeDistance="0"
            :mouseDrag="false"
        >
            <slide>
                <b-row>
                    <b-col sm="3">
                        <div class="card">
                            <div class="card-body p-4">
                                <div class="search-box">
                                    <p class="text-muted">Search</p>
                                    <div class="position-relative">
                                        <input
                                            autocomplete="off"
                                            type="text"
                                            class="
                                                form-control
                                                rounded
                                                border-light
                                            "
                                            placeholder="Search PPMP..."
                                            v-model="filterPPMP"
                                        />
                                        <i
                                            class="mdi mdi-magnify search-icon"
                                        ></i>
                                    </div>
                                </div>

                                <hr class="my-3" />
                                <button
                                    type="button"
                                    @click="addNewPPMP"
                                    class="
                                        btn btn-md btn-block btn-primary
                                        d-flex
                                        align-items-center
                                        justify-content-center
                                    "
                                >
                                    <i class="bx bx-plus fs-6"></i>Create New
                                    PPMP
                                </button>
                            </div>
                        </div>
                    </b-col>
                    <b-col sm="9">
                        <div class="row">
                            <div class="col-lg-12">
                                <div>
                                    <div class="table-responsive">
                                        <table
                                            class="
                                                table
                                                project-list-table
                                                table-nowrap
                                                table-centered
                                                table-borderless
                                                align-middle
                                            "
                                        >
                                            <thead>
                                                <tr>
                                                    <th scope="col">
                                                        PPMP Description
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        width="150px"
                                                    >
                                                        Status
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        width="150px"
                                                        class="text-center"
                                                    >
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-if="ppmpLoading">
                                                    <td colspan="4">
                                                        <div
                                                            class="
                                                                d-flex
                                                                justify-content-center
                                                                align-items-center
                                                            "
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
                                                    </td>
                                                </tr>
                                                <tr
                                                    v-if="
                                                        filteredPPMP.length ==
                                                            0 && !ppmpLoading
                                                    "
                                                >
                                                    <td
                                                        colspan="4"
                                                        class="
                                                            text-muted
                                                            text-center
                                                        "
                                                    >
                                                        <i
                                                            class="
                                                                dripicons-warning
                                                                me-1
                                                            "
                                                        ></i
                                                        >No data found
                                                    </td>
                                                </tr>
                                                <tr
                                                    v-for="x in filteredPPMP"
                                                    :key="x.id"
                                                >
                                                    <td>
                                                        <h5
                                                            class="
                                                                text-truncate
                                                                font-size-14
                                                            "
                                                        >
                                                            <a
                                                                @click="
                                                                    viewPPMPDetails(
                                                                        x
                                                                    )
                                                                "
                                                                href="javascript: void(0);"
                                                                class="
                                                                    text-dark
                                                                "
                                                                >{{
                                                                    x.description
                                                                }}</a
                                                            >
                                                        </h5>
                                                    </td>
                                                    <td>{{ x.status }}</td>
                                                    <td class="text-center">
                                                        <div
                                                            class="
                                                                d-flex
                                                                justify-content-center
                                                            "
                                                        >
                                                            <i
                                                                title="Edit"
                                                                class="
                                                                    mdi
                                                                    mdi-circle-edit-outline
                                                                    font-size-18
                                                                    text-dark
                                                                    cursor-pointer
                                                                    me-1
                                                                "
                                                                @click="
                                                                    updatePPMP(
                                                                        x
                                                                    )
                                                                "
                                                            ></i>
                                                            <i
                                                                title="Delete"
                                                                class="
                                                                    mdi
                                                                    mdi-trash-can-outline
                                                                    font-size-18
                                                                    text-danger
                                                                    cursor-pointer
                                                                    me-1
                                                                "
                                                                @click="
                                                                    deletePPMP(
                                                                        x
                                                                    )
                                                                "
                                                            ></i>
                                                            <i
                                                                @click="
                                                                    viewPPMPDetails(
                                                                        x
                                                                    )
                                                                "
                                                                title="View PPMP Details"
                                                                class="
                                                                    mdi
                                                                    mdi-chevron-right
                                                                    font-size-18
                                                                    text-primary
                                                                    cursor-pointer
                                                                "
                                                            ></i>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
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
                                            v-model="currentPagePPMP"
                                            :total-rows="rowsPPMP"
                                            :per-page="perPagePPMP"
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </b-col>
                </b-row>
            </slide>
            <slide>
                <b-row>
                    <b-col sm="12">
                        <div class="d-flex align-items-center">
                            <a
                                href="javascript:void(0);"
                                class="me-1"
                                @click="returnToPpmp()"
                                ><i class="bx bx-left-arrow-alt fs-2"></i
                            ></a>
                            <h4 class="d-flex align-items-center">
                                {{ selectedPPMP
                                }}<span
                                    v-if="selectedPPMPStatus === 'Posted'"
                                    class="badge bg-success bg-gradient ms-1"
                                    >Posted</span
                                >
                            </h4>
                        </div>
                    </b-col>
                    <b-col sm="12" class="mt-2">
                        <div class="row">
                            <div class="col-md-6 d-flex">
                                <div
                                    id="tickets-table_filter"
                                    class="dataTables_filter me-1"
                                >
                                    <label
                                        class="d-inline-flex align-items-center"
                                    >
                                        <b-form-input
                                            autocomplete="off"
                                            v-model="filterItem"
                                            type="search"
                                            placeholder="Search Items..."
                                            class="form-control ms-2"
                                        ></b-form-input>
                                    </label>
                                </div>
                                <div
                                    id="tickets-table_length"
                                    class="dataTables_length"
                                >
                                    <label
                                        class="
                                            d-inline-flex
                                            align-items-center
                                            mb-0
                                        "
                                    >
                                        <b-form-select
                                            class="form-select form-select-sm"
                                            v-model="perPageItem"
                                            size="sm"
                                            :options="pageOptions"
                                        ></b-form-select>
                                    </label>
                                </div>
                                <div
                                    class="ms-1"
                                    v-if="selectedPPMPStatus !== 'Posted'"
                                >
                                    <button
                                        class="
                                            btn btn-success
                                            d-flex
                                            align-items-center
                                        "
                                        @click="postPPMP"
                                    >
                                        <i class="bx bx-task"></i> Post this
                                        PPMP
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <button
                                    class="
                                        btn btn-info
                                        d-flex
                                        align-items-center
                                        float-end
                                    "
                                    @click="addNewPPMPItem"
                                    v-if="this.selectedPPMPStatus !== 'Posted'"
                                >
                                    <i class="bx bx-plus"></i> Create New
                                </button>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-12">
                                <div>
                                    <div class="table-responsive">
                                        <table
                                            class="
                                                table
                                                project-list-table
                                                table-nowrap
                                                table-centered
                                                table-borderless
                                                align-middle
                                            "
                                        >
                                            <thead>
                                                <tr>
                                                    <th scope="col">
                                                        Item Name
                                                    </th>
                                                    <th scope="col">
                                                        Description
                                                    </th>
                                                    <th scope="col">
                                                        Unit Cost
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        width="150px"
                                                        class="text-center"
                                                    >
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-if="ppmpItemLoading">
                                                    <td colspan="4">
                                                        <div
                                                            class="
                                                                d-flex
                                                                justify-content-center
                                                                align-items-center
                                                            "
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
                                                    </td>
                                                </tr>
                                                <tr
                                                    v-if="
                                                        filteredPPMPItems.length ==
                                                            0 &&
                                                        !ppmpItemLoading
                                                    "
                                                >
                                                    <td
                                                        colspan="4"
                                                        class="
                                                            text-muted
                                                            text-center
                                                        "
                                                    >
                                                        <i
                                                            class="
                                                                dripicons-warning
                                                                me-1
                                                            "
                                                        ></i
                                                        >No data found
                                                    </td>
                                                </tr>
                                                <tr
                                                    v-for="x in filteredPPMPItems"
                                                    :key="x.id"
                                                >
                                                    <td>
                                                        {{ x.itemName }}
                                                    </td>
                                                    <td>{{ x.description }}</td>
                                                    <td>
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(x.unitCost)
                                                        }}
                                                    </td>
                                                    <td class="text-center">
                                                        <b-dropdown
                                                            class="card-drop"
                                                            menu-class="dropdown-menu-end"
                                                            variant="white"
                                                            toggle-class="p-0"
                                                        >
                                                            <template
                                                                v-slot:button-content
                                                            >
                                                                <i
                                                                    class="
                                                                        mdi
                                                                        mdi-dots-horizontal
                                                                        font-size-18
                                                                    "
                                                                ></i>
                                                            </template>
                                                            <b-dropdown-item
                                                                v-if="
                                                                    selectedPPMPStatus ===
                                                                    'Posted'
                                                                "
                                                                @click="
                                                                    updatePPMPItem(
                                                                        x
                                                                    )
                                                                "
                                                                variant="secondary"
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-detail
                                                                        font-size-18
                                                                        me-1
                                                                    "
                                                                ></i
                                                                >View
                                                                Details</b-dropdown-item
                                                            >
                                                            <b-dropdown-item
                                                                v-if="
                                                                    selectedPPMPStatus !==
                                                                    'Posted'
                                                                "
                                                                @click="
                                                                    updatePPMPItem(
                                                                        x
                                                                    )
                                                                "
                                                                variant="secondary"
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-edit
                                                                        font-size-18
                                                                        me-1
                                                                    "
                                                                ></i
                                                                >Edit</b-dropdown-item
                                                            >
                                                            <b-dropdown-item
                                                                v-if="
                                                                    selectedPPMPStatus !==
                                                                    'Posted'
                                                                "
                                                                @click="
                                                                    deletePPMPItem(
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
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col mb-3">
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
                                            v-model="currentPageItem"
                                            :total-rows="rowsPPMPItem"
                                            :per-page="perPageItem"
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </b-col>
                </b-row>
            </slide>
        </carousel>
        <item-list @dropData="dropItem($event)"></item-list>
        <unit ref="unit" @dropData="dropUnit($event)"></unit>
        <item-category @dropData="dropItemCat($event)"></item-category>
    </Layout>
</template>