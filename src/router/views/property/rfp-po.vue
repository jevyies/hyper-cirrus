<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { cloneDeep, groupBy } from "lodash";
import { required } from "vuelidate/lib/validators";
import Swal from "sweetalert2";
export default {
    page: {
        title: "RFP P.O",
    },
    components: {
        Layout,
        PageHeader,
    },
    data() {
        return {
            title: "Request for Payment",
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Request for Payment",
                    active: true,
                },
            ],
            submitted: false,
            modalTitle: "",
            availableBusy: false,
            available: [],
            tabIndex: 0,
            singleSelection: false,
            filterItem: "",
            availableCurrentPage: 1,
            perPageAvailable: 10,
            rfp: {
                remarks: "",
                cycle: this.$store.state.data.cycle,
                payee: "",
            },
            pendingRFP: [],
            currentPagePending: 1,
            perPagePending: 10,
            filterPending: "",
            postedRFP: [],
            currentPagePosted: 1,
            perPagePosted: 10,
            filterPosted: "",
        };
    },
    created() {
        this.changeCycle(this.$store.state.data.cycle);
    },
    validations: {
        rfp: { remarks: { required } },
    },
    computed: {
        filteredAvailableItems() {
            let data = this.available;
            var total = this.availableCurrentPage * this.perPageAvailable;
            if (this.filterItem.trim() != "" && this.filterItem) {
                data = data.filter((item) => {
                    return item.iarNumber
                        .toUpperCase()
                        .includes(this.filterItem.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPageAvailable, total);
            if (this.currentPageItem > 1 && currentData.length == 0) {
                total = (this.currentPageItem - 1) * this.perPageAvailable;
                currentData = data.slice(total - this.perPageAvailable, total);
            }
            return currentData;
        },
        filteredPendingRFP() {
            let data = this.pendingRFP;
            var total = this.currentPagePending * this.perPagePending;
            if (this.filterPending.trim() != "" && this.filterPending) {
                data = data.filter((item) => {
                    return item.iarNumber
                        .toUpperCase()
                        .includes(this.filterPending.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPagePending, total);
            if (this.currentPagePending > 1 && currentData.length == 0) {
                total = (this.currentPagePending - 1) * this.perPagePending;
                currentData = data.slice(total - this.perPagePending, total);
            }
            return currentData;
        },
        filteredPostedRFP() {
            let data = this.postedRFP;
            var total = this.currentPagePosted * this.perPagePosted;
            if (this.filterPosted.trim() != "" && this.filterPosted) {
                data = data.filter((item) => {
                    return item.iarNumber
                        .toUpperCase()
                        .includes(this.filterPosted.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPagePosted, total);
            if (this.currentPagePosted > 1 && currentData.length == 0) {
                total = (this.currentPagePosted - 1) * this.perPagePosted;
                currentData = data.slice(total - this.perPagePosted, total);
            }
            return currentData;
        },
        selectedAvailableItems() {
            let items = [];
            this.available.forEach((item) => {
                item.toggleSelected && items.push(item);
            });
            return items;
        },
    },
    methods: {
        changeCycle(cycle) {
            this.getAvailable(cycle);
            this.getPendingRFP(cycle);
            this.getPostedRFP(cycle);
        },
        getAvailable(cycle) {
            this.availableBusy = true;
            this.$store
                .dispatch("rfppo/GetAvailableRfpPo", cycle)
                .then((res) => {
                    this.availableBusy = false;
                    res.data.forEach((item) => {
                        item.toggleSelected = false;
                        item.supplierName = item.po.rfqSupplier.supplier.name;
                        item.supplierId = item.po.rfqSupplier.supplierId;
                    });
                    this.available = res.data;
                })
                .catch((err) => {
                    let stringErr = err.toString();
                    if (stringErr.includes("Network")) {
                        this.showToast("Network Error!", "error");
                    } else {
                        this.showToast(
                            "Something went wrong getting received P.O. list!",
                            "error"
                        );
                    }
                    this.availableBusy = false;
                });
        },
        getPendingRFP(cycle) {
            this.pendingBusy = true;
            this.$store
                .dispatch("rfppo/GetPendingRfpPo", cycle)
                .then((res) => {
                    this.pendingBusy = false;
                    res.data.forEach(item => {
                        item.rfpDetails = [];
                    })
                    this.pendingRFP = res.data;
                })
                .catch((err) => {
                    let stringErr = err.toString();
                    if (stringErr.includes("Network")) {
                        this.showToast("Network Error!", "error");
                    } else {
                        this.showToast(
                            "Something went wrong getting received P.O. list!",
                            "error"
                        );
                    }
                    this.pendingBusy = false;
                });
        },
        getPostedRFP(cycle){
            this.postedBusy = true;
            this.$store
                .dispatch("rfppo/GetPostedRfpPo", cycle)
                .then((res) => {
                    this.postedBusy = false;
                    this.postedRFP = res.data;
                })
                .catch((err) => {
                    let stringErr = err.toString();
                    if (stringErr.includes("Network")) {
                        this.showToast("Network Error!", "error");
                    } else {
                        this.showToast(
                            "Something went wrong getting received P.O. list!",
                            "error"
                        );
                    }
                    this.postedBusy = false;
                });
        },
        addToCart(items) {
            let diff = groupBy(items, "supplierId");
            if (Object.keys(diff).length > 1) {
                return this.showToast(
                    "Selected IAR has different Payee. Cannot Proceed",
                    "warning"
                );
            }
            this.modalTitle = "Request for Payment";
            this.selectedItems = cloneDeep(items);
            this.onReset();
            this.$bvModal.show("order-details-modal");
        },
        toggleSelectionMode() {
            this.singleSelection = !this.singleSelection;
            this.available.forEach((item) => {
                item.toggleSelected = false;
            });
        },
        onReset() {
            this.rfp = {
                remarks: "",
                cycle: this.$store.state.data.cycle,
            };
        },
        async onCreateRFP() {
            this.submitted = true;
            var data = cloneDeep(this.rfp);
            data.rfpPoItems = [];
            data.payee = this.selectedItems[0].supplierName;
            data.supplierId = this.selectedItems[0].supplierId;
            var sum = 0;
            this.selectedItems.forEach((item) => {
                data.rfpPoItems.push({
                    rfpId: 0,
                    iarId: item.id,
                    amount: item.total,
                });
                sum += item.total;
            });
            await this.$store
                .dispatch("rfppo/CreateRfpPo", data)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    this.selectedItems.forEach((item) => {
                        let index = this.available.findIndex(
                            (i) => i.id == item.id
                        );
                        this.available.splice(index, 1);
                    })
                    res.data.amount = sum;
                    this.$bvModal.hide('order-details-modal');
                    this.pendingRFP.push(res.data);
                    this.showToast("Successfully created!", "success");
                })
                .catch((err) => {
                    let stringErr = err.toString();
                    if (stringErr.includes("Network")) {
                        this.showToast("Network Error!", "error");
                    } else {
                        this.showToast(
                            "Something went wrong getting received P.O. list!",
                            "error"
                        );
                    }
                });
            this.submitted = false;
        },
        async getRFPDetails(array){
            this.pageLoader(true);
            let items = [];
            for (const x of array){
                await this.$store
                    .dispatch("inspectioniar/GetInspectionIar", x.iarId)
                    .then((res) => {
                        x.iar = res.data;
                        items.push(x);
                        this.pageLoader(false);
                    })
                    .catch((err) => {
                        this.pageLoader(false);
                        let stringErr = err.toString();
                        if (stringErr.includes("Network")) {
                            this.showToast("Network Error!", "error");
                        } else {
                            this.showToast(
                                "Something went wrong getting P.O. list!",
                                "error"
                            );
                        }
                    });
            }
            return items;
        },
        deleteRFP(row) {
            console.log(row)
            var index = this.pendingRFP.indexOf(row);
            Swal.fire({
                title: "Are you sure?",
                text: "You want to remove this?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#5c636a",
                confirmButtonText: "Yes, delete it!",
            }).then(async (result) => {
                if (result.value) {
                    if(row.rfpDetails.length == 0){
                        let items = await this.getRFPDetails(row.rfpPoItems);
                        row.rfpDetails = items;
                    }
                    this.$store
                        .dispatch("rfppo/DeleteRfpPo", row.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.pendingRFP.splice(index, 1);
                                row.rfpDetails.forEach(item => {
                                    item.iar.amount = item.amount;
                                    item.iar.supplierName = row.payee;
                                    item.iar.toggleSelected = false;
                                    this.available.push(item.iar);
                                })
                                this.showToast(
                                    "Successfully deleted",
                                    "success"
                                );
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted", "error");
                        });
                }
            });
        },
        postRFP(row) {
            var index = this.pendingRFP.indexOf(row);
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
                        .dispatch("rfppayment/postPayment", row.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.pendingRFP.splice(index, 1);
                                this.showToast(
                                    "Successfully posted",
                                    "success"
                                );
                                this.postedRFP.push(row);
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be posted", "error");
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
            id="order-details-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreateRFP"
                class="needs-validation"
                ref="apiForm"
            >
                <div class="mb-3">
                    <label for="description">Remarks </label>
                    <textarea
                        id="description"
                        rows="3"
                        v-model="rfp.remarks"
                        placeholder="Enter Remarks..."
                        class="form-control"
                        :class="{
                            'is-invalid': submitted && $v.rfp.remarks.$error,
                        }"
                    ></textarea>
                    <div
                        v-if="submitted && $v.rfp.remarks.$error"
                        class="invalid-feedback"
                    >
                        <span v-if="!$v.rfp.remarks.required"
                            >This value is required.</span
                        >
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">
                        Save RFP
                    </button>
                    <button
                        type="button"
                        class="btn btn-link"
                        @click="$bvModal.hide('order-details-modal')"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-tabs
            content-class="pt-3 pb-3 text-muted"
            v-model="tabIndex"
            nav-class="nav-tabs-custom"
        >
            <b-tab>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Available Items</span
                    >
                </template>
                <div class="row">
                    <div class="col-md-6">
                        <h5 class="mb-0">
                            List of Available Items for Request
                        </h5>
                        <div>
                            <small
                                class="cursor-pointer"
                                @click="toggleSelectionMode"
                                >{{
                                    singleSelection
                                        ? "Single Selection"
                                        : "Mutiple Selection"
                                }}</small
                            >
                        </div>
                    </div>
                    <div class="col-md-6 text-right">
                        <div
                            id="tickets-table_filter"
                            class="dataTables_filter me-1"
                        >
                            <label class="d-inline-flex align-items-center">
                                <b-form-input
                                    autocomplete="off"
                                    v-model="filterItem"
                                    type="search"
                                    placeholder="Search Items..."
                                    class="form-control"
                                ></b-form-input>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-lg-12">
                        <div>
                            <div class="">
                                <table
                                    class="
                                        table
                                        project-list-table
                                        table-centered table-borderless
                                    "
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                scope="col"
                                                style="width: 250px"
                                                class="
                                                    align-middle
                                                    border-2
                                                    border-top-0
                                                    border-start-0
                                                    border-bottom-0
                                                    border-dark-app
                                                "
                                            >
                                                IAR No.
                                            </th>
                                            <th
                                                scope="col"
                                                style="width: 400px"
                                                class="
                                                    align-middle
                                                    border-2
                                                    border-top-0
                                                    border-start-0
                                                    border-bottom-0
                                                    border-dark-app
                                                "
                                            >
                                                Payee
                                            </th>
                                            <th
                                                class="
                                                    text-center
                                                    align-middle
                                                    border-2
                                                    border-top-0
                                                    border-start-0
                                                    border-bottom-0
                                                    border-dark-app
                                                    p-0
                                                "
                                            >
                                                <div class="text-center">
                                                    <div
                                                        class="
                                                            border-dark-bottom
                                                            py-1
                                                        "
                                                    >
                                                        Dates
                                                    </div>
                                                    <div class="d-flex">
                                                        <div
                                                            class="
                                                                w-25
                                                                border-dark-right
                                                                p-1
                                                            "
                                                        >
                                                            IAR Date
                                                        </div>
                                                        <div
                                                            class="
                                                                w-25
                                                                border-dark-right
                                                                py-1
                                                            "
                                                        >
                                                            Delivery Date
                                                        </div>
                                                        <div
                                                            class="
                                                                w-25
                                                                border-dark-right
                                                                py-1
                                                            "
                                                        >
                                                            Date Inspected
                                                        </div>
                                                        <div class="w-25 py-1">
                                                            Acceptance Date
                                                        </div>
                                                    </div>
                                                </div>
                                            </th>
                                            <th
                                                class="
                                                    align-middle
                                                    border-2
                                                    border-top-0
                                                    border-start-0
                                                    border-bottom-0
                                                    border-dark-app
                                                    text-center
                                                "
                                            >
                                                DR Number
                                            </th>
                                            <th
                                                class="
                                                    align-middle
                                                    border-2
                                                    border-top-0
                                                    border-start-0
                                                    border-bottom-0
                                                    border-dark-app
                                                    text-center
                                                "
                                            >
                                                Total Amount
                                            </th>
                                            <th
                                                scope="col"
                                                width="120px"
                                                class="text-center align-middle"
                                                v-if="singleSelection"
                                            >
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-if="availableBusy">
                                            <td
                                                :colspan="
                                                    singleSelection ? 7 : 6
                                                "
                                            >
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
                                                filteredAvailableItems.length ==
                                                    0 && !availableBusy
                                            "
                                        >
                                            <td
                                                :colspan="
                                                    singleSelection ? 7 : 6
                                                "
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
                                        <tr
                                            v-for="x in filteredAvailableItems"
                                            :key="x.id"
                                        >
                                            <td class="align-middle">
                                                <div
                                                    class="
                                                        form-check
                                                        form-checkbox-outline
                                                        form-check-success
                                                        mb-0
                                                        ms-3
                                                    "
                                                    v-if="!singleSelection"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        :id="`resources-${x.id}`"
                                                        checked="checked"
                                                        class="form-check-input"
                                                        v-model="
                                                            x.toggleSelected
                                                        "
                                                    /><label
                                                        :for="`resources-${x.id}`"
                                                        class="form-check-label"
                                                    >
                                                        <span
                                                            class="
                                                                cursor-pointer
                                                            "
                                                            >{{
                                                                x.iarNumber
                                                            }}</span
                                                        >
                                                    </label>
                                                    <div><small></small></div>
                                                </div>
                                                <div v-else>
                                                    {{ x.iarNumber }}
                                                </div>
                                            </td>
                                            <td class="align-middle">
                                                {{ x.supplierName }}
                                            </td>
                                            <td>
                                                <div class="text-center d-flex">
                                                    <div
                                                        class="
                                                            w-25
                                                            d-flex
                                                            align-items-center
                                                            justify-content-center
                                                            py-2
                                                        "
                                                    >
                                                        {{
                                                            formatDate(
                                                                new Date(
                                                                    x.iarDate
                                                                )
                                                            )
                                                        }}
                                                    </div>
                                                    <div
                                                        class="
                                                            w-25
                                                            d-flex
                                                            align-items-center
                                                            justify-content-center
                                                        "
                                                    >
                                                        {{
                                                            formatDate(
                                                                new Date(
                                                                    x.dateOfDelivery
                                                                )
                                                            )
                                                        }}
                                                    </div>
                                                    <div
                                                        class="
                                                            w-25
                                                            d-flex
                                                            align-items-center
                                                            justify-content-center
                                                        "
                                                    >
                                                        {{
                                                            formatDate(
                                                                new Date(
                                                                    x.dateInspected
                                                                )
                                                            )
                                                        }}
                                                    </div>
                                                    <div
                                                        class="
                                                            w-25
                                                            d-flex
                                                            align-items-center
                                                            justify-content-center
                                                        "
                                                    >
                                                        {{
                                                            formatDate(
                                                                new Date(
                                                                    x.acceptanceDate
                                                                )
                                                            )
                                                        }}
                                                    </div>
                                                </div>
                                            </td>
                                            <td
                                                class="text-center align-middle"
                                            >
                                                {{ x.drNumber }}
                                            </td>
                                            <td
                                                class="text-center align-middle"
                                            >
                                                {{
                                                    Intl.NumberFormat("ja-JP", {
                                                        currency: "PHP",
                                                        style: "currency",
                                                    }).format(x.total)
                                                }}
                                            </td>
                                            <td
                                                v-if="singleSelection"
                                                class="align-middle text-center"
                                            >
                                                <div
                                                    class="
                                                        d-flex
                                                        align-items-center
                                                        text-success
                                                        cursor-pointer
                                                    "
                                                    @click="addToCart([x])"
                                                >
                                                    <i
                                                        class="bx bx-cart me-1"
                                                    ></i
                                                    >Request
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </b-tab>
            <b-tab>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span
                        class="d-none d-sm-inline-block position-relative me-2"
                        >Pending Request for Payment</span
                    >
                </template>
                <div class="row">
                    <div class="col-md-6">
                        <h5 class="mb-0">Pending Request for Payment</h5>
                        <div>
                            <small>List of Pending Request for Payment</small>
                        </div>
                    </div>
                    <div class="col-md-6 text-right">
                        <div
                            id="tickets-table_filter"
                            class="dataTables_filter me-1"
                        >
                            <label class="d-inline-flex align-items-center">
                                <b-form-input
                                    autocomplete="off"
                                    v-model="filterItem"
                                    type="search"
                                    placeholder="Search Items..."
                                    class="form-control"
                                ></b-form-input>
                            </label>
                        </div>
                    </div>
                </div>
                <div role="tablist" v-for="x in filteredPendingRFP" :key="x.id">
                    <b-card no-body class="mb-1 shadow-none">
                        <b-card-header header-tag="header" role="tab">
                            <div
                                class="
                                    d-flex
                                    justify-content-between
                                    align-items-center
                                "
                            >
                                <div>
                                    <small>{{ x.rfpNumber }}</small>
                                    <h4 class="mb-0">{{ x.payee }}</h4>
                                    <span class="text-warning"
                                        >Amount:
                                        {{
                                            Intl.NumberFormat("ja-JP", {
                                                currency: "PHP",
                                                style: "currency",
                                            }).format(x.amount)
                                        }}</span
                                    >
                                </div>
                                <div class="d-flex align-items-center">
                                    <a
                                        href="javascript:void(0);"
                                        class="
                                            action-icon
                                            text-success
                                            hover-max-width
                                            d-flex
                                            align-items-center
                                        "
                                        @click="postRFP(x)"
                                        ><i
                                            class="
                                                mdi mdi-check
                                                font-size-22
                                                me-1
                                            "
                                        ></i>
                                        <span class="me-2"
                                            >Post Request for Payment</span
                                        >
                                    </a>
                                    <a
                                        href="javascript:void(0);"
                                        class="
                                            action-icon
                                            text-danger
                                            hover-max-width
                                            d-flex
                                            align-items-center
                                        "
                                        @click="deleteRFP(x)"
                                        ><i
                                            class="
                                                mdi mdi-trash-can
                                                font-size-22
                                                me-1
                                            "
                                        ></i>
                                        <span class="me-2"
                                            >Delete Request for Payment</span
                                        >
                                    </a>
                                </div>
                            </div>
                        </b-card-header>
                    </b-card>
                </div>
            </b-tab>
            <b-tab>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span
                        class="d-none d-sm-inline-block position-relative me-2"
                        >Posted Request for Payment</span
                    >
                </template>
                <div class="row">
                    <div class="col-md-6">
                        <h5 class="mb-0">Posted Request for Payment</h5>
                        <div>
                            <small>List of Posted Request for Payment</small>
                        </div>
                    </div>
                    <div class="col-md-6 text-right">
                        <div
                            id="tickets-table_filter"
                            class="dataTables_filter me-1"
                        >
                            <label class="d-inline-flex align-items-center">
                                <b-form-input
                                    autocomplete="off"
                                    v-model="filterPosted"
                                    type="search"
                                    placeholder="Search Items..."
                                    class="form-control"
                                ></b-form-input>
                            </label>
                        </div>
                    </div>
                </div>
                <div role="tablist" v-for="x in filteredPostedRFP" :key="x.id">
                    <b-card no-body class="mb-1 shadow-none">
                        <b-card-header header-tag="header" role="tab">
                            <div
                                class="
                                    d-flex
                                    justify-content-between
                                    align-items-center
                                "
                            >
                                <div>
                                    <small>{{ x.rfpNumber }}</small>
                                    <h4 class="mb-0">{{ x.payee }}</h4>
                                    <span class="text-warning"
                                        >Amount:
                                        {{
                                            Intl.NumberFormat("ja-JP", {
                                                currency: "PHP",
                                                style: "currency",
                                            }).format(x.amount)
                                        }}</span
                                    >
                                </div>
                                <div class="d-flex align-items-center">
                                    <a
                                        href="javascript:void(0);"
                                        class="
                                            action-icon
                                            hover-max-width
                                            text-secondary
                                            d-flex
                                            align-items-center
                                        "
                                        @click="viewDetails(x)"
                                        v-if="!x.visible"
                                        >
                                        <i
                                            class="
                                                mdi mdi-chevron-right
                                                font-size-22
                                                me-1
                                            "
                                        ></i><span class="me-2"
                                            >View Details</span
                                        >
                                    </a>
                                </div>
                            </div>
                        </b-card-header>
                    </b-card>
                </div>
            </b-tab>
        </b-tabs>
        <div class="position-fixed" style="bottom: 50px; right: 100px">
            <div
                class="position-relative"
                v-if="selectedAvailableItems.length > 0"
            >
                <button
                    class="
                        btn btn-success
                        d-flex
                        align-items-center
                        rounded-pill
                        hover-max-width
                    "
                    type="button"
                    @click="addToCart(selectedAvailableItems)"
                >
                    <i class="mdi mdi-table-arrow-right font-size-18 me-1"></i
                    ><span>Request for Payment</span>
                </button>
                <small
                    class="position-absolute badge bg-danger"
                    style="top: -5px; right: -5px; z-index: 10px"
                    >{{ selectedAvailableItems.length }}</small
                >
            </div>
        </div>
    </Layout>
</template>