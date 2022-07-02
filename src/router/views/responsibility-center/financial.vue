<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { groupBy } from "lodash";
import { required } from "vuelidate/lib/validators";

export default {
    page: {
        title: "Responsibility Center",
    },
    components: {
        Layout,
        PageHeader,
    },
    data() {
        return {
            title: "Responsibility Center [Financial Review]",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Responsibility Center [Financial Review]",
                    active: true,
                },
            ],
            ffr: [],
            fr: [],
            cycles: [],
            perPage: 10,
            pageOptions: [10, 25, 50, 100],
            sortByFR: "name",
            sortDesc: false,
            ffrFields: [
                {
                    key: "office",
                    sortable: true,
                },
                {
                    key: "name",
                    sortable: true,
                    label: "Work Name",
                },
                {
                    key: "totalAmt",
                    sortable: true,
                    label: "Total Amount",
                    thStyle: { width: "20%" },
                },
                {
                    key: "item",
                    sortable: true,
                    label: "Items",
                    thStyle: { width: "250px" },
                },
                {
                    key: "actions",
                    thStyle: { width: "220px" },
                },
            ],
            frFields: [
                {
                    key: "office",
                    sortable: true,
                },
                {
                    key: "name",
                    sortable: true,
                    label: "Work Name",
                },
                {
                    key: "totalAmt",
                    sortable: true,
                    label: "Total Amount",
                    thStyle: { width: "20%" },
                },
                {
                    key: "item",
                    sortable: true,
                    label: "Items",
                    thStyle: { width: "250px" },
                },
                // {
                //     key: "actions",
                //     thStyle: { width: "220px" },
                // },
            ],
            tableIndex: -1,
            form: {
                id: "",
                remarks: "",
            },
            frType: "review",

            // FFR
            filterFFR: "",
            currentPageFFR: 1,
            filterOnFFR: [],
            totalRowsFFR: 1,
            ffrBusy: false,

            // FR
            filterFR: "",
            currentPageFR: 1,
            filterOnFR: [],
            totalRowsFR: 1,
            frBusy: false,
        };
    },
    validations: {
        form: { remarks: { required } },
    },
    created() {
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
                this.showToast('Something went wrong!', 'error');
            });
        this.getFFR(this.$store.state.data.cycle);
        this.getFR(this.$store.state.data.cycle);
    },
    computed: {
        setCycle: {
            get() {
                return this.$store.state.data.cycle;
            },
            set(newValue) {
                this.getFFR(newValue);
                this.getFR(newValue);
                return newValue;
            },
        },
        ffrRows() {
            return this.ffr.length;
        },
        frRows() {
            return this.fr.length;
        },
    },
    methods: {
        // FFR
        onFilteredFFR(filteredItems) {
            this.totalRowsFFR = filteredItems.length;
            this.currentPageFFR = 1;
        },
        getFFR(data) {
            this.$store
                .dispatch("responsibilitycenter/GetReviewFinancial", data)
                .then((res) => {
                    res.data.forEach((item) => {
                        item.totalAmt = new Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(item.totalResources);
                        item.apiResources.forEach((x) => {
                            x.fundSource =
                                x.deliveryUnitBudgetItem.objectOfExpenditure.account.accountGroup.fundClassification.shortName;
                            x.fundClass =
                                x.deliveryUnitBudgetItem.objectOfExpenditure.account.accountGroup.groupName;
                            x.budgetLineItem =
                                x.deliveryUnitBudgetItem.objectOfExpenditure.account.accountName;
                        });
                        var groupedFS = groupBy(
                            item.apiResources,
                            "fundSource"
                        );
                        var groupedFC = [];
                        var fsID = 1;
                        var fcID = 1;
                        var bliID = 1;
                        for (const key in groupedFS) {
                            var data = {
                                key: key,
                                data: [],
                                toggleKey: true,
                                id: fsID++,
                            };
                            var FC = groupBy(groupedFS[key], "fundClass");
                            for (const y in FC) {
                                var group = {
                                    id: fcID++,
                                    data: [],
                                    key: y,
                                    toggleKey: true,
                                };
                                var bli = groupBy(FC[y], "budgetLineItem");
                                for (const x in bli) {
                                    var groupBLI = {
                                        id: bliID++,
                                        data: bli[x],
                                        key: x,
                                        toggleKey: true,
                                    };
                                    group.data.push(groupBLI);
                                }
                                data.data.push(group);
                            }
                            groupedFC.push(data);
                        }
                        item.grouped = groupedFC;
                        item.prLoading = false;
                    });
                    this.ffr = res.data;
                })
                .catch((err) => {
                    this.showToast('Something went wrong!', 'error');
                });
        },

        // FR
        onFilteredFR(filteredItems) {
            this.totalRowsFFR = filteredItems.length;
            this.currentPageFFR = 1;
        },
        getFR(data) {
            this.$store
                .dispatch("responsibilitycenter/GetReviewedFinancial", data)
                .then((res) => {
                    res.data.forEach((item) => {
                        item.totalAmt = new Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(item.totalResources);
                        item.apiResources.forEach((x) => {
                            x.fundSource =
                                x.deliveryUnitBudgetItem.objectOfExpenditure.account.accountGroup.fundClassification.shortName;
                            x.fundClass =
                                x.deliveryUnitBudgetItem.objectOfExpenditure.account.accountGroup.groupName;
                            x.budgetLineItem =
                                x.deliveryUnitBudgetItem.objectOfExpenditure.account.accountName;
                        });
                        var groupedFS = groupBy(
                            item.apiResources,
                            "fundSource"
                        );
                        var groupedFC = [];
                        var fsID = 1;
                        var fcID = 1;
                        var bliID = 1;
                        for (const key in groupedFS) {
                            var data = {
                                key: key,
                                data: [],
                                toggleKey: true,
                                id: fsID++,
                            };
                            var FC = groupBy(groupedFS[key], "fundClass");
                            for (const y in FC) {
                                var group = {
                                    id: fcID++,
                                    data: [],
                                    key: y,
                                    toggleKey: true,
                                };
                                var bli = groupBy(FC[y], "budgetLineItem");
                                for (const x in bli) {
                                    var groupBLI = {
                                        id: bliID++,
                                        data: bli[x],
                                        key: x,
                                        toggleKey: true,
                                    };
                                    group.data.push(groupBLI);
                                }
                                data.data.push(group);
                            }
                            groupedFC.push(data);
                        }
                        item.grouped = groupedFC;
                        item.prLoading = false;
                    });
                    this.fr = res.data;
                })
                .catch((err) => {
                    this.showToast('Something went wrong!', 'error');
                });
        },
        returnWork(row, type) {
            this.frType = type;
            this.tableIndex =
                type === "review"
                    ? this.ffr.indexOf(row)
                    : this.fr.indexOf(row);
            this.form.id = row.id;
            this.form.remarks = "";
            this.$bvModal.show("return-modal");
        },
        returnPRSubmit() {
            this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
                return;
            }
            this.$store
                .dispatch("responsibilitycenter/ReturnFinancial", this.form)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, 'error');
                    }
                    if (this.frType === "review") {
                        this.ffr.splice(this.tableIndex, 1);
                    } else {
                        this.fr.splice(this.tableIndex, 1);
                    }
                    this.showToast("Successfully returned", 'success');
                    this.$bvModal.hide("return-modal");
                })
                .catch((err) => {
                    this.showToast('Something went wrong!', 'error');
                });
        },
        approveWork(row) {
            this.tableIndex = this.ffr.indexOf(row);
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
                            "responsibilitycenter/ApproveFinancial",
                            row.id
                        )
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.errorMessage, 'error');
                            }
                            this.ffr.splice(this.tableIndex, 1);
                            this.fr.push(row);
                            this.showToast("Successfully approved", 'success');
                        })
                        .catch((err) => {
                            this.showToast('Something went wrong!', 'error');
                        });
                }
            });
        },
        hideModal() {
            this.$bvModal.hide("return-modal");
        },
        allowPR(row) {
            row.prLoading = true;
            this.$store
                .dispatch("procurable/AllowPR", {
                    id: row.id,
                    pr: !row.allowPrWithoutConsolidation,
                })
                .then((res) => {
                    setTimeout(() => {
                        row.prLoading = false;
                        row.allowPrWithoutConsolidation =
                            !row.allowPrWithoutConsolidation;
                    }, 500);
                })
                .catch((err) => {
                    this.showToast('Something went wrong!', 'error');
                });
        },
    },
};
</script>
<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="return-modal"
            title="Return Remarks"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form @submit.prevent="returnPRSubmit" class="needs-validation">
                <b-row>
                    <b-col>
                        <div class="mb-3">
                            <label for="description">Remarks </label>
                            <textarea
                                id="description"
                                rows="3"
                                v-model="form.remarks"
                                placeholder="Enter Remarks..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.form.remarks.$error,
                                }"
                            ></textarea>
                            <div
                                v-if="submitted && $v.form.remarks.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.form.remarks.required"
                                    >This value is required.</span
                                >
                            </div>
                        </div>
                    </b-col>
                </b-row>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Return API
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
        <b-tabs content-class="pt-3 pb-3 text-muted">
            <b-tab active class="border-0">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block">For Reviewing</span>
                </template>
                <div class="card">
                    <div class="card-body">
                        <div
                            class="
                                d-flex
                                justify-content-between
                                align-items-center
                            "
                        >
                            <h4 class="card-title m-0">For Reviewing List</h4>
                            <div
                                id="tickets-table_length"
                                class="dataTables_length d-none"
                            >
                                <label class="d-inline-flex align-items-center">
                                    Cycle &nbsp;
                                    <b-form-select
                                        class="form-select"
                                        v-model="setCycle"
                                        size="sm"
                                        :options="cycles"
                                        @change="getFFR($event)"
                                    ></b-form-select>
                                </label>
                            </div>
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
                                            v-model="filterFFR"
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
                                :items="ffr"
                                :fields="ffrFields"
                                responsive="sm"
                                :per-page="perPage"
                                :current-page="currentPageFR"
                                :sort-by.sync="sortByFR"
                                :sort-desc.sync="sortDesc"
                                :filter="filterFFR"
                                :filter-included-fields="filterOnFR"
                                :busy="frBusy"
                                @filtered="onFilteredFR"
                                bordered
                                outlined
                                hover
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
                                <template #cell(name)="data">
                                    <b class="text-white">{{
                                        data.item.name
                                    }}</b>
                                    <div class="text-muted">
                                        {{ data.item.description }}
                                    </div>
                                </template>
                                <template #cell(office)="row">
                                    <div>
                                        <ul class="m-0 ps-2">
                                            <li>
                                                {{
                                                    row.item.target.deliveryUnit
                                                        .office.name
                                                }}
                                                <ul
                                                    class="m-0 ps-0"
                                                    style="list-style-type: '→'"
                                                >
                                                    <li>
                                                        <span
                                                            class="
                                                                badge
                                                                bg-success
                                                                font-size-12
                                                                ms-1
                                                            "
                                                            >{{
                                                                row.item.target
                                                                    .deliveryUnit
                                                                    .name
                                                            }}</span
                                                        >
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </div>
                                </template>
                                <template #cell(actions)="row">
                                    <div class="d-flex">
                                        <button
                                            type="button"
                                            class="
                                                btn btn-warning btn-sm
                                                me-1
                                                w-50
                                            "
                                            @click="
                                                returnWork(row.item, 'review')
                                            "
                                        >
                                            <i class="bx bx-revision me-1"></i
                                            >Return
                                        </button>
                                        <button
                                            type="button"
                                            class="btn btn-success btn-sm w-50"
                                            @click="approveWork(row.item)"
                                        >
                                            <i class="bx bx-check me-1"></i
                                            >Reviewed
                                        </button>
                                    </div>
                                </template>
                                <template #cell(item)="row">
                                    <div
                                        class="
                                            d-flex
                                            justify-content-center
                                            mb-2
                                        "
                                    >
                                        <a
                                            href="javascript:void(0);"
                                            @click="row.toggleDetails"
                                            class="
                                                text-white
                                                d-flex
                                                align-items-center
                                            "
                                            ><i class="bx bx-food-menu me-1"></i
                                            >{{
                                                row.item._showDetails
                                                    ? "Hide"
                                                    : "Show"
                                            }}
                                            Items</a
                                        >
                                    </div>
                                    <hr class="mb-2 mt-2" />
                                    <div class="text-center">
                                        <div
                                            class="
                                                d-flex
                                                justify-content-center
                                            "
                                        >
                                            <div
                                                class="
                                                    form-check
                                                    form-checkbox-outline
                                                    form-check-success
                                                    mb-0
                                                "
                                            >
                                                <input
                                                    type="checkbox"
                                                    :id="`customCheckcolor${row.item.id}`"
                                                    class="form-check-input"
                                                    @click="allowPR(row.item)"
                                                    v-model="
                                                        row.item
                                                            .allowPrWithoutConsolidation
                                                    "
                                                    v-if="!row.item.prLoading"
                                                />
                                                <span
                                                    class="
                                                        me-2
                                                        spinner-border
                                                        text-success
                                                    "
                                                    style="
                                                        width: 14px;
                                                        height: 14px;
                                                        border-width: 0.2em;
                                                    "
                                                    v-if="row.item.prLoading"
                                                ></span>
                                                <label
                                                    :for="`customCheckcolor${row.item.id}`"
                                                    class="form-check-label"
                                                >
                                                    Allow PR w/o consolidation
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                                <template #row-details="row">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h5>List of Items</h5>
                                        </div>
                                        <div class="col-md-6 text-right">
                                            <a
                                                href="javascript:void(0);"
                                                @click="row.toggleDetails()"
                                                class="text-dark font-size-16"
                                                ><i class="bx bx-x"></i
                                            ></a>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div role="tablist">
                                                <template
                                                    v-for="x in row.item
                                                        .grouped"
                                                >
                                                    <b-card
                                                        no-body
                                                        class="mb-1"
                                                        :key="'XCARD' + x.id"
                                                    >
                                                        <b-card-header
                                                            header-tag="header"
                                                            role="tab"
                                                            class="
                                                                d-flex
                                                                align-items-center
                                                                justify-content-between
                                                                px-3
                                                                py-1
                                                                cursor-pointer
                                                            "
                                                            @click="
                                                                x.toggleKey =
                                                                    !x.toggleKey
                                                            "
                                                        >
                                                            <div
                                                                class="
                                                                    d-flex
                                                                    align-items-center
                                                                "
                                                            >
                                                                <i
                                                                    class="
                                                                        bx
                                                                        bx-chevron-right
                                                                        rotate
                                                                    "
                                                                    :class="{
                                                                        'rotate-90':
                                                                            x.toggleKey,
                                                                    }"
                                                                ></i
                                                                >{{ x.key }}
                                                            </div>
                                                        </b-card-header>
                                                    </b-card>
                                                    <b-collapse
                                                        :accordion="`technical-review-accordionx-${x.id}${row.item.id}`"
                                                        role="tabpanel"
                                                        :visible="x.toggleKey"
                                                        :key="'XCOL' + x.id"
                                                    >
                                                        <template
                                                            v-for="y in x.data"
                                                        >
                                                            <b-card
                                                                no-body
                                                                class="
                                                                    mb-1
                                                                    ms-2
                                                                "
                                                                :key="
                                                                    'YCARD' +
                                                                    y.id
                                                                "
                                                            >
                                                                <b-card-header
                                                                    header-tag="header"
                                                                    role="tab"
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                        justify-content-between
                                                                        px-3
                                                                        py-1
                                                                        cursor-pointer
                                                                    "
                                                                    @click="
                                                                        y.toggleKey =
                                                                            !y.toggleKey
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bx-chevron-right
                                                                                rotate
                                                                            "
                                                                            :class="{
                                                                                'rotate-90':
                                                                                    y.toggleKey,
                                                                            }"
                                                                        ></i
                                                                        >{{
                                                                            y.key
                                                                        }}
                                                                    </div>
                                                                </b-card-header>
                                                            </b-card>
                                                            <b-collapse
                                                                :accordion="`technical-review-accordiony-${y.id}`"
                                                                role="tabpanel"
                                                                :visible="
                                                                    y.toggleKey
                                                                "
                                                                :key="
                                                                    'YCOL' +
                                                                    y.id
                                                                "
                                                            >
                                                                <template
                                                                    v-for="z in y.data"
                                                                >
                                                                    <b-card
                                                                        no-body
                                                                        class="
                                                                            mb-1
                                                                            ms-4
                                                                        "
                                                                        :key="
                                                                            'ZCARD' +
                                                                            z.id
                                                                        "
                                                                    >
                                                                        <b-card-header
                                                                            header-tag="header"
                                                                            role="tab"
                                                                            class="
                                                                                d-flex
                                                                                align-items-center
                                                                                justify-content-between
                                                                                px-3
                                                                                py-1
                                                                                cursor-pointer
                                                                            "
                                                                            @click="
                                                                                z.toggleKey =
                                                                                    !z.toggleKey
                                                                            "
                                                                            ><div
                                                                                class="
                                                                                    d-flex
                                                                                    align-items-center
                                                                                "
                                                                            >
                                                                                <i
                                                                                    class="
                                                                                        bx
                                                                                        bx-chevron-right
                                                                                        rotate
                                                                                    "
                                                                                    :class="{
                                                                                        'rotate-90':
                                                                                            z.toggleKey,
                                                                                    }"
                                                                                ></i
                                                                                >{{
                                                                                    z.key
                                                                                }}
                                                                            </div>
                                                                        </b-card-header>
                                                                        <b-collapse
                                                                            :accordion="`technical-review-accordionz-${z.id}${row.item.id}`"
                                                                            role="tabpanel"
                                                                            :visible="
                                                                                z.toggleKey
                                                                            "
                                                                            :key="
                                                                                'YCOL' +
                                                                                z.id
                                                                            "
                                                                        >
                                                                            <template
                                                                                v-for="w in z.data"
                                                                            >
                                                                                <b-card-body
                                                                                    class="
                                                                                        py-1
                                                                                        px-5
                                                                                        bg-primary
                                                                                        bg-soft
                                                                                        mb-1
                                                                                        mt-1
                                                                                    "
                                                                                    :key="
                                                                                        'W' +
                                                                                        w.id
                                                                                    "
                                                                                >
                                                                                    <b-row
                                                                                        class="
                                                                                            my-1
                                                                                        "
                                                                                    >
                                                                                        <b-col
                                                                                            sm="6"
                                                                                        >
                                                                                            <div>
                                                                                                <b
                                                                                                    >Item
                                                                                                    Name:</b
                                                                                                >
                                                                                                {{
                                                                                                    w.itemName
                                                                                                }}
                                                                                            </div>
                                                                                            <div>
                                                                                                <b
                                                                                                    >Description:</b
                                                                                                >
                                                                                                {{
                                                                                                    w.description
                                                                                                }}
                                                                                            </div>
                                                                                        </b-col>
                                                                                        <b-col>
                                                                                            <div>
                                                                                                <b
                                                                                                    >Unit
                                                                                                    Cost:</b
                                                                                                >
                                                                                                {{
                                                                                                    Intl.NumberFormat(
                                                                                                        "ja-JP",
                                                                                                        {
                                                                                                            currency:
                                                                                                                "PHP",
                                                                                                            style: "currency",
                                                                                                        }
                                                                                                    ).format(
                                                                                                        w.unitCost
                                                                                                    )
                                                                                                }}
                                                                                            </div>
                                                                                            <span
                                                                                                class="
                                                                                                    badge
                                                                                                    bg-success
                                                                                                    font-size-13
                                                                                                "
                                                                                                v-if="
                                                                                                    w.isProcurable
                                                                                                "
                                                                                            >
                                                                                                Procurable
                                                                                            </span>
                                                                                            <span
                                                                                                class="
                                                                                                    badge
                                                                                                    bg-info
                                                                                                    font-size-13
                                                                                                "
                                                                                                v-if="
                                                                                                    !w.isProcurable
                                                                                                "
                                                                                            >
                                                                                                Not
                                                                                                Procurable
                                                                                            </span>
                                                                                        </b-col>
                                                                                    </b-row>
                                                                                </b-card-body>
                                                                            </template>
                                                                        </b-collapse>
                                                                    </b-card>
                                                                </template>
                                                            </b-collapse>
                                                        </template>
                                                    </b-collapse>
                                                </template>
                                            </div>
                                        </div>
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
                                            v-model="currentPageFFR"
                                            :total-rows="ffrRows"
                                            :per-page="perPage"
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </b-tab>
            <b-tab>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="far fa-user"></i>
                    </span>
                    <span class="d-none d-sm-inline-block">Reviewed</span>
                </template>
                <div class="card">
                    <div class="card-body">
                        <div
                            class="
                                d-flex
                                justify-content-between
                                align-items-center
                            "
                        >
                            <h4 class="card-title m-0">Reviewed List</h4>
                            <div
                                id="tickets-table_length"
                                class="dataTables_length d-none"
                            >
                                <label class="d-inline-flex align-items-center">
                                    Cycle &nbsp;
                                    <b-form-select
                                        class="form-select"
                                        v-model="setCycle"
                                        size="sm"
                                        :options="cycles"
                                        @change="getFR($event)"
                                    ></b-form-select>
                                </label>
                            </div>
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
                                            v-model="filterFFR"
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
                                :items="fr"
                                :fields="frFields"
                                responsive="sm"
                                :per-page="perPage"
                                :current-page="currentPageFR"
                                :sort-by.sync="sortByFR"
                                :sort-desc.sync="sortDesc"
                                :filter="filterFFR"
                                :filter-included-fields="filterOnFR"
                                :busy="frBusy"
                                @filtered="onFilteredFR"
                                bordered
                                outlined
                                hover
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
                                <template #cell(name)="data">
                                    <b class="text-white" :id="data.item.id">{{
                                        data.item.name
                                    }}</b>
                                    <div class="text-muted">
                                        {{ data.item.description }}
                                    </div>
                                </template>
                                <template #cell(office)="row">
                                    <div>
                                        <ul class="m-0 ps-2">
                                            <li>
                                                {{
                                                    row.item.target.deliveryUnit
                                                        .office.name
                                                }}
                                                <ul
                                                    class="m-0 ps-0"
                                                    style="list-style-type: '→'"
                                                >
                                                    <li>
                                                        <span
                                                            class="
                                                                badge
                                                                bg-success
                                                                font-size-12
                                                                ms-1
                                                            "
                                                            >{{
                                                                row.item.target
                                                                    .deliveryUnit
                                                                    .name
                                                            }}</span
                                                        >
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </div>
                                </template>
                                <template #cell(item)="row">
                                    <div
                                        class="
                                            d-flex
                                            justify-content-center
                                            mb-2
                                        "
                                    >
                                        <a
                                            href="javascript:void(0);"
                                            @click="row.toggleDetails"
                                            class="
                                                text-white
                                                d-flex
                                                align-items-center
                                            "
                                            ><i class="bx bx-food-menu me-1"></i
                                            >{{
                                                row.item._showDetails
                                                    ? "Hide"
                                                    : "Show"
                                            }}
                                            Items</a
                                        >
                                    </div>
                                    <hr class="mb-2 mt-2" />
                                    <div class="text-center">
                                        <div
                                            class="
                                                d-flex
                                                justify-content-center
                                            "
                                        >
                                            <div
                                                class="
                                                    form-check
                                                    form-checkbox-outline
                                                    form-check-success
                                                    mb-0
                                                "
                                            >
                                                <input
                                                    type="checkbox"
                                                    :id="`customCheckcolor${row.item.id}`"
                                                    class="form-check-input"
                                                    @click="allowPR(row.item)"
                                                    v-model="
                                                        row.item
                                                            .allowPrWithoutConsolidation
                                                    "
                                                    v-if="!row.item.prLoading"
                                                />
                                                <span
                                                    class="
                                                        me-2
                                                        spinner-border
                                                        text-success
                                                    "
                                                    style="
                                                        width: 14px;
                                                        height: 14px;
                                                        border-width: 0.2em;
                                                    "
                                                    v-if="row.item.prLoading"
                                                ></span>
                                                <label
                                                    :for="`customCheckcolor${row.item.id}`"
                                                    class="form-check-label"
                                                >
                                                    Allow PR w/o consolidation
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                                <template #row-details="row">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h5>List of Items</h5>
                                        </div>
                                        <div class="col-md-6 text-right">
                                            <a
                                                href="javascript:void(0);"
                                                @click="row.toggleDetails"
                                                class="text-dark font-size-16"
                                                ><i class="bx bx-x"></i
                                            ></a>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div role="tablist">
                                                <template
                                                    v-for="x in row.item
                                                        .grouped"
                                                >
                                                    <b-card
                                                        no-body
                                                        class="mb-1"
                                                        :key="'XCARD' + x.id"
                                                    >
                                                        <b-card-header
                                                            header-tag="header"
                                                            role="tab"
                                                            class="
                                                                d-flex
                                                                align-items-center
                                                                justify-content-between
                                                                px-3
                                                                py-1
                                                                cursor-pointer
                                                            "
                                                            @click="
                                                                x.toggleKey =
                                                                    !x.toggleKey
                                                            "
                                                        >
                                                            <div
                                                                class="
                                                                    d-flex
                                                                    align-items-center
                                                                "
                                                            >
                                                                <i
                                                                    class="
                                                                        bx
                                                                        bx-chevron-right
                                                                        rotate
                                                                    "
                                                                    :class="{
                                                                        'rotate-90':
                                                                            x.toggleKey,
                                                                    }"
                                                                ></i
                                                                >{{ x.key }}
                                                            </div>
                                                        </b-card-header>
                                                    </b-card>
                                                    <b-collapse
                                                        :accordion="`technical-review-accordionx-${x.id}${row.item.id}`"
                                                        role="tabpanel"
                                                        :visible="x.toggleKey"
                                                        :key="'XCOL' + x.id"
                                                    >
                                                        <template
                                                            v-for="y in x.data"
                                                        >
                                                            <b-card
                                                                no-body
                                                                class="
                                                                    mb-1
                                                                    ms-2
                                                                "
                                                                :key="
                                                                    'YCARD' +
                                                                    y.id
                                                                "
                                                            >
                                                                <b-card-header
                                                                    header-tag="header"
                                                                    role="tab"
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                        justify-content-between
                                                                        px-3
                                                                        py-1
                                                                        cursor-pointer
                                                                    "
                                                                    @click="
                                                                        y.toggleKey =
                                                                            !y.toggleKey
                                                                    "
                                                                >
                                                                    <div
                                                                        class="
                                                                            d-flex
                                                                            align-items-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bx-chevron-right
                                                                                rotate
                                                                            "
                                                                            :class="{
                                                                                'rotate-90':
                                                                                    y.toggleKey,
                                                                            }"
                                                                        ></i
                                                                        >{{
                                                                            y.key
                                                                        }}
                                                                    </div>
                                                                </b-card-header>
                                                            </b-card>
                                                            <b-collapse
                                                                :accordion="`technical-review-accordiony-${y.id}${row.item.id}`"
                                                                role="tabpanel"
                                                                :visible="
                                                                    y.toggleKey
                                                                "
                                                                :key="
                                                                    'YCOL' +
                                                                    y.id
                                                                "
                                                            >
                                                                <template
                                                                    v-for="z in y.data"
                                                                >
                                                                    <b-card
                                                                        no-body
                                                                        class="
                                                                            mb-1
                                                                            ms-4
                                                                        "
                                                                        :key="
                                                                            'ZCARD' +
                                                                            z.id
                                                                        "
                                                                    >
                                                                        <b-card-header
                                                                            header-tag="header"
                                                                            role="tab"
                                                                            class="
                                                                                d-flex
                                                                                align-items-center
                                                                                justify-content-between
                                                                                px-3
                                                                                py-1
                                                                                cursor-pointer
                                                                            "
                                                                            @click="
                                                                                z.toggleKey =
                                                                                    !z.toggleKey
                                                                            "
                                                                            ><div
                                                                                class="
                                                                                    d-flex
                                                                                    align-items-center
                                                                                "
                                                                            >
                                                                                <i
                                                                                    class="
                                                                                        bx
                                                                                        bx-chevron-right
                                                                                        rotate
                                                                                    "
                                                                                    :class="{
                                                                                        'rotate-90':
                                                                                            z.toggleKey,
                                                                                    }"
                                                                                ></i
                                                                                >{{
                                                                                    z.key
                                                                                }}
                                                                            </div>
                                                                        </b-card-header>
                                                                        <b-collapse
                                                                            :accordion="`technical-review-accordionz-${z.id}${row.item.id}`"
                                                                            role="tabpanel"
                                                                            :visible="
                                                                                z.toggleKey
                                                                            "
                                                                            :key="
                                                                                'YCOL' +
                                                                                z.id
                                                                            "
                                                                        >
                                                                            <template
                                                                                v-for="w in z.data"
                                                                            >
                                                                                <b-card-body
                                                                                    class="
                                                                                        py-1
                                                                                        px-5
                                                                                        bg-primary
                                                                                        bg-soft
                                                                                        mb-1
                                                                                        mt-1
                                                                                    "
                                                                                    :key="
                                                                                        'W' +
                                                                                        w.id
                                                                                    "
                                                                                >
                                                                                    <b-row
                                                                                        class="
                                                                                            my-1
                                                                                        "
                                                                                    >
                                                                                        <b-col
                                                                                            sm="6"
                                                                                        >
                                                                                            <div>
                                                                                                <b
                                                                                                    >Item
                                                                                                    Name:</b
                                                                                                >
                                                                                                {{
                                                                                                    w.itemName
                                                                                                }}
                                                                                            </div>
                                                                                            <div>
                                                                                                <b
                                                                                                    >Description:</b
                                                                                                >
                                                                                                {{
                                                                                                    w.description
                                                                                                }}
                                                                                            </div>
                                                                                        </b-col>
                                                                                        <b-col>
                                                                                            <div>
                                                                                                <b
                                                                                                    >Unit
                                                                                                    Cost:</b
                                                                                                >
                                                                                                {{
                                                                                                    Intl.NumberFormat(
                                                                                                        "ja-JP",
                                                                                                        {
                                                                                                            currency:
                                                                                                                "PHP",
                                                                                                            style: "currency",
                                                                                                        }
                                                                                                    ).format(
                                                                                                        w.unitCost
                                                                                                    )
                                                                                                }}
                                                                                            </div>
                                                                                            <span
                                                                                                class="
                                                                                                    badge
                                                                                                    bg-success
                                                                                                    font-size-13
                                                                                                "
                                                                                                v-if="
                                                                                                    w.isProcurable
                                                                                                "
                                                                                            >
                                                                                                Procurable
                                                                                            </span>
                                                                                            <span
                                                                                                class="
                                                                                                    badge
                                                                                                    bg-info
                                                                                                    font-size-13
                                                                                                "
                                                                                                v-if="
                                                                                                    !w.isProcurable
                                                                                                "
                                                                                            >
                                                                                                Not
                                                                                                Procurable
                                                                                            </span>
                                                                                        </b-col>
                                                                                    </b-row>
                                                                                </b-card-body>
                                                                            </template>
                                                                        </b-collapse>
                                                                    </b-card>
                                                                </template>
                                                            </b-collapse>
                                                        </template>
                                                    </b-collapse>
                                                </template>
                                            </div>
                                        </div>
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
                                            v-model="currentPageFR"
                                            :total-rows="frRows"
                                            :per-page="perPage"
                                        ></b-pagination>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </b-tab>
        </b-tabs>
    </Layout>
</template>