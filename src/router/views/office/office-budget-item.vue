<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { cloneDeep, groupBy } from "lodash";
import { Carousel, Slide } from "vue-carousel";
import Loader from "@/components/widgets/loader.vue";
import ApiResourceLogs from "@/components/modals/api-resource-logs.vue";
import PrintOptions from "@/components/modals/print-options.vue";

export default {
    page: {
        title: "My Budget Items",
    },
    components: {
        Layout,
        PageHeader,
        Carousel,
        Slide,
        Loader,
        ApiResourceLogs,
        PrintOptions
    },
    data() {
        return {
            title: "My Budget Items",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "My Budget Items",
                    active: true,
                },
            ],
            budgetData: [],
            modalTitle: "",
            currentPageBudget: 1,
            perPageBudget: 10,
            pageOptions: [10, 25, 50, 100],
            filterBudget: "",
            filterOn: [],
            form: {
                id: 0,
            },
            indexSelected: -1,
            tableBusy: false,
            selectedBudget: "",
            selectedBudgetAmount: 0,
            selectedBudgetId: 0,
            selectedPPMPStatus: "",
            // items
            itemList: [],
            filterItem: "",
            perPageItem: 10,
            currentPageItem: 1,
            resourceItems: [],
            bliExpired: false,
            itemLoading: false,
            item: {
                id: 0,
                itemName: "",
                description: "",
                unitId: "",
                type: "NON-CSE",
                itemCategoryId: "",
                unitCost: "0",
                cseId: 0,
                apiId: 0,
                deliveryUnitBudgetItemId: 0,
                isProcurable: false,
            },
            itemCategory: "",
            unit: "",
            // details
            itemDetails: [],
            itemDetailFields: [
                {
                    key: "month.monthName",
                    label: "Month",
                    variant: "primary",
                },
                {
                    key: "quantity",
                    label: "Qty",
                    variant: "primary",
                    thStyle: { width: "120px" },
                },
                {
                    label: "Total",
                    key: "total",
                    variant: "primary",
                    thStyle: { width: "200px" },
                },
            ],
            detail: {
                id: 0,
                monthId: 0,
                quantity: "0",
                totalAmt: 0,
            },
        };
    },
    computed: {
        filteredBudget() {
            let data = this.budgetData;
            var total = this.currentPageBudget * this.perPageBudget;
            if (this.filterBudget.trim() != "" && this.filterBudget) {
                data = data.filter((item) => {
                    return item.objectOfExpenditure.account.accountName
                        .toUpperCase()
                        .includes(this.filterBudget.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageBudget, total);
            if (this.currentPageBudget > 1 && currentData.length == 0) {
                total = (this.currentPageBudget - 1) * this.perPageBudget;
                currentData = data.slice(total - this.perPageBudget, total);
            }
            var groupedFS = groupBy(currentData, "fundSource");
            var grouped = [];
            var id = 1;
            var FCID = 1;
            var AGID = 1;
            for (const key in groupedFS) {
                var group = groupBy(groupedFS[key], "fundClass");
                var FC = [];
                for (const y in group) {
                    var agGrp = groupBy(group[y], "accountGroup");
                    var ag = [];
                    for (const z in agGrp) {
                        ag.push({
                            id: AGID++,
                            data: agGrp[z],
                            key: z,
                        });
                    }
                    FC.push({
                        id: FCID++,
                        data: ag,
                        key: y,
                    });
                }
                grouped.push({ id: id++, fsName: key, data: FC, fsId: FC[0].data[0].data[0].objectOfExpenditure.fundSourceId });
            }
            return grouped;
        },
        rowsBudget() {
            if (this.filterBudget.trim() != "" && this.filterBudget) {
                return this.filteredBudget.length;
            } else {
                return this.budgetData.length;
            }
        },
        filteredResourceItems() {
            let data = this.resourceItems;
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
            return currentData;
        },
        rowsResourceItem() {
            if (this.filterItem.trim() != "" && this.filterItem) {
                return this.filteredResourceItems.length;
            } else {
                return this.resourceItems.length;
            }
        },
        totalBudget() {
            var totalBalance = this.selectedBudgetAmount;
            return (totalBalance -= parseFloat(this.detail.totalAmt));
        },
        quantityTotal() {
            var data = this.itemDetails;
            return data.reduce((pv, cv) => {
                return parseFloat(pv) + parseFloat(cv.quantity);
            }, 0);
        },
        amountTotal() {
            var data = this.itemDetails;
            var sum = data.reduce((pv, cv) => {
                return parseFloat(pv) + parseFloat(cv.totalAmt);
            }, 0);
            return Intl.NumberFormat("ja-JP", {
                currency: "PHP",
                style: "currency",
            }).format(sum);
        },
    },
    created() {
        this.$store
            .dispatch("month/GetAllMonths")
            .then((res) => {
                this.months = res.data;
            })
            .catch((err) => {
                this.showToast("Something went wrong!","error");
            });
        this.changeCycle(this.$store.state.data.cycle);
    },
    methods: {
        changeCycle(cycle) {
            this.getOfficeBudget(cycle);
        },
        totalResourceItemAmt() {
            var data = this.resourceItems;
            var sum = 0;
            data.forEach((item) => {
                sum += parseFloat(item.total);
            });
            return Intl.NumberFormat("ja-JP", {
                currency: "PHP",
                style: "currency",
            }).format(sum);
        },
        getOfficeBudget(event) {
            this.budgetData = [];
            this.tableBusy = true;
            this.$store
                .dispatch("officebudgetitem/GetMyOfficeBudgetItem", event)
                .then((res) => {
                    res.data.forEach((item) => {
                        var date1 = new Date();
                        var date2 = new Date(item.expiry);
                        var diffTime = date2 - date1;
                        var diffDays = Math.ceil(
                            diffTime / (1000 * 60 * 60 * 24)
                        );
                        item.fundClass =
                            item.objectOfExpenditure.account.accountGroup.fundClassification.classification;
                        item.fundSource =
                            item.objectOfExpenditure.fundSource.sourceName;
                        item.accountGroup =
                            item.objectOfExpenditure.account.accountGroup.groupName;
                    });
                    this.tableBusy = false;
                    this.budgetData = res.data;
                    this.$refs.carousel.goToPage(0);
                })
                .catch(() => {
                    this.tableBusy = false;
                    this.alert = {
                        type: "danger",
                        message: "Something went wrong!",
                    };
                });
        },
        viewItems(row) {
            this.bliExpired = row.expired;
            this.selectedBudget = row.objectOfExpenditure.account.accountName;
            this.selectedBudgetId = row.id;
            this.selectedBudgetAmount = row.balance;
            this.selectedResourceStatus = row.status;
            this.budgetIndex = this.budgetData.indexOf(row);
            this.title = "Resource Items";
            this.$refs.carousel.goToPage(this.$refs.carousel.getNextPage());
            this.getResourceDetails(row.id);
            this.scrollToTop()
        },
        getResourceDetails(id) {
            this.resourceItems = [];
            this.itemLoading = true;
            this.$store
                .dispatch("apiresource/GetResourceItemByBudget", id)
                .then((res) => {
                    res.data.forEach((item) => {
                        var totalQty = 0;
                        item.apiResourceDetails.forEach((x) => {
                            totalQty += x.quantity;
                        });
                        item.quantity = totalQty;
                        item.total =
                            parseFloat(totalQty) * parseFloat(item.unitCost);
                    });
                    this.resourceItems = res.data;
                    this.itemLoading = false;
                })
                .catch(() => {
                    this.itemLoading = false;
                    this.showToast("Something went wrong!","error");
                });
        },
        returnToBudget() {
            this.title = "Resources For:";
            this.$refs.carousel.goToPage(this.$refs.carousel.getPreviousPage());
        },
        hideModalDetail() {
            this.$bvModal.hide("create-item-modal");
        },
        viewItemLogs({ id }) {
            this.$refs.itemlog.getData(id);
            this.$bvModal.show("api-resoure-log-modal");
        },
        viewResourceItem(props) {
            this.item = cloneDeep(props);
            this.item.unitCost = props.unitCost.toString();
            this.unit = props.unit.shortName;
            this.itemCategory = props.itemCategory.name;
            this.itemIndex = this.resourceItems.indexOf(props);
            this.selectedBudgetAmount = cloneDeep(
                this.budgetData[this.budgetIndex].balance
            );
            this.modalTitle = "View Resource Item";
            this.$bvModal.show("create-item-modal");
            props.apiResourceDetails.forEach((item) => {
                item.totalAmt =
                    parseFloat(item.quantity) * parseFloat(props.unitCost);
                item.total = Intl.NumberFormat("ja-JP", {
                    currency: "PHP",
                    style: "currency",
                }).format(item.totalAmt);
            });
            this.itemDetails = props.apiResourceDetails;
        },
        printPPMP(id){
            this.$refs.printOpt.putOptions({apiUrl: 'api/Api/Print/My/PPMP', routeVariables: [this.$store.state.data.cycle, id]})
            this.$bvModal.show('print-options-modal')
        }
    },
};
</script>

<template>
    <Layout @changeCycle="changeCycle">
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="create-item-modal"
            :title="modalTitle"
            size="lg"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <div class="mb-2">
                <label for="itemName" class="mb-0">Item Name</label>
                <input
                    autocomplete="off"
                    type="text"
                    placeholder="Input/Search Item..."
                    class="form-control"
                    disabled
                    v-model="item.itemName"
                />
            </div>
            <b-row class="mb-2">
                <b-col sm="9">
                    <label for="description" class="mb-0">Description </label>
                    <input
                        autocomplete="off"
                        id="name"
                        type="text"
                        v-model="item.description"
                        placeholder="Enter Description..."
                        class="form-control"
                        disabled
                    />
                </b-col>
                <b-col sm="3">
                    <label for="name" class="mb-0">Type </label>
                    <b-form-select
                        id="type"
                        v-model="item.type"
                        class="form-select custom-select"
                        disabled
                    >
                        <option></option>
                        <option>CSE</option>
                        <option>NON-CSE</option>
                    </b-form-select>
                </b-col>
            </b-row>
            <b-row class="mb-2">
                <b-col sm="5">
                    <label for="itemCategoryId" class="mb-0"
                        >Item Category
                    </label>
                    <input
                        autocomplete="off"
                        type="text"
                        disabled
                        placeholder="Search Item Category..."
                        class="form-control"
                        v-model="itemCategory"
                    />
                </b-col>
                <b-col sm="3">
                    <label for="unitId" class="mb-0">Unit </label>
                    <input
                        autocomplete="off"
                        type="text"
                        disabled
                        placeholder="Search Unit..."
                        class="form-control"
                        v-model="unit"
                    />
                </b-col>
                <b-col sm="4">
                    <label for="unitId" class="mb-0">Unit Cost</label>
                    <input
                        autocomplete="off"
                        id="unitId"
                        type="text"
                        v-model="item.unitCost"
                        class="form-control text-right"
                        disabled
                    />
                </b-col>
            </b-row>
            <b-row class="mb-2">
                <b-col>
                    <b-table
                        striped
                        hover
                        :items="itemDetails"
                        :fields="itemDetailFields"
                        show-empty
                    >
                        <template #empty="scope">
                            <div class="text-center">
                                {{ scope.emptyText }}
                            </div>
                        </template>
                        <template #custom-foot>
                            <b-tr>
                                <b-th>Total</b-th>
                                <b-th>{{ quantityTotal }}</b-th>
                                <b-th>{{ amountTotal }}</b-th>
                            </b-tr>
                        </template>
                    </b-table>
                </b-col>
            </b-row>
            <div class="modal-footer">
                <button
                    type="button"
                    class="btn btn-link"
                    @click="hideModalDetail"
                >
                    Close
                </button>
            </div>
        </b-modal>
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
                <div class="row">
                    <div class="col-md-6 d-flex">
                        <div
                            id="tickets-table_filter"
                            class="dataTables_filter me-1"
                        >
                            <label class="d-inline-flex align-items-center">
                                <b-form-input
                                    autocomplete="off"
                                    v-model="filterBudget"
                                    type="search"
                                    placeholder="Search Budget..."
                                    class="form-control"
                                ></b-form-input>
                            </label>
                        </div>
                        <div
                            id="tickets-table_length"
                            class="dataTables_length"
                        >
                            <label
                                class="d-inline-flex align-items-center mb-0"
                            >
                                <b-form-select
                                    class="form-select"
                                    v-model="perPageBudget"
                                    size="sm"
                                    :options="pageOptions"
                                ></b-form-select>
                            </label>
                        </div>
                    </div>
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
                                            <th scope="col" width="100px"></th>
                                            <th scope="col">Description</th>
                                            <th scope="col" width="250px">
                                                Budget Allocated
                                            </th>
                                            <th scope="col" width="250px">
                                                Balance
                                            </th>
                                            <th scope="col" width="200px">
                                                Expiry
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
                                        <tr v-if="tableBusy">
                                            <td colspan="6">
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
                                                        <div class="status">
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
                                                    <strong>Loading...</strong>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr
                                            v-if="
                                                budgetData.length == 0 &&
                                                !tableBusy
                                            "
                                        >
                                            <td
                                                colspan="6"
                                                class="text-muted text-center"
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
                                        <template
                                            v-for="y in filteredBudget"
                                        >
                                            <tr
                                                :key="'A' + y.id"
                                                style="
                                                    background-color: transparent;
                                                    box-shadow: none;
                                                "
                                            >
                                                <td
                                                    colspan="6"
                                                    class="py-0"
                                                >
                                                    <div
                                                        class="
                                                            d-flex
                                                            align-items-center
                                                        "
                                                    >
                                                        <span
                                                            class="
                                                                bx
                                                                bx-star
                                                                text-warning
                                                                me-1
                                                            "
                                                            style="
                                                                line-height: unset;
                                                            "
                                                        ></span>
                                                        <h5
                                                            class="
                                                                text-dark
                                                                mb-0
                                                                me-2
                                                            "
                                                        >
                                                            {{
                                                                y.fsName
                                                            }}
                                                        </h5>
                                                        <button type="button" class="btn btn-outline-purple btn-sm" @click="printPPMP(y.fsId)"><i class="bx bx-printer"></i> Print PPMP</button>
                                                    </div>
                                                </td>
                                            </tr>
                                            <template
                                                v-for="z in y.data"
                                            >
                                                <tr
                                                    :key="'B' + z.id"
                                                    style="
                                                        background-color: transparent;
                                                        box-shadow: none;
                                                    "
                                                >
                                                    <td
                                                        colspan="6"
                                                        class="p-0-20p"
                                                    >
                                                        <div
                                                            class="
                                                                d-flex
                                                                align-item-center
                                                            "
                                                        >
                                                            <span
                                                                class="
                                                                    bx
                                                                    bx-checkbox-square
                                                                    text-success
                                                                    me-1
                                                                "
                                                                style="
                                                                    line-height: unset;
                                                                "
                                                            ></span>
                                                            <b
                                                                class="
                                                                    text-dark
                                                                "
                                                                >{{
                                                                    z.key
                                                                }}</b
                                                            >
                                                        </div>
                                                    </td>
                                                </tr>
                                                <template
                                                    v-for="w in z.data"
                                                >
                                                    <tr
                                                        :key="
                                                            'W' + w.id
                                                        "
                                                        style="
                                                            background-color: transparent;
                                                            box-shadow: none;
                                                        "
                                                    >
                                                        <td
                                                            colspan="6"
                                                            class="
                                                                p-0-40p
                                                            "
                                                        >
                                                            <div
                                                                class="
                                                                    d-flex
                                                                    align-item-center
                                                                "
                                                            >
                                                                <span
                                                                    class="
                                                                        bx
                                                                        bxs-polygon
                                                                        text-primary
                                                                        me-1
                                                                    "
                                                                    style="
                                                                        line-height: unset;
                                                                    "
                                                                ></span>
                                                                <b
                                                                    class="
                                                                        text-dark
                                                                    "
                                                                >
                                                                    {{
                                                                        w.key
                                                                    }}</b
                                                                >
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr
                                                        v-for="x in w.data"
                                                        :key="x.id"
                                                        style="
                                                            background-color: transparent;
                                                            box-shadow: none;
                                                        "
                                                    >
                                                        <td></td>
                                                        <td
                                                            class="
                                                                bg-table-tr
                                                            "
                                                        >
                                                            <h5
                                                                class="
                                                                    text-truncate
                                                                    font-size-14
                                                                    mb-0
                                                                    d-flex
                                                                "
                                                            >
                                                                <a
                                                                    href="javascript: void(0);"
                                                                    class="
                                                                        text-dark
                                                                    "
                                                                    @click="
                                                                        viewItems(
                                                                            x
                                                                        )
                                                                    "
                                                                    >{{
                                                                        x
                                                                            .objectOfExpenditure
                                                                            .account
                                                                            .accountName
                                                                    }}</a
                                                                >
                                                                <div>
                                                                    <span
                                                                        class="
                                                                            badge
                                                                            rounded-pill
                                                                            bg-danger
                                                                            float-end
                                                                        "
                                                                        style="
                                                                            font-size: 8px;
                                                                        "
                                                                        >{{
                                                                            x.notification >
                                                                            0
                                                                                ? x.notification
                                                                                : ""
                                                                        }}</span
                                                                    >
                                                                </div>
                                                            </h5>
                                                            <small>{{
                                                                x
                                                                    .objectOfExpenditure
                                                                    .prexc
                                                                    .prexcName
                                                            }}</small>
                                                        </td>
                                                        <td
                                                            class="
                                                                bg-table-tr
                                                            "
                                                        >
                                                            {{
                                                                new Intl.NumberFormat(
                                                                    "ja-JP",
                                                                    {
                                                                        currency:
                                                                            "PHP",
                                                                        style: "currency",
                                                                    }
                                                                ).format(
                                                                    x.allocated
                                                                )
                                                            }}
                                                        </td>
                                                        <td
                                                            class="
                                                                bg-table-tr
                                                            "
                                                        >
                                                            {{
                                                                new Intl.NumberFormat(
                                                                    "ja-JP",
                                                                    {
                                                                        currency:
                                                                            "PHP",
                                                                        style: "currency",
                                                                    }
                                                                ).format(
                                                                    x.balance
                                                                )
                                                            }}
                                                        </td>
                                                        <td
                                                            class="
                                                                bg-table-tr
                                                            "
                                                        >
                                                            <span
                                                                v-if="
                                                                    !x.expired
                                                                "
                                                                >Expires
                                                                on
                                                                {{
                                                                    formatDate(
                                                                        new Date(
                                                                            x.expiry
                                                                        )
                                                                    )
                                                                }}</span
                                                            >
                                                            <span
                                                                v-else
                                                                class="
                                                                    badge
                                                                    bg-warning
                                                                    bg-soft
                                                                    text-warning
                                                                    fs-6
                                                                "
                                                                ><b
                                                                    >Expired</b
                                                                ></span
                                                            >
                                                        </td>
                                                        <td
                                                            class="
                                                                text-center
                                                                bg-table-tr
                                                            "
                                                        >
                                                            <div
                                                                class="
                                                                    d-flex
                                                                    justify-content-center
                                                                "
                                                            >
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    @click="
                                                                        viewItems(
                                                                            x
                                                                        )
                                                                    "
                                                                    class="
                                                                        d-flex
                                                                        align-items-center
                                                                    "
                                                                >
                                                                    <span
                                                                        >View
                                                                        Items</span
                                                                    >
                                                                    <i
                                                                        title="View Items"
                                                                        class="
                                                                            mdi
                                                                            mdi-chevron-right
                                                                            font-size-18
                                                                            text-primary
                                                                            cursor-pointer
                                                                        "
                                                                    ></i>
                                                                </a>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </template>
                                            </template>
                                        </template>
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
                            <ul class="pagination pagination-rounded mb-0">
                                <!-- pagination -->
                                <b-pagination
                                    v-model="currentPageBudget"
                                    :total-rows="rowsBudget"
                                    :per-page="perPageBudget"
                                ></b-pagination>
                            </ul>
                        </div>
                    </div>
                </div>
            </slide>
            <slide>
                <div class="row">
                    <b-col sm="6">
                        <div class="d-flex align-items-center">
                            <a
                                href="javascript:void(0);"
                                class="me-1"
                                @click="returnToBudget()"
                                ><i class="bx bx-left-arrow-alt fs-2"></i
                            ></a>
                            <div>
                                <h4 class="m-0">
                                    {{ selectedBudget }}'s Items
                                </h4>
                            </div>
                        </div>
                    </b-col>
                    <b-col sm="6" class="text-right">
                        <h4 class="text-muted mb-0">
                            Balance:
                            <b>{{
                                Intl.NumberFormat("ja-JP", {
                                    currency: "PHP",
                                    style: "currency",
                                }).format(totalBudget)
                            }}</b>
                            | Total: <b>{{ totalResourceItemAmt() }}</b>
                        </h4>
                    </b-col>
                </div>
                <b-row>
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
                                            v-model="perPageItem"
                                            size="sm"
                                            :options="pageOptions"
                                        ></b-form-select>
                                    </label>
                                </div>
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
                                                    <th
                                                        scope="col"
                                                        width="120px"
                                                    >
                                                        Qty
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        width="200px"
                                                    >
                                                        Unit Cost
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        width="200px"
                                                    >
                                                        Total
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
                                                <tr v-if="itemLoading">
                                                    <td colspan="6">
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
                                                        filteredResourceItems.length ==
                                                            0 && !itemLoading
                                                    "
                                                >
                                                    <td
                                                        colspan="6"
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
                                                    v-for="x in filteredResourceItems"
                                                    :key="x.id"
                                                >
                                                    <td>
                                                        <div>
                                                            {{ x.itemName }}
                                                        </div>
                                                        <div
                                                            v-if="
                                                                selectedPPMPStatus ===
                                                                'POSTED'
                                                            "
                                                        >
                                                            <div
                                                                v-if="
                                                                    x.technicalReviewStatus
                                                                        .toUpperCase()
                                                                        .includes(
                                                                            'APPROVED'
                                                                        )
                                                                "
                                                            >
                                                                <span
                                                                    class="
                                                                        badge
                                                                        bg-success
                                                                        bg-soft
                                                                        cursor-pointer
                                                                    "
                                                                    @click="
                                                                        viewItemLogs(
                                                                            x
                                                                        )
                                                                    "
                                                                    ><b
                                                                        class="
                                                                            text-success
                                                                        "
                                                                        >Approved
                                                                        by
                                                                        Technical</b
                                                                    ></span
                                                                >
                                                            </div>
                                                            <div
                                                                v-else-if="
                                                                    x.technicalReviewStatus
                                                                        .toUpperCase()
                                                                        .includes(
                                                                            'RETURN'
                                                                        )
                                                                "
                                                            >
                                                                <span
                                                                    class="
                                                                        badge
                                                                        bg-warning
                                                                        bg-soft
                                                                        cursor-pointer
                                                                    "
                                                                    @click="
                                                                        viewItemLogs(
                                                                            x
                                                                        )
                                                                    "
                                                                    ><b
                                                                        class="
                                                                            text-warning
                                                                        "
                                                                        >Returned
                                                                        by
                                                                        Technical</b
                                                                    ></span
                                                                >
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {{ x.description }}
                                                    </td>
                                                    <td>
                                                        {{ x.quantity }}
                                                    </td>
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
                                                    <td>
                                                        {{
                                                            Intl.NumberFormat(
                                                                "ja-JP",
                                                                {
                                                                    currency:
                                                                        "PHP",
                                                                    style: "currency",
                                                                }
                                                            ).format(x.total)
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
                                                                @click="
                                                                    resubmitItem(
                                                                        x
                                                                    )
                                                                "
                                                                variant="success"
                                                                v-if="
                                                                    x.technicalReviewStatus
                                                                        .toUpperCase()
                                                                        .includes(
                                                                            'RETURN'
                                                                        )
                                                                "
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-check
                                                                        font-size-18
                                                                        me-1
                                                                    "
                                                                ></i
                                                                >Resubmit
                                                                Item</b-dropdown-item
                                                            >
                                                            <b-dropdown-item
                                                                @click="
                                                                    viewItemLogs(
                                                                        x
                                                                    )
                                                                "
                                                                variant="dark"
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-menu-alt-right
                                                                        font-size-18
                                                                        me-1
                                                                    "
                                                                ></i
                                                                >View
                                                                Logs</b-dropdown-item
                                                            >
                                                            <b-dropdown-item
                                                                @click="
                                                                    viewResourceItem(
                                                                        x
                                                                    )
                                                                "
                                                                variant="dark"
                                                                ><i
                                                                    class="
                                                                        bx
                                                                        bx-edit
                                                                        font-size-18
                                                                        me-1
                                                                    "
                                                                ></i
                                                                >View
                                                                Details</b-dropdown-item
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
                                            :total-rows="rowsResourceItem"
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
        <loader :loading="submitted"></loader>
        <api-resource-logs ref="itemlog"></api-resource-logs>
        <print-options ref="printOpt"></print-options>
    </Layout>
</template>