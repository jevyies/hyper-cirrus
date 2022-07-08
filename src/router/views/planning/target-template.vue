<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import vClickOutside from "v-click-outside";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import MaskedInput from "vue-text-mask";
import { cloneDeep } from "lodash";
import Swal from "sweetalert2";

export default {
    page: {
        title: "Target Template",
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    components: {
        Layout,
        PageHeader,
        MaskedInput,
    },
    data() {
        return {
            title: "Target Template",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Target Template",
                    active: true,
                },
            ],
            perPage: 10,
            pageOptions: [10, 25, 50, 100],
            currentPage: 1,
            currencyMask: createNumberMask({
                prefix: "",
                includeThousandsSeparator: false,
                allowDecimal: true,
            }),
            createNew: false,
            updateMode: false,
            filterTemplate: "",
            tableBusy: false,
            indexSelected: -1,
            tableData: [],
            indicators: [],
            indicatorItems: [],
            campuses: [],
            dus: [],
            fiItems: [],
            // indicator
            openIndicator: false,
            indicatorSelection: false,
            selectedIndicator: null,
            filterIndicator: "",

            // indicator Item
            openIndicatorItem: false,
            indicatorItemSelection: false,
            selectedIndicatorItem: null,
            itemLoading: false,
            filterIndicatorItem: "",

            // filter indicator
            openFI: false,
            fiSelection: false,
            selectedFI: null,
            filterFI: "",

            // filter indicator Item
            openFIItem: false,
            fiItemSelection: false,
            selectedFIItem: null,
            filterFIItem: "",

            // campus
            openCampus: false,
            campusSelection: false,
            selectedCampus: null,
            filterCampus: "",

            //dus
            openDU: false,
            duSelection: false,
            selectedDU: [],
            duLoading: false,
            filterDU: "",

            //form
            form: {
                id: 0,
                indicatorItemId: "",
                description: "",
                q1: "",
                q2: "",
                q3: "",
                q4: "",
                points: "0",
                deliveryUnitIds: [],
            },
        };
    },
    async mounted() {
        this.pageLoader(true);
        await this.getAllTemplate();
        await this.getIndicators();
        await this.getCampus();
        this.pageLoader(false);
    },
    computed: {
        isSaveable() {
            if (
                this.form.description &&
                this.form.q1 &&
                this.form.q2 &&
                this.form.q3 &&
                this.form.q4 &&
                this.form.points &&
                this.form.indicatorItemId > 0 &&
                this.selectedDU.length > 0
            ) {
                return true;
            }
            return false;
        },
        isUpdateable() {
            if (
                this.form.description &&
                this.form.q1 &&
                this.form.q2 &&
                this.form.q3 &&
                this.form.q4 &&
                this.form.points &&
                this.form.indicatorItemId > 0
            ) {
                return true;
            }
            return false;
        },
        filteredIndicator() {
            let data = this.indicators;
            if (this.filterIndicator.trim() != "" && this.filterIndicator) {
                data = data.filter((item) => {
                    return item.indicatorName
                        .toUpperCase()
                        .includes(this.filterIndicator.toUpperCase());
                });
            }
            return data;
        },
        filteredFI() {
            let data = this.indicators;
            if (this.filterFI.trim() != "" && this.filterFI) {
                data = data.filter((item) => {
                    return item.indicatorName
                        .toUpperCase()
                        .includes(this.filterFI.toUpperCase());
                });
            }
            return data;
        },
        filteredIndicatorItem() {
            let data = this.indicatorItems;
            if (
                this.filterIndicatorItem.trim() != "" &&
                this.filterIndicatorItem
            ) {
                data = data.filter((item) => {
                    return item.indicatorItemName
                        .toUpperCase()
                        .includes(this.filterIndicatorItem.toUpperCase());
                });
            }
            return data;
        },
        filteredFIItem() {
            let data = this.fiItems;
            if (this.filterFIItem.trim() != "" && this.filterFIItem) {
                data = data.filter((item) => {
                    return item.indicatorName
                        .toUpperCase()
                        .includes(this.filterFIItem.toUpperCase());
                });
            }
            return data;
        },
        filteredCampus() {
            let data = this.campuses;
            if (this.filterCampus.trim() != "" && this.filterCampus) {
                data = data.filter((item) => {
                    return item.campusName
                        .toUpperCase()
                        .includes(this.filterCampus.toUpperCase());
                });
            }
            return data;
        },
        filteredDU() {
            let data = this.dus;
            if (this.filterDU.trim() != "" && this.filterDU) {
                data = data.filter((item) => {
                    return item.name
                        .toUpperCase()
                        .includes(this.filterDU.toUpperCase());
                });
            }
            return data;
        },
        filteredTemplate() {
            let data = this.tableData;
            var total = this.currentPage * this.perPage;
            if (this.filterTemplate.trim() != "" && this.filterTemplate) {
                data = data.filter((item) => {
                    return item.filterKey
                        .toUpperCase()
                        .includes(this.filterTemplate.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPage, total);
            if (this.currentPage > 1 && currentData.length == 0) {
                total = (this.currentPage - 1) * this.perPage;
                currentData = data.slice(total - this.perPage, total);
            }
            return currentData;
        },
    },
    methods: {
        async getAllTemplate() {
            this.tableBusy = true;
            await this.$store
                .dispatch("targettemplate/GetTargetTemplate")
                .then((res) => {
                    res.data.forEach(item => {
                        item.filterKey = `${item.indicatorItem.indicatorItemName} ${item.description}`;
                    })
                    this.tableData = res.data;
                    this.tableBusy = false;
                })
                .catch(() => {
                    this.showToast(
                        "Something went wrong! - getting indicators",
                        "error"
                    );
                });
        },
        async getIndicators() {
            await this.$store
                .dispatch("indicator/GetIndicator")
                .then((res) => {
                    this.indicators = res.data;
                })
                .catch(() => {
                    this.showToast(
                        "Something went wrong! - getting indicators",
                        "error"
                    );
                });
        },
        async getCampus() {
            await this.$store
                .dispatch("campus/GetCampus")
                .then((res) => {
                    this.campuses = res.data;
                })
                .catch(() => {
                    this.showToast(
                        "Something went wrong! - getting campuses",
                        "error"
                    );
                });
        },
        // indicator
        openIndicatorSelection() {
            this.indicatorSelection = true;
            this.openIndicator = true;
        },
        closeIndicator() {
            if (this.indicatorSelection) {
                this.indicatorSelection = false;
            }
            this.openIndicator = false;
        },
        selectIndicator(row) {
            this.indicatorSelection = false;
            this.selectedIndicator = row.indicatorName;
            this.itemLoading = true;
            setTimeout(() => {
                this.indicatorItems = row.indicatorItems;
                this.itemLoading = false;
            });
        },
        // indicator item
        openIndicatorItemSelection() {
            this.indicatorItemSelection = true;
            this.openIndicatorItem = true;
        },
        closeIndicatorItem() {
            if (this.indicatorItemSelection) {
                this.indicatorItemSelection = false;
            }
            this.openIndicatorItem = false;
        },
        selectIndicatorItem(row) {
            this.indicatorItemSelection = false;
            this.form.indicatorItemId = row.id;
            this.selectedIndicatorItem = row.indicatorItemName;
        },
        // filter indicator
        openFISelection() {
            this.fiSelection = true;
            this.openFI = true;
        },
        closeFI() {
            if (this.fiSelection) {
                this.fiSelection = false;
            }
            this.openFI = false;
        },
        selectFI(row) {
            this.fiSelection = false;
            this.selectedFI = row.indicatorName;
            this.fiItems = row.indicatorItems;
        },
        // filter indicator item
        openFIItemSelection() {
            this.fiItemSelection = true;
            this.openFIItem = true;
        },
        closeFIItem() {
            if (this.fiItemSelection) {
                this.fiItemSelection = false;
            }
            this.openFIItem = false;
        },
        selectFIItem(row) {
            this.filterFIItem = "";
            this.fiItemSelection = false;
            this.selectedFIItem = row.indicatorItemName;
            this.getDataByIndicatorItem(row.id);
        },
        async getDataByIndicatorItem(id) {
            await this.$store
                .dispatch("targettemplate/GetTargetTemplateByIndicator", id)
                .then((res) => {
                    this.tableData = res.data;
                })
                .catch(() => {
                    this.showToast(
                        "Something went wrong! - getting target template",
                        "error"
                    );
                });
        },
        // campus
        openCampusSelection() {
            this.campusSelection = true;
            this.openCampus = true;
        },
        closeCampus() {
            if (this.campusSelection) {
                this.campusSelection = false;
            }
            this.openCampus = false;
        },
        selectCampus(row) {
            this.campusSelection = false;
            this.selectedCampus = row.campusName;
            this.getDUs(row.id);
        },
        getDUs(id) {
            this.duLoading = true;
            this.$store
                .dispatch("deliveryunit/GetDeliveryUnitByCampus", id)
                .then((res) => {
                    this.dus = res.data;
                    this.duLoading = false;
                })
                .catch(() => {
                    this.showToast(
                        "Something went wrong! - getting DUs",
                        "error"
                    );
                });
        },

        // du
        openDUSelection() {
            this.duSelection = true;
            this.openDU = true;
        },
        closeDU() {
            if (this.duSelection) {
                this.duSelection = false;
            }
            this.openDU = false;
        },
        selectDU(row) {
            this.selectedDU.push(row);
            this.dus.splice(this.dus.indexOf(row), 1);
        },
        removeDU(index) {
            this.dus.push(this.selectedDU[index]);
            this.selectedDU.splice(index, 1);
        },
        autoGrow(element, size) {
            element.target.style.height = `${size}px`;
            element.target.style.height = `${element.target.scrollHeight}px`;
        },
        onReset() {
            this.form = {
                id: 0,
                indicatorItemId: "",
                description: "",
                q1: "",
                q2: "",
                q3: "",
                q4: "",
                points: "0",
                deliveryUnitIds: [],
            };
            this.selectedDU = [];
            this.dus = [];
            this.selectedCampus = "";
            this.selectedIndicator = "";
            this.selectedIndicatorItem = "";
        },
        async saveChanges() {
            this.submitted = true;
            if (this.form.id > 0) {
                var data = cloneDeep(this.form);
                await this.$store
                    .dispatch(`targettemplate/UpdateTargetTemplate`, data)
                    .then((res) => {
                        if (res.data.error) {
                            return this.showToast(
                                res.data.errorMessage,
                                "error"
                            );
                        }
                        this.tableData.splice(this.indexSelected, 1, res.data);
                        this.showToast("Successfully updated!", "success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong!", "error");
                    });
            } else {
                this.form.deliveryUnitIds = [];
                this.selectedDU.forEach((item) => {
                    this.form.deliveryUnitIds.push(item.id);
                });
                await this.$store
                    .dispatch(`targettemplate/CreateTargetTemplate`, this.form)
                    .then(async (res) => {
                        if (res.data.error) {
                            return this.showToast(
                                res.data.errorMessage,
                                "error"
                            );
                        }
                        res.data.targetTemplateDeliveryUnits.forEach(item => {
                            item.deliveryUnit = this.selectedDU.find(du => du.id == item.deliveryUnitId);
                        })
                        this.tableData.push(res.data);
                        this.showToast("Successfully created!", "success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong!", "error");
                    });
            }
            this.onReset();
            this.createNew = false;
        },
        createNewTemplate() {
            this.onReset();
            this.createNew = true;
        },
        deleteItem(row) {
            var index = this.tableData.indexOf(row);
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
                        .dispatch("targettemplate/DeleteTargetTemplate", row.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.tableData.splice(index, 1);
                                this.showToast(
                                    "Successfully deleted!",
                                    "success"
                                );
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!", "error");
                        });
                }
            });
        },
        saveDUPoint(y){
            var data = cloneDeep(y);
            this.$store
                .dispatch("targettemplatedu/UpdateTargetTemplateDeliveryUnit", data)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, 'error');
                    }
                    y.editMode = false;
                    this.showToast(
                        "Successfully saved!",
                        "success"
                    );
                })
                .catch((err) => {
                    this.showToast("Something went wrong!", "error");
                });
        },
        updateItem(row){
            this.indexSelected = this.tableData.indexOf(row);
            this.updateMode = true;
            this.form = {
                id: row.id,
                indicatorItemId: row.indicatorItemId,
                description: row.description,
                q1: row.q1.toString(),
                q2: row.q2.toString(),
                q3: row.q3.toString(),
                q4: row.q4.toString(),
                points: row.points.toString(),
            }
            this.selectedIndicator = this.indicators.find(indicator => indicator.id == row.indicatorItem.indicatorId).indicatorName;
            this.selectedIndicatorItem = row.indicatorItem.indicatorItemName;
        },
        cancelOperation(){
            this.createNew = false;
            this.updateMode = false;
        }
    },
};
</script>

