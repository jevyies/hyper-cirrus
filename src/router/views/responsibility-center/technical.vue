<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { groupBy, cloneDeep } from "lodash";
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
            title: "Responsibility Center [Technical Review]",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Responsibility Center [Technical Review]",
                    active: true,
                },
            ],
            tfr: [],
            tr: [],
            cycles: [],
            perPage: 10,
            pageOptions: [10, 25, 50, 100],
            sortByTR: "name",
            sortDesc: false,
            trFields: [
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
                    key: "status",
                    thStyle: { width: "200px" },
                },
                {
                    key: "action",
                    thStyle: { width: "150px" },
                },
            ],
            indexSelected: -1,
            itemSelected: {},
            form: {
                id: "",
                remarks: "",
            },

            // tfr
            filterTFR: "",
            currentPageTFR: 1,
            filterOnTFR: [],
            totalRowsTFR: 1,
            tfrBusy: false,

            // TR
            filterTR: "",
            currentPageTR: 1,
            filterOnTR: [],
            totalRowsTR: 1,
            trBusy: false,
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
        this.getTFR(this.$store.state.data.cycle);
        this.getTR(this.$store.state.data.cycle);
    },
    computed: {
        setCycle: {
            get() {
                return this.$store.state.data.cycle;
            },
            set(newValue) {
                this.getTFR(newValue);
                this.getTR(newValue);
                return newValue;
            },
        },
        ffrRows() {
            return this.tfr.length;
        },
        frRows() {
            return this.tr.length;
        },
    },
    methods: {
        getPercentage(x, y) {
            let percent = (x / y) * 100;
            let decimal = percent.toFixed(2);
            let number = decimal.split(".");
            if (number[1] > 0) {
                return number[0] + "." + number[1];
            }
            return percent;
        },
        // tfr
        onFilteredTFR(filteredItems) {
            this.totalRowsTFR = filteredItems.length;
            this.currentPageTFR = 1;
        },
        getTFR(data) {
            this.tfrBusy = true;
            var id = 1;
            this.$store
                .dispatch("responsibilitycenter/GetReviewTechnical", data)
                .then((res) => {
                    res.data.forEach((item) => {
                        item.totalAmt = new Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(item.totalResources);
                        item.numberOfApproved = 0;
                        item.apiResources.forEach((x) => {
                            if (
                                x.technicalReviewStatus
                                    .toUpperCase()
                                    .includes("APPROVE")
                            ) {
                                item.numberOfApproved++;
                            }
                            x.toggleItem = false;
                        });
                        var grouped = groupBy(
                            item.apiResources,
                            "itemCategory.name"
                        );
                        item.groupItems = [];
                        for (const y in grouped) {
                            var totalApproved = 0;
                            grouped[y].forEach((z) => {
                                if (
                                    z.technicalReviewStatus
                                        .toUpperCase()
                                        .includes("APPROVE")
                                ) {
                                    totalApproved++;
                                }
                            });
                            item.groupItems.push({
                                id: id++,
                                name: y,
                                toggleKey: true,
                                data: grouped[y],
                                totalApproved: totalApproved,
                            });
                        }
                    });
                    this.tfr = res.data;
                    this.tfrBusy = false;
                })
                .catch((err) => {
                    this.tfrBusy = false;
                    this.showToast('Something went wrong!', 'error');
                });
        },

        // TR
        onFilteredTR(filteredItems) {
            this.totalRowsTFR = filteredItems.length;
            this.currentPageTFR = 1;
        },
        getTR(data) {
            this.$store
                .dispatch("responsibilitycenter/GetReviewedTechnical", data)
                .then((res) => {
                    var id = 1;
                    res.data.forEach((item) => {
                        item.totalAmt = new Intl.NumberFormat("ja-JP", {
                            currency: "PHP",
                            style: "currency",
                        }).format(item.totalResources);
                        item.numberOfApproved = 0;
                        item.apiResources.forEach((x) => {
                            if (
                                x.technicalReviewStatus
                                    .toUpperCase()
                                    .includes("APPROVE")
                            ) {
                                item.numberOfApproved++;
                            }
                            x.toggleItem = false;
                        });
                        // var grouped = groupBy(
                        //     item.apiResources,
                        //     "itemCategory.name"
                        // );
                        // item.groupItems = [];
                        // for (const y in grouped) {
                        //     var totalApproved = 0;
                        //     grouped[y].forEach((z) => {
                        //         if (z.technicalReviewStatus) {
                        //             totalApproved++;
                        //         }
                        //     });
                        //     item.groupItems.push({
                        //         id: id++,
                        //         name: y,
                        //         toggleKey: false,
                        //         data: grouped[y],
                        //         totalApproved: totalApproved,
                        //     });
                        // }
                    });
                    this.tr = res.data;
                })
                .catch(() => {
                    this.showToast('Something went wrong!', 'error');
                });
        },
        viewItems(row) {
            row.toggleDetails();
        },
        approveItem(x, y, row) {
            var index = this.tfr.indexOf(row);
            this.$store
                .dispatch("responsibilitycenter/ApproveTechnical", x.id)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, 'warning');
                    }
                    row.numberOfApproved++;
                    x.technicalReviewStatus = "APPROVED";
                    y.totalApproved++;
                    this.showToast('Successfully approved', 'success');
                    setTimeout(() => {
                        if (row.numberOfApproved == row.apiResources.length) {
                            this.tr.push(row);
                            this.tfr.splice(index, 1);
                        }
                    }, 1000);
                })
                .catch(() => {
                    this.showToast('Something went wrong!', 'error');
                });
        },
        returnItem(x) {
            this.itemSelected = x;
            this.form.id = this.itemSelected.id;
            this.form.remarks = "";
            this.$bvModal.show("return-modal");
        },
        returnSubmit() {
            this.$store
                .dispatch("responsibilitycenter/ReturnTechnical", this.form)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, 'warning');
                    }
                    this.itemSelected.technicalReviewStatus = "RETURN";
                    this.$bvModal.hide("return-modal");
                    this.showToast('Successfully returned', 'success');
                })
                .catch((err) => {
                    this.showToast('Something went wrong!', 'error');
                });
        },
        hideModal() {
            this.$bvModal.hide("return-modal");
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
            <form @submit.prevent="returnSubmit" class="needs-validation">
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
                        Return Resource Item
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
                                        class="form-select "
                                        v-model="setCycle"
                                        size="sm"
                                        :options="cycles"
                                        @change="getTFR($event)"
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
                                            v-model="filterTFR"
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
                                :items="tfr"
                                :fields="trFields"
                                responsive="sm"
                                :per-page="perPage"
                                :current-page="currentPageTR"
                                :sort-by.sync="sortByTR"
                                :sort-desc.sync="sortDesc"
                                :filter="filterTFR"
                                :filter-included-fields="filterOnTR"
                                :busy="tfrBusy"
                                @filtered="onFilteredTR"
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
                                <template #cell(action)="row">
                                    <div class="d-flex justify-content-center">
                                        <a
                                            href="javascript:void(0);"
                                            @click="viewItems(row)"
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
                                </template>
                                <template #cell(status)="row">
                                    <b-progress
                                        :value="
                                            row.item.numberOfApproved == 0
                                                ? 0.01
                                                : row.item.numberOfApproved
                                        "
                                        :max="row.item.apiResources.length"
                                        variant="success"
                                    ></b-progress>
                                    <div class="text-center">
                                        <small
                                            >{{
                                                getPercentage(
                                                    row.item.numberOfApproved,
                                                    row.item.apiResources.length
                                                )
                                            }}% Approved</small
                                        >
                                    </div>
                                </template>
                                <template #cell(name)="data">
                                    <a
                                        href="javascript:void(0);"
                                        class="d-flex justify-content-start"
                                    >
                                        <b class="text-white">{{
                                            data.item.name
                                        }}</b>
                                        <div>
                                            <span
                                                class="
                                                    badge
                                                    rounded-pill
                                                    bg-danger
                                                    float-end
                                                "
                                                style="font-size: 8px"
                                                >{{
                                                    data.item.notification > 0
                                                        ? data.item.notification
                                                        : ""
                                                }}</span
                                            >
                                        </div>
                                    </a>
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
                                    <div role="tablist">
                                        <template
                                            v-for="y in row.item.groupItems"
                                        >
                                            <b-card
                                                no-body
                                                class="mb-1"
                                                :key="y.id"
                                            >
                                                <b-card-header
                                                    header-tag="header"
                                                    role="tab"
                                                    class="
                                                        d-flex
                                                        align-items-center
                                                        justify-content-between
                                                    "
                                                >
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                            w-75
                                                        "
                                                    >
                                                        <h6 class="m-0 me-2" :id="y.id">
                                                            {{ y.name }}
                                                        </h6>
                                                        <a
                                                            @click="
                                                                y.toggleKey =
                                                                    !y.toggleKey
                                                            "
                                                            class="text-success"
                                                            href="javascript: void(0);"
                                                            >[{{
                                                                !y.toggleKey
                                                                    ? "Show Grouped Details"
                                                                    : "Hide Grouped Details"
                                                            }}]</a
                                                        >
                                                    </div>
                                                    <div
                                                        class="w-10 text-right"
                                                    >
                                                        <b-progress
                                                            :value="
                                                                y.totalApproved ==
                                                                0
                                                                    ? 0.001
                                                                    : y.totalApproved
                                                            "
                                                            :max="y.data.length"
                                                            variant="info"
                                                        ></b-progress>
                                                        {{
                                                            getPercentage(
                                                                y.totalApproved,
                                                                y.data.length
                                                            )
                                                        }}% Approved
                                                    </div>
                                                </b-card-header>
                                                <b-collapse
                                                    :accordion="`technical-review-accordion-${y.id}`"
                                                    role="tabpanel"
                                                    :visible="y.toggleKey"
                                                >
                                                    <template
                                                        v-for="x in y.data"
                                                    >
                                                        <b-card
                                                            no-body
                                                            class="my-1 mx-4"
                                                            :key="x.id"
                                                        >
                                                            <b-card-header
                                                                header-tag="header"
                                                                role="tab"
                                                                class="
                                                                    d-flex
                                                                    align-items-center
                                                                    justify-content-between
                                                                    bg-primary
                                                                    bg-soft
                                                                "
                                                            >
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                    "
                                                                >
                                                                    <h6
                                                                        class="
                                                                            m-0
                                                                            me-2
                                                                        "
                                                                    >
                                                                        {{
                                                                            x.itemName
                                                                        }}
                                                                    </h6>
                                                                    <a
                                                                        @click="
                                                                            x.toggleItem =
                                                                                !x.toggleItem
                                                                        "
                                                                        class="
                                                                            text-primary
                                                                        "
                                                                        href="javascript: void(0);"
                                                                        >[{{
                                                                            !x.toggleItem
                                                                                ? "Show Details"
                                                                                : "Hide Details"
                                                                        }}]</a
                                                                    >
                                                                </div>
                                                                <div
                                                                    class="
                                                                        d-flex
                                                                        w-25
                                                                        justify-content-end
                                                                    "
                                                                    v-if="
                                                                        x.technicalReviewStatus.toUpperCase() ===
                                                                        'PENDING'
                                                                    "
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        class="
                                                                            btn
                                                                            btn-warning
                                                                            btn-sm
                                                                            me-2
                                                                            d-flex
                                                                            align-items-center
                                                                        "
                                                                        @click="
                                                                            returnItem(
                                                                                x,
                                                                                row.item
                                                                            )
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bx-x
                                                                            "
                                                                        ></i
                                                                        >Return
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        class="
                                                                            btn
                                                                            btn-success
                                                                            btn-sm
                                                                            d-flex
                                                                            align-items-center
                                                                        "
                                                                        @click="
                                                                            approveItem(
                                                                                x,
                                                                                y,
                                                                                row.item
                                                                            )
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bx-check
                                                                            "
                                                                        ></i
                                                                        >Approve
                                                                    </button>
                                                                </div>
                                                                <div
                                                                    v-else-if="
                                                                        x.technicalReviewStatus.toUpperCase() ===
                                                                        'APPROVED'
                                                                    "
                                                                    class="
                                                                        d-flex
                                                                        w-25
                                                                        justify-content-end
                                                                    "
                                                                >
                                                                    <span
                                                                        class="
                                                                            badge
                                                                            bg-success
                                                                            font-size-12
                                                                            d-flex
                                                                            align-items-center
                                                                        "
                                                                    >
                                                                        <i
                                                                            class="
                                                                                bx
                                                                                bx-check-double
                                                                            "
                                                                        ></i
                                                                        >Approved
                                                                    </span>
                                                                </div>
                                                                <div
                                                                    v-else
                                                                    class="
                                                                        d-flex
                                                                        w-25
                                                                        justify-content-end
                                                                    "
                                                                >
                                                                    <small
                                                                        >This
                                                                        item was
                                                                        returned.
                                                                        Waiting
                                                                        for
                                                                        changes.</small
                                                                    >
                                                                </div>
                                                            </b-card-header>
                                                            <b-collapse
                                                                :accordion="`technical-review-accordion-${x.id}`"
                                                                role="tabpanel"
                                                                :visible="
                                                                    x.toggleItem
                                                                "
                                                            >
                                                                <b-card-body
                                                                    class="p-2"
                                                                >
                                                                    <b-row>
                                                                        <b-col
                                                                            sm="6"
                                                                        >
                                                                            <div>
                                                                                <b
                                                                                    >Item
                                                                                    Name:</b
                                                                                >
                                                                                {{
                                                                                    x.itemName
                                                                                }}
                                                                            </div>
                                                                            <div>
                                                                                <b
                                                                                    >Description:</b
                                                                                >
                                                                                {{
                                                                                    x.description
                                                                                }}
                                                                            </div>
                                                                        </b-col>
                                                                        <b-col>
                                                                            <div>
                                                                                <b
                                                                                    >Item
                                                                                    Category:</b
                                                                                >
                                                                                {{
                                                                                    x
                                                                                        .itemCategory
                                                                                        .name
                                                                                }}
                                                                            </div>
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
                                                                                        x.unitCost
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
                                                                                    x.isProcurable
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
                                                                                    !x.isProcurable
                                                                                "
                                                                            >
                                                                                Not
                                                                                Procurable
                                                                            </span>
                                                                        </b-col>
                                                                    </b-row>
                                                                </b-card-body>
                                                            </b-collapse>
                                                        </b-card>
                                                    </template>
                                                </b-collapse>
                                            </b-card>
                                        </template>
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
                                            v-model="currentPageTR"
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
                                        class="form-select "
                                        v-model="setCycle"
                                        size="sm"
                                        :options="cycles"
                                        @change="getTR($event)"
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
                                            v-model="filterTFR"
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
                                :items="tr"
                                :fields="trFields"
                                responsive="sm"
                                :per-page="perPage"
                                :current-page="currentPageTR"
                                :sort-by.sync="sortByTR"
                                :sort-desc.sync="sortDesc"
                                :filter="filterTFR"
                                :filter-included-fields="filterOnTR"
                                :busy="trBusy"
                                @filtered="onFilteredTR"
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
                                <template #cell(action)="row">
                                    <div class="d-flex justify-content-center">
                                        <a
                                            href="javascript:void(0);"
                                            @click="viewItems(row)"
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
                                    <div role="tablist">
                                        <template
                                            v-for="x in row.item.apiResources"
                                        >
                                            <b-card
                                                no-body
                                                class="my-1 mx-4"
                                                :key="x.id"
                                            >
                                                <b-card-header
                                                    header-tag="header"
                                                    role="tab"
                                                    class="
                                                        d-flex
                                                        align-items-center
                                                        justify-content-between
                                                        bg-primary bg-soft
                                                    "
                                                >
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                        "
                                                    >
                                                        <h6 class="m-0 me-2" :id="x.id">
                                                            {{ x.itemName }}
                                                        </h6>
                                                        <a
                                                            @click="
                                                                x.toggleItem =
                                                                    !x.toggleItem
                                                            "
                                                            class="text-primary"
                                                            href="javascript: void(0);"
                                                            >[{{
                                                                !x.toggleItem
                                                                    ? "Show Details"
                                                                    : "Hide Details"
                                                            }}]</a
                                                        >
                                                    </div>
                                                    <div
                                                        v-if="
                                                            x.technicalReviewStatus.toUpperCase() ===
                                                            'APPROVED'
                                                        "
                                                        class="
                                                            d-flex
                                                            w-25
                                                            justify-content-end
                                                        "
                                                    >
                                                        <span
                                                            class="
                                                                badge
                                                                bg-success
                                                                font-size-12
                                                                d-flex
                                                                align-items-center
                                                            "
                                                        >
                                                            <i
                                                                class="
                                                                    bx
                                                                    bx-check-double
                                                                "
                                                            ></i
                                                            >Approved
                                                        </span>
                                                    </div>
                                                    <div
                                                        v-else
                                                        class="
                                                            d-flex
                                                            w-25
                                                            justify-content-end
                                                        "
                                                    >
                                                        <small
                                                            >This item was
                                                            returned. Waiting
                                                            for changes.</small
                                                        >
                                                    </div>
                                                </b-card-header>
                                                <b-collapse
                                                    :accordion="`technical-review-accordion-${x.id}`"
                                                    role="tabpanel"
                                                    :visible="x.toggleItem"
                                                >
                                                    <b-card-body class="p-2">
                                                        <b-row>
                                                            <b-col sm="6">
                                                                <div>
                                                                    <b
                                                                        >Item
                                                                        Name:</b
                                                                    >
                                                                    {{
                                                                        x.itemName
                                                                    }}
                                                                </div>
                                                                <div>
                                                                    <b
                                                                        >Description:</b
                                                                    >
                                                                    {{
                                                                        x.description
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
                                                                            x.unitCost
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
                                                                        x.isProcurable
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
                                                                        !x.isProcurable
                                                                    "
                                                                >
                                                                    Not
                                                                    Procurable
                                                                </span>
                                                            </b-col>
                                                        </b-row>
                                                    </b-card-body>
                                                </b-collapse>
                                            </b-card>
                                        </template>
                                    </div>
                                </template>
                                 <template #cell(name)="data">
                                    <a
                                        href="javascript:void(0);"
                                        class="d-flex justify-content-start"
                                    >
                                        <b class="text-white">{{
                                            data.item.name
                                        }}</b>
                                        <div>
                                            <span
                                                class="
                                                    badge
                                                    rounded-pill
                                                    bg-danger
                                                    float-end
                                                "
                                                style="font-size: 8px"
                                                >{{
                                                    data.item.notification > 0
                                                        ? data.item.notification
                                                        : ""
                                                }}</span
                                            >
                                        </div>
                                    </a>
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
                                            v-model="currentPageTR"
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