<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">
                    {{
                        !createNew
                            ? "Target Template List"
                            : "Create New Target Template"
                    }}
                </h4>
                <div class="d-flex">
                    <button
                        type="button"
                        class="btn btn-primary"
                        v-if="!createNew && !updateMode"
                        @click="createNewTemplate()"
                    >
                        <i class="bx bx-plus me-1"></i>Create New
                    </button>
                    <button
                        type="button"
                        v-if="createNew && isSaveable"
                        class="btn btn-success"
                        @click="saveChanges"
                    >
                        <i class="bx bx-save"></i> Save Changes
                    </button>
                    <button
                        type="button"
                        v-if="updateMode && isUpdateable"
                        class="btn btn-success"
                        @click="saveChanges"
                    >
                        <i class="bx bx-save"></i> Save Changes
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        v-if="createNew || updateMode"
                        @click="cancelOperation"
                    >
                        <i class="bx bx-x me-1"></i>Cancel
                    </button>
                </div>
            </div>
            <div class="row" v-if="createNew || updateMode">
                <div :class="{'col-md-6': updateMode, 'col-md-4': !updateMode}">
                    <div class="card">
                        <div class="card-header bg-purple text-center">
                            <h4 class="card-title font-size-18 mb-0">
                                Selection of Indicator Items
                            </h4>
                        </div>
                        <div class="card-body">
                            <div
                                class="
                                    text-center
                                    cursor-pointer
                                    py-3
                                    px-2
                                    br-5
                                    border-dashed-1
                                "
                                @click="openIndicatorSelection"
                                v-if="!indicatorSelection"
                            >
                                <h5
                                    class="mb-0 text-muted"
                                    v-if="!selectedIndicator"
                                >
                                    Click to Select Indicator
                                </h5>
                                <h5 class="mb-0" v-if="selectedIndicator">
                                    <span>{{ selectedIndicator }}</span>
                                </h5>
                            </div>
                            <div
                                class="
                                    text-center
                                    py-3
                                    br-5
                                    border-dashed-1
                                    position-relative
                                "
                                v-if="indicatorSelection"
                                v-click-outside="closeIndicator"
                            >
                                <input
                                    v-model="filterIndicator"
                                    type="text"
                                    class="custom-inline-form w-100 text-center"
                                    placeholder="Search Indicator"
                                    @click="openIndicator = true"
                                />
                                <div
                                    class="
                                        selection-wrapper
                                        position-absolute
                                        w-100
                                    "
                                    v-if="openIndicator"
                                >
                                    <ul class="multiselect__content text-left">
                                        <template v-if="indicators.length == 0">
                                            <li>
                                                <span
                                                    class="multiselect__option"
                                                    >No data found</span
                                                >
                                            </li>
                                        </template>
                                        <template
                                            v-if="
                                                indicators.length > 0 &&
                                                filteredIndicator.length == 0
                                            "
                                        >
                                            <li>
                                                <span
                                                    class="multiselect__option"
                                                    >No data found</span
                                                >
                                            </li>
                                        </template>
                                        <li
                                            class="multiselect__element"
                                            v-for="x in filteredIndicator"
                                            :key="x.id"
                                            @click="selectIndicator(x)"
                                        >
                                            <span class="multiselect__option">{{
                                                x.indicatorName
                                            }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div v-if="itemLoading">
                                <div class="d-flex justify-content-center m-3">
                                    <i class="bx bx-loader font-size-30"></i>
                                </div>
                            </div>
                            <div v-if="selectedIndicator && !itemLoading">
                                <div class="d-flex justify-content-center m-3">
                                    <i
                                        class="
                                            bx bx-down-arrow-alt
                                            font-size-30
                                        "
                                    ></i>
                                </div>
                                <div
                                    class="
                                        text-center
                                        cursor-pointer
                                        py-3
                                        px-2
                                        br-5
                                        border-dashed-1
                                    "
                                    @click="openIndicatorItemSelection"
                                    v-if="!indicatorItemSelection"
                                >
                                    <h5
                                        class="mb-0 text-muted"
                                        v-if="!selectedIndicatorItem"
                                    >
                                        Click to Select Indicator Item
                                    </h5>
                                    <h5
                                        class="mb-0"
                                        v-if="selectedIndicatorItem"
                                    >
                                        <span>{{ selectedIndicatorItem }}</span>
                                    </h5>
                                </div>
                            </div>
                            <div
                                class="
                                    text-center
                                    py-3
                                    br-5
                                    border-dashed-1
                                    position-relative
                                "
                                v-if="indicatorItemSelection"
                                v-click-outside="closeIndicatorItem"
                            >
                                <input
                                    v-model="filterIndicatorItem"
                                    type="text"
                                    class="custom-inline-form w-100 text-center"
                                    placeholder="Search Indicator Item"
                                    @click="openIndicatorItem = true"
                                />
                                <div
                                    class="
                                        selection-wrapper
                                        position-absolute
                                        w-100
                                    "
                                    v-if="openIndicatorItem"
                                >
                                    <ul class="multiselect__content text-left">
                                        <template
                                            v-if="
                                                indicatorItems.length > 0 &&
                                                filteredIndicatorItem.length ==
                                                    0
                                            "
                                        >
                                            <li>
                                                <span
                                                    class="multiselect__option"
                                                    >Search not found</span
                                                >
                                            </li>
                                        </template>
                                        <li
                                            class="multiselect__element"
                                            v-for="x in filteredIndicatorItem"
                                            :key="x.id"
                                            @click="selectIndicatorItem(x)"
                                        >
                                            <span class="multiselect__option">{{
                                                x.indicatorItemName
                                            }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4" v-if="!updateMode">
                    <div class="card">
                        <div class="card-header bg-purple text-center">
                            <h4 class="card-title font-size-18 mb-0">
                                Selection of Offices
                            </h4>
                        </div>
                        <div class="card-body">
                            <div
                                class="
                                    text-center
                                    cursor-pointer
                                    py-3
                                    px-2
                                    br-5
                                    border-dashed-1
                                "
                                @click="openCampusSelection"
                                v-if="!campusSelection"
                            >
                                <h5
                                    class="mb-0 text-muted"
                                    v-if="!selectedCampus"
                                >
                                    Click to Select Campus
                                </h5>
                                <h5 v-if="selectedCampus" class="mb-0">
                                    {{ selectedCampus }}
                                </h5>
                            </div>
                            <div
                                class="
                                    text-center
                                    py-3
                                    br-5
                                    border-dashed-1
                                    position-relative
                                "
                                v-if="campusSelection"
                                v-click-outside="closeCampus"
                            >
                                <input
                                    v-model="filterCampus"
                                    type="text"
                                    class="custom-inline-form w-100 text-center"
                                    placeholder="Search Campus"
                                    @click="openCampus = true"
                                />
                                <div
                                    class="
                                        selection-wrapper
                                        position-absolute
                                        w-100
                                    "
                                    v-if="openCampus"
                                >
                                    <ul class="multiselect__content text-left">
                                        <template v-if="campuses.length == 0">
                                            <li>
                                                <span
                                                    class="multiselect__option"
                                                    >No data found</span
                                                >
                                            </li>
                                        </template>
                                        <template
                                            v-if="
                                                campuses.length > 0 &&
                                                filteredCampus.length == 0
                                            "
                                        >
                                            <li>
                                                <span
                                                    class="multiselect__option"
                                                    >Search not found</span
                                                >
                                            </li>
                                        </template>
                                        <li
                                            class="multiselect__element"
                                            v-for="x in filteredCampus"
                                            :key="x.id"
                                            @click="selectCampus(x)"
                                        >
                                            <span class="multiselect__option">{{
                                                x.campusName
                                            }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div v-if="duLoading">
                                <div class="d-flex justify-content-center m-3">
                                    <i class="bx bx-loader font-size-30"></i>
                                </div>
                            </div>
                            <div v-if="selectedCampus && !duLoading">
                                <div class="d-flex justify-content-center m-3">
                                    <i
                                        class="
                                            bx bx-down-arrow-alt
                                            font-size-30
                                        "
                                    ></i>
                                </div>
                                <div
                                    class="
                                        cursor-pointer
                                        py-3
                                        px-2
                                        br-5
                                        border-dashed-1
                                        position-relative
                                    "
                                    style="min-height: 50px"
                                    v-if="!duSelection"
                                >
                                    <div
                                        class="
                                            position-absolute
                                            w-100
                                            d-flex
                                            align-items-center
                                            justify-content-center
                                        "
                                        style="
                                            top: 0;
                                            left: 0;
                                            bottom: 0;
                                            right: 0;
                                        "
                                        @click="openDUSelection"
                                    >
                                        <h5
                                            class="mb-0 text-muted text-center"
                                            v-if="selectedDU.length == 0"
                                        >
                                            Click to Select Offices
                                        </h5>
                                    </div>
                                    <div
                                        class="w-100"
                                        style="
                                            top: 10px;
                                            left: 10px;
                                            bottom: 10px;
                                            right: 10px;
                                        "
                                        v-if="selectedDU.length > 0"
                                    >
                                        <div class="multiselect__tags-wrap">
                                            <span
                                                class="multiselect__tag"
                                                v-for="(
                                                    du, index
                                                ) in selectedDU"
                                                :key="du.id"
                                            >
                                                <span>{{ du.name }}</span>
                                                <i
                                                    class="
                                                        multiselect__tag-icon
                                                    "
                                                    @click="removeDU(index)"
                                                ></i
                                            ></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="
                                    py-3
                                    br-5
                                    border-dashed-1
                                    position-relative
                                "
                                v-if="duSelection"
                                v-click-outside="closeDU"
                            >
                                <div class="px-2">
                                    <div class="multiselect__tags-wrap">
                                        <span
                                            class="multiselect__tag"
                                            v-for="(du, index) in selectedDU"
                                            :key="du.id"
                                        >
                                            <span>{{ du.name }}</span>
                                            <i
                                                class="multiselect__tag-icon"
                                                @click="removeDU(index)"
                                            ></i
                                        ></span>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    class="custom-inline-form w-100 text-center"
                                    placeholder="Search Office"
                                    @click="openDU = true"
                                    v-model="filterDU"
                                />
                                <div
                                    class="
                                        selection-wrapper
                                        position-absolute
                                        w-100
                                    "
                                    v-if="openDU"
                                >
                                    <ul class="multiselect__content text-left">
                                        <template v-if="dus.length == 0">
                                            <li>
                                                <span
                                                    class="multiselect__option"
                                                    >No data found</span
                                                >
                                            </li>
                                        </template>
                                        <template
                                            v-if="
                                                dus.length > 0 &&
                                                filteredDU.length == 0
                                            "
                                        >
                                            <li>
                                                <span
                                                    class="multiselect__option"
                                                    >Search not found</span
                                                >
                                            </li>
                                        </template>
                                        <li
                                            class="multiselect__element"
                                            v-for="x in filteredDU"
                                            :key="x.id"
                                            @click="selectDU(x)"
                                        >
                                            <span class="multiselect__option">{{
                                                x.name
                                            }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div :class="{'col-md-6': updateMode, 'col-md-4': !updateMode}">
                    <div class="card">
                        <div class="card-header bg-purple text-center">
                            <h4 class="card-title font-size-18 mb-0">
                                Target Description
                            </h4>
                        </div>
                        <div class="card-body">
                            <div
                                class="
                                    py-3
                                    px-2
                                    br-5
                                    border-dashed-1
                                    position-relative
                                "
                            >
                                <textarea
                                    class="planning custom-inline-form w-100"
                                    placeholder="Type Target Description Here..."
                                    rows="5"
                                    v-model="form.description"
                                    @input="autoGrow($event, 15)"
                                ></textarea>
                            </div>
                            <div class="mt-3">
                                <label for="">Target Points</label>
                                <masked-input
                                    type="text"
                                    class="form-control w-100"
                                    placeholder="Target Points"
                                    v-model="form.points"
                                    :mask="currencyMask"
                                ></masked-input>
                            </div>
                            <div class="mt-3">
                                <label for="">Target Score by Quarter</label>
                                <div class="row">
                                    <div class="col-md-3">
                                        <masked-input
                                            type="text"
                                            class="form-control w-100"
                                            placeholder="Quarter 1"
                                            v-model="form.q1"
                                            :mask="currencyMask"
                                        ></masked-input>
                                    </div>
                                    <div class="col-md-3">
                                        <masked-input
                                            type="text"
                                            class="form-control w-100"
                                            placeholder="Quarter 2"
                                            v-model="form.q2"
                                            :mask="currencyMask"
                                        ></masked-input>
                                    </div>
                                    <div class="col-md-3">
                                        <masked-input
                                            type="text"
                                            class="form-control w-100"
                                            placeholder="Quarter 3"
                                            v-model="form.q3"
                                            :mask="currencyMask"
                                        ></masked-input>
                                    </div>
                                    <div class="col-md-3">
                                        <masked-input
                                            type="text"
                                            class="form-control w-100"
                                            placeholder="Quarter 4"
                                            v-model="form.q4"
                                            :mask="currencyMask"
                                        ></masked-input>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-2 position-relative" v-if="!createNew && !updateMode">
                <div class="d-flex">
                    <div
                        id="tickets-table_filter"
                        class="dataTables_filter me-1"
                    >
                        <label
                            class="
                                d-inline-flex
                                align-items-center
                            "
                        >
                            <b-form-input
                                autocomplete="off"
                                v-model="filterTemplate"
                                type="search"
                                placeholder="Search Template..."
                                class="form-control"
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
                                class="form-select"
                                v-model="perPage"
                                size="sm"
                                :options="pageOptions"
                            ></b-form-select>
                        </label>
                    </div>
                </div>
                <div class="row mt-2">
                    <!-- <div class="col-md-2">
                        <div>
                            <div
                                class="
                                    text-center
                                    cursor-pointer
                                    py-3
                                    px-2
                                    br-5
                                    border-dashed-1
                                "
                                @click="openFISelection"
                                v-if="!fiSelection"
                            >
                                <h5 class="mb-0 text-muted" v-if="!selectedFI">
                                    Click to Select Indicator
                                </h5>
                                <h5 class="mb-0" v-if="selectedFI">
                                    <span>{{ selectedFI }}</span>
                                </h5>
                            </div>
                            <div
                                class="
                                    text-center
                                    py-3
                                    br-5
                                    border-dashed-1
                                    position-relative
                                "
                                v-if="fiSelection"
                                v-click-outside="closeFI"
                            >
                                <input
                                    v-model="filterFI"
                                    type="text"
                                    class="custom-inline-form w-100 text-center"
                                    placeholder="Search Indicator"
                                    @click="openFI = true"
                                />
                                <div
                                    class="
                                        selection-wrapper
                                        position-absolute
                                        w-100
                                    "
                                    v-if="openFI"
                                >
                                    <ul class="multiselect__content text-left">
                                        <template v-if="indicators.length == 0">
                                            <li>
                                                <span
                                                    class="multiselect__option"
                                                    >No data found</span
                                                >
                                            </li>
                                        </template>
                                        <template
                                            v-if="
                                                indicators.length > 0 &&
                                                filteredFI.length == 0
                                            "
                                        >
                                            <li>
                                                <span
                                                    class="multiselect__option"
                                                    >No data found</span
                                                >
                                            </li>
                                        </template>
                                        <li
                                            class="multiselect__element"
                                            v-for="x in filteredFI"
                                            :key="x.id"
                                            @click="selectFI(x)"
                                        >
                                            <span class="multiselect__option">{{
                                                x.indicatorName
                                            }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div v-if="selectedFI">
                                <div class="d-flex justify-content-center m-3">
                                    <i
                                        class="
                                            bx bx-down-arrow-alt
                                            font-size-30
                                        "
                                    ></i>
                                </div>
                                <div
                                    class="
                                        text-center
                                        cursor-pointer
                                        py-3
                                        px-2
                                        br-5
                                        border-dashed-1
                                    "
                                    @click="openFIItemSelection"
                                    v-if="!fiItemSelection"
                                >
                                    <h5
                                        class="mb-0 text-muted"
                                        v-if="!selectedFIItem"
                                    >
                                        Click to Select Indicator Item
                                    </h5>
                                    <h5 class="mb-0" v-if="selectedFIItem">
                                        <span>{{ selectedFIItem }}</span>
                                    </h5>
                                </div>
                            </div>
                            <div
                                class="
                                    text-center
                                    py-3
                                    br-5
                                    border-dashed-1
                                    position-relative
                                "
                                v-if="fiItemSelection"
                                v-click-outside="closeFIItem"
                            >
                                <input
                                    v-model="filterFIItem"
                                    type="text"
                                    class="custom-inline-form w-100 text-center"
                                    placeholder="Search Indicator Item"
                                    @click="openFIItem = true"
                                />
                                <div
                                    class="
                                        selection-wrapper
                                        position-absolute
                                        w-100
                                    "
                                    v-if="openFIItem"
                                >
                                    <ul class="multiselect__content text-left">
                                        <template
                                            v-if="
                                                fiItems.length > 0 &&
                                                filteredFIItem.length == 0
                                            "
                                        >
                                            <li>
                                                <span
                                                    class="multiselect__option"
                                                    >Search not found</span
                                                >
                                            </li>
                                        </template>
                                        <li
                                            class="multiselect__element"
                                            v-for="x in filteredFIItem"
                                            :key="x.id"
                                            @click="selectFIItem(x)"
                                        >
                                            <span class="multiselect__option">{{
                                                x.indicatorItemName
                                            }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div> -->
                    <div class="col-md-12" v-if="tableData.length == 0 && !tableBusy">
                        <h5>No template created yet</h5>
                    </div>
                    <div class="col-md-12" v-if="tableBusy">
                        <h5>Loading...</h5>
                    </div>
                    <div class="col-md-12" v-if="tableData.length > 0 && filteredTemplate.length == 0">
                        <h5>Search not found</h5>
                    </div>
                    <div class="col-md-12">
                        <div v-for="(x, xIndex) in filteredTemplate" :key="x.id">
                            <div
                                class="card mb-2"
                                :style="{
                                    'z-index': filteredTemplate.length - xIndex,
                                }"
                            >
                                <div class="card-header position-relative">
                                    <h4
                                        class="
                                            card-title
                                            font-size-16
                                            mb-1
                                            mt-1
                                            text-info
                                        "
                                    >
                                        {{ x.description }}
                                    </h4>
                                    <div>
                                        {{ x.indicatorItem.indicatorItemName }}
                                    </div>
                                    <div class="d-flex w-75">
                                        <span
                                            class="
                                                me-1
                                                d-flex
                                                align-items-center
                                            "
                                            >Offices<i
                                                class="bx bx-building"
                                            ></i
                                            >:</span
                                        >
                                        <div
                                            v-for="(
                                                y, yIndex
                                            ) in x.targetTemplateDeliveryUnits"
                                            :key="`X${x.id}-Y${y.id}`"
                                        >
                                            <a
                                                class="
                                                    me-1
                                                    text-white
                                                    hoverable-link
                                                "
                                                href="javascript:void(0);"
                                                :id="`duX${x.id}-Y${y.id}`"
                                                >{{ y.deliveryUnit.name
                                                }}<span
                                                    v-if="
                                                        x
                                                            .targetTemplateDeliveryUnits
                                                            .length !=
                                                        yIndex + 1
                                                    "
                                                    >,</span
                                                ></a
                                            >
                                            <b-popover
                                                :target="`duX${x.id}-Y${y.id}`"
                                                triggers="click blur"
                                                placement="bottom"
                                                :show.sync="y.editMode"
                                            >
                                                <template v-slot:title>
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                            justify-content-between
                                                        "
                                                    >
                                                        <small
                                                            >Update
                                                            Points/Score</small
                                                        >
                                                        <span
                                                            class="
                                                                bx bx-x
                                                                font-size-14
                                                                cursor-pointer
                                                            "
                                                            @click="
                                                                y.editMode = false
                                                            "
                                                        ></span>
                                                    </div>
                                                </template>
                                                <div class="row mb-2">
                                                    <div class="col-md-12">
                                                        <label
                                                            for=""
                                                            class="mb-0"
                                                            >Points</label
                                                        >
                                                        <input
                                                            type="text"
                                                            placeholder="Enter Brand"
                                                            class="
                                                                form-control
                                                                form-control-sm
                                                            "
                                                            v-model="y.points"
                                                        />
                                                    </div>
                                                </div>
                                                <label for="" class="mb-0"
                                                    >Score Per Quarter</label
                                                >
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <div class="d-flex flex-column">
                                                            <small class="me-1 no-wrap">Quarter 1</small>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter Quarter 1"
                                                                class="
                                                                    form-control
                                                                    form-control-sm
                                                                "
                                                                v-model="y.q1"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="d-flex flex-column">
                                                            <small class="me-1 no-wrap">Quarter 2</small>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter Quarter 2"
                                                                class="
                                                                    form-control
                                                                    form-control-sm
                                                                "
                                                                v-model="y.q2"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="row mt-2">
                                                    <div class="col-md-6">
                                                        <div class="d-flex flex-column">
                                                            <small class="me-1 no-wrap">Quarter 3</small>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter Quarter 3"
                                                                class="
                                                                    form-control
                                                                    form-control-sm
                                                                "
                                                                v-model="y.q3"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="d-flex flex-column">
                                                            <small class="me-1 no-wrap">Quarter 4</small>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter Quarter 4"
                                                                class="
                                                                    form-control
                                                                    form-control-sm
                                                                "
                                                                v-model="y.q4"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <hr>
                                                <div
                                                    class="
                                                        text-right
                                                        mt-2
                                                    "
                                                >
                                                    <button
                                                        type="button"
                                                        class="
                                                            btn
                                                            btn-success
                                                            btn-sm
                                                            me-1
                                                        "
                                                        @click="
                                                            saveDUPoint(
                                                                y
                                                            )
                                                        "
                                                    >
                                                        <i
                                                            class="
                                                                bx
                                                                bx-save
                                                                me-1
                                                            "
                                                        ></i
                                                        >Save Changes
                                                    </button>
                                                    <button
                                                        type="button"
                                                        class="
                                                            btn
                                                            btn-sm
                                                            btn-link
                                                        "
                                                        @click="
                                                            y.editMode = false
                                                        "
                                                    >
                                                        <i
                                                            class="
                                                                bx
                                                                bx-x
                                                                me-1
                                                            "
                                                        ></i
                                                        >Cancel
                                                    </button>
                                                </div>
                                            </b-popover>
                                        </div>
                                    </div>
                                    <div
                                        class="
                                            position-absolute
                                            action-top-right
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
                                                @click="updateItem(x)"
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Layout>
</template>