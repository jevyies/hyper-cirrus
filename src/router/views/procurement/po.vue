<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import { cloneDeep } from "lodash";
import { required } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import PrintOptions from "@/components/modals/print-options.vue";

export default {
    page: {
        title: "Purchase Order",
    },
    components: {
        Layout,
        PageHeader,
        DatePicker,
        PrintOptions,
    },
    data() {
        return {
            title: "Purchase Order",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Purchase Order",
                    active: true,
                },
            ],
            modalTitle: "",
            totalRows: 1,
            perPage: 10,
            perPagePosted: 5,
            currentPagePosted: 1,
            po: {
                id: 0,
                description: "",
            },
            poData: [],
            filterPO: "",
            pageOptions: [5, 10, 25, 50, 100],
            perPagePO: 5,
            currentPagePO: 1,
            poLoading: false,
            poIndex: -1,
            cycle: this.$store.state.data.cycle,
            tabIndex: 0,
            postedPO: [],
            filterPosted: "",
        };
    },
    computed: {
        filteredPO() {
            let data = this.poData;
            var total = this.currentPagePO * this.perPagePO;
            if (this.filterPO.trim() != "" && this.filterPO) {
                data = data.filter((item) => {
                    return item.searchItem
                        .toUpperCase()
                        .includes(this.filterPO.toUpperCase());
                });
            }
            var currentData = data.slice(total - this.perPagePO, total);
            if (this.currentPagePO > 1 && currentData.length == 0) {
                total = (this.currentPagePO - 1) * this.perPagePO;
                currentData = data.slice(total - this.perPagePO, total);
            }
            return currentData;
        },
        rowsPO() {
            if (this.filterPO.trim() != "" && this.filterPO) {
                return this.filteredPO.length;
            } else {
                return this.poData.length;
            }
        },
        filteredPosted() {
            let data = this.postedPO;
            var total = this.currentPagePosted * this.perPagePosted;
            if (this.filterPosted.trim() != "" && this.filterPosted) {
                data = data.filter((item) => {
                    return item.searchItem
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
        rowsPosted() {
            if (this.filterPosted.trim() != "" && this.filterPosted) {
                return this.filteredPosted.length;
            } else {
                return this.postedPO.length;
            }
        },
    },
    created() {
        this.changeCycle(this.$store.state.data.cycle);
    },
    validations: {
        po: {
            description: { required },
        },
    },
    methods: {
        // Purchase Order
        changeCycle(cycle) {
            this.getPending(cycle);
            this.getPosted(cycle);
        },
        getPending(cycle) {
            this.poLoading = true;
            this.$store
                .dispatch("po/GetPendingPo", cycle)
                .then((res) => {
                    this.poLoading = false;
                    res.data.forEach((item) => {
                        item.searchItem = `${item.poNumber} ${item.description} ${item.rfqSupplier.supplier.name}`;
                        item.visible = true;
                    });
                    this.poData = res.data;
                })
                .catch((err) => {
                    this.showToast('Something went wrong - getting pending P.O', 'error');
                    this.poLoading = false;
                });
        },
        getPosted(cycle) {
            this.postedLoading = true;
            this.$store
                .dispatch("po/GetPostedPo", cycle)
                .then((res) => {
                    this.postedLoading = false;
                    res.data.forEach((item) => {
                        item.visible = true;
                        item.isSaving = false;
                        item.dateReceived = new Date(item.poDateReceived);
                        item.editDate = false;
                        item.dateError = false;
                        item.searchItem = `${item.poNumber} ${item.description} ${item.rfqSupplier.supplier.name}`;
                    });
                    this.postedPO = res.data;
                })
                .catch(() => {
                    this.showToast('Something went wrong - getting posted P.O', 'error');
                    this.postedLoading = false;
                });
        },
        onResetPO() {
            this.po = {
                id: 0,
                description: "",
                campusId: this.$store.state.data.campus.id,
                cycle: "",
            };
        },
        addNewPO() {
            this.onResetPO();
            this.po.cycle = cloneDeep(this.cycle);
            this.modalTitle = "Create New PO";
            this.$bvModal.show("po-modal");
        },
        hideModalPO() {
            this.$bvModal.hide("po-modal");
        },
        onCreatePO() {
            this.submitted = true;
            this.$v.po.$touch();
            if (this.$v.po.$invalid) {
                return;
            }
            var data = cloneDeep(this.po);
            if (this.po.id > 0) {
                this.$store
                    .dispatch("po/UpdatePo", data)
                    .then((res) => {
                        if (res.data.error) {
                            return this.showToast(res.data.errorMessage, "error");
                        }
                        this.poData[this.poIndex].description =
                            res.data.description;
                        this.$bvModal.hide("po-modal");
                        this.showToast("Successfully updated!", "success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong - updating PO", "error");
                    });
            } else {
                this.$store
                    .dispatch("po/CreatePo", data)
                    .then((res) => {
                        if (res.data.error) {
                            return this.showToast(res.data.errorMessage, "error");
                        }
                        this.poData.push(res.data);
                        this.$bvModal.hide("po-modal");
                        this.showToast("Successfully created!", "success");
                    })
                    .catch((err) => {
                        this.showToast("Something went wrong - creating PO", "error");
                    });
            }
            this.submitted = false;
        },
        updatePO(row) {
            this.po = cloneDeep(row);
            this.poIndex = this.poData.indexOf(row);
            this.modalTitle = "Update PO";
            this.$bvModal.show("po-modal");
        },
        deletePO(props) {
            var index = this.poData.indexOf(props);
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
                        .dispatch("po/DeletePo", props.id)
                        .then((res) => {
                            if (res.status == 204) {
                                this.poData.splice(index, 1);
                                this.showToast("Successfully deleted!", "success");
                            }
                        })
                        .catch((err) => {
                            this.showToast("Cannot be deleted!", "error");
                        });
                }
            });
        },
        postPO(id) {
            var index = this.poData.findIndex((item) => item.id == id);
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
                        .dispatch("po/PostPo", id)
                        .then((res) => {
                            if (res.data.error) {
                                return this.showToast(res.data.errorMessage, "error");
                            }
                            this.postedPO.push(this.poData[index]);
                            this.poData.splice(index, 1);
                            this.showToast("Successfully posted!", "success");
                        })
                        .catch((err) => {
                            this.showToast("Something went wrong - posting PO", "error");
                        });
                }
            });
        },
        async printPO(id) {
            this.$refs.printOpt.putOptions({
                apiUrl: "procurement/Po/Print",
                routeVariables: [id],
            });
            this.$bvModal.show("print-options-modal");
        },
        async printNTP(id){
            this.$refs.printOpt.putOptions({
                apiUrl: "procurement/Po/Print/NTP",
                routeVariables: [id],
            });
            this.$bvModal.show("print-options-modal");
        },
        savePODate(row) {
            this.submitted = true;
            row.dateError = false;
            row.isSaving = true;
            if (row.dateReceived == null) {
                return (row.dateError = true);
            }
            this.$store
                .dispatch("po/ReceivePo", {
                    id: row.id,
                    date: this.getDate(row.dateReceived),
                })
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    row.editDate = false;
                    row.isSaving = false;
                    this.showToast("Successfully saving P.O Date!", "success");
                    this.submitted = false;
                })
                .catch((err) => {
                    this.submitted = false;
                    this.showToast("Error saving P.O Date", "error");
                });
        },
        cancelSaving(row) {
            row.editDate = false;
            row.dateError = false;
            row.dateReceived = new Date(row.poDateReceived);
        },
    },
};
</script>
<template>
    <Layout @changeCycle="changeCycle">
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="po-modal"
            :title="modalTitle"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <form
                @submit.prevent="onCreatePO"
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
                                v-model="po.description"
                                placeholder="Enter Description..."
                                class="form-control"
                                :class="{
                                    'is-invalid':
                                        submitted && $v.po.description.$error,
                                }"
                            ></textarea>
                            <div
                                v-if="submitted && $v.po.description.$error"
                                class="invalid-feedback"
                            >
                                <span v-if="!$v.po.description.required"
                                    >This value is required.</span
                                >
                            </div>
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
                        @click="$bvModal.hide('po-modal')"
                    >
                        Close
                    </button>
                </div>
            </form>
        </b-modal>
        <b-row class="mb-1">
            <b-col sm="6" class="d-flex align-items-center">
                <div class="d-flex align-items-center">
                    <h4 class="mb-0"></h4>
                </div>
            </b-col>
            <div class="col-md-6 text-right"></div>
        </b-row>
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
                    <span class="d-none d-sm-inline-block">Pending P.O</span>
                </template>
                <div class="row">
                    <div class="col-md-6">
                        <div class="d-flex align-items-center h-100">
                            <h4 class="mb-0">Pending P.O List</h4>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex float-end">
                            <div
                                id="tickets-table_filter"
                                class="dataTables_filter me-1"
                            >
                                <label class="d-inline-flex align-items-center">
                                    <b-form-input
                                        autocomplete="off"
                                        v-model="filterPO"
                                        type="search"
                                        placeholder="Search P.O..."
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
                                        v-model="perPagePO"
                                        size="sm"
                                        :options="pageOptions"
                                    ></b-form-select>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="
                        h-50vh
                        d-flex
                        align-items-center
                        justify-content-center
                    "
                    v-if="poData.length == 0"
                >
                    <h5 class="text-muted">
                        <i class="fas fa-exclamation-triangle me-2"></i>No Data
                        Found
                    </h5>
                </div>
                <div
                    class="
                        h-50vh
                        d-flex
                        align-items-center
                        justify-content-center
                    "
                    v-if="poData.length > 0 && filteredPO.length == 0"
                >
                    <h5 class="text-muted">
                        <i class="fas fa-exclamation-triangle me-2"></i>Search Not
                        Found
                    </h5>
                </div>
                <div
                    class="
                        h-50vh
                        d-flex
                        align-items-center
                        justify-content-center
                    "
                    v-if="poLoading"
                >
                    <div class="preloader-component me-2">
                        <div class="status">
                            <div class="spinner-chase w-25px h-25px">
                                <div class="chase-dot"></div>
                                <div class="chase-dot"></div>
                                <div class="chase-dot"></div>
                                <div class="chase-dot"></div>
                                <div class="chase-dot"></div>
                                <div class="chase-dot"></div>
                            </div>
                        </div>
                    </div>
                    <h5 class="mb-0">Loading...</h5>
                </div>
                <div role="tablist" v-for="x in filteredPO" :key="x.id">
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
                                    <small>{{ x.poNumber }}</small>
                                    <h4 class="mb-0">{{ x.description }}</h4>
                                    <small
                                        >{{
                                            x.rfqSupplier.supplier.name
                                        }}&nbsp;[<a
                                            href="javascript:void(0);"
                                            @click="x.visible = !x.visible"
                                            >{{
                                                x.visible ? "Hide" : "Show More"
                                            }}
                                            Details</a
                                        >]</small
                                    >
                                </div>
                                <div class="d-flex align-items-center">
                                    <a
                                        href="javascript:void(0);"
                                        class="
                                            action-icon
                                            text-purple
                                            hover-max-width
                                            d-flex
                                            align-items-center
                                        "
                                        @click="printPO(x.id)"
                                        v-if="!x.visible"
                                        ><i
                                            class="
                                                mdi mdi-printer
                                                font-size-22
                                                me-1
                                            "
                                        ></i>
                                        <span class="me-2">Print P.O</span>
                                    </a>
                                    <a
                                        href="javascript:void(0);"
                                        class="
                                            action-icon
                                            text-success
                                            hover-max-width
                                            d-flex
                                            align-items-center
                                        "
                                        @click="postPO(x.id)"
                                        v-if="!x.visible"
                                        ><i
                                            class="
                                                mdi mdi-check
                                                font-size-22
                                                me-1
                                            "
                                        ></i>
                                        <span class="me-2">Post P.O</span>
                                    </a>
                                    <a
                                        href="javascript:void(0);"
                                        class="
                                            action-icon
                                            text-dark
                                            hover-max-width
                                            d-flex
                                            align-items-center
                                        "
                                        @click="updatePO(x)"
                                        ><i
                                            class="
                                                mdi mdi-square-edit-outline
                                                font-size-22
                                                me-1
                                            "
                                        ></i>
                                        <span class="me-2">Edit P.O</span>
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
                                        @click="deletePO(x)"
                                        ><i
                                            class="
                                                mdi mdi-trash-can
                                                font-size-22
                                                me-1
                                            "
                                        ></i>
                                        <span class="me-2">Delete P.O</span>
                                    </a>
                                </div>
                            </div>
                        </b-card-header>
                        <b-collapse
                            :visible="x.visible"
                            :accordion="`po-accordion-${x.id}`"
                            role="tabpanel"
                        >
                            <b-card-body>
                                <div class="row">
                                    <div class="col-md-5">
                                        <b class="font-size-16"
                                            >Supplier Details:</b
                                        >
                                        <div class="d-flex ms-4 mt-2">
                                            <i class="me-2">-</i
                                            ><span class="font-size-14"
                                                >Name:
                                                {{
                                                    x.rfqSupplier.supplier.name
                                                }}</span
                                            >
                                        </div>
                                        <div class="d-flex ms-4">
                                            <i class="me-2">-</i
                                            ><span class="font-size-14"
                                                >Address:
                                                {{
                                                    x.rfqSupplier.supplier
                                                        .address
                                                }}</span
                                            >
                                        </div>
                                        <div class="d-flex ms-4">
                                            <i class="me-2">-</i
                                            ><span class="font-size-14"
                                                >Contact No.:
                                                {{
                                                    x.rfqSupplier.supplier
                                                        .contactNumber
                                                }}</span
                                            >
                                        </div>
                                        <div class="d-flex ms-4">
                                            <i class="me-2">-</i
                                            ><span class="font-size-14"
                                                >Email:
                                                <a href="javascript:void(0);">{{
                                                    x.rfqSupplier.supplier.email
                                                }}</a></span
                                            >
                                        </div>
                                        <div
                                            class="d-flex ms-4"
                                            v-if="x.rfqSupplier.supplier.note"
                                        >
                                            <i class="me-2">-</i
                                            ><span class="font-size-14"
                                                >Note:
                                                {{
                                                    x.rfqSupplier.supplier.note
                                                }}</span
                                            >
                                        </div>
                                        <div class="mt-3">
                                            <button
                                                type="button"
                                                class="btn btn-success me-1"
                                                @click="postPO(x.id)"
                                            >
                                                <i class="bx bx-check me-1"></i
                                                >Post P.O
                                            </button>
                                            <button
                                                type="button"
                                                class="btn btn-purple"
                                                @click="postPO(x.id)"
                                            >
                                                <i
                                                    class="bx bx-printer me-1"
                                                ></i
                                                >Print P.O
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col-md-7 border-start border-3">
                                        <div class="ms-2">
                                            <div class="mb-2">
                                                <b class="font-size-16"
                                                    >Supplier Offers:</b
                                                >
                                            </div>
                                            <div>
                                                <table width="100%">
                                                    <thead>
                                                        <tr
                                                            class="
                                                                border-bottom
                                                            "
                                                        >
                                                            <th
                                                                style="
                                                                    width: 90px;
                                                                "
                                                                class="py-2"
                                                            >
                                                                Qty
                                                            </th>
                                                            <th class="py-2">
                                                                Item Name
                                                            </th>
                                                            <th
                                                                class="py-2"
                                                                style="
                                                                    width: 200px;
                                                                "
                                                            >
                                                                Unit Price
                                                            </th>
                                                            <th
                                                                class="py-2"
                                                                style="
                                                                    width: 200px;
                                                                "
                                                            >
                                                                Total Price
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr
                                                            v-for="y in x
                                                                .rfqSupplier
                                                                .rfqSupplierOffers"
                                                            :key="y.id"
                                                            class="
                                                                border-bottom
                                                            "
                                                        >
                                                            <td class="py-2">
                                                                {{ y.quantity }}
                                                            </td>
                                                            <td class="py-2">
                                                                <div>
                                                                    {{
                                                                        y.itemName
                                                                    }}
                                                                </div>
                                                                <small>{{
                                                                    y.description
                                                                }}</small>
                                                            </td>
                                                            <td class="py-2">
                                                                {{
                                                                    Intl.NumberFormat(
                                                                        "ja-JP",
                                                                        {
                                                                            currency:
                                                                                "PHP",
                                                                            style: "currency",
                                                                        }
                                                                    ).format(
                                                                        y.unitCost
                                                                    )
                                                                }}
                                                            </td>
                                                            <td class="py-2">
                                                                {{
                                                                    Intl.NumberFormat(
                                                                        "ja-JP",
                                                                        {
                                                                            currency:
                                                                                "PHP",
                                                                            style: "currency",
                                                                        }
                                                                    ).format(
                                                                        y.unitCost *
                                                                            y.quantity
                                                                    )
                                                                }}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </b-card-body>
                        </b-collapse>
                    </b-card>
                </div>
                <div class="row mb-2 mt-4" v-if="poData.length > 0">
                    <div class="col-md-12 text-right">
                        <ul class="pagination pagination-rounded mb-0 float-end">
                            <!-- pagination -->
                            <b-pagination
                                v-model="currentPagePO"
                                :total-rows="rowsPO"
                                :per-page="perPagePO"
                            ></b-pagination>
                        </ul>
                    </div>
                </div>
            </b-tab>
            <b-tab>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block">Posted P.O</span>
                </template>
                <div class="row">
                    <div class="col-md-6">
                        <div class="d-flex align-items-center h-100">
                            <h4 class="mb-0">Posted P.O List</h4>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex float-end">
                            <div
                                id="tickets-table_filter"
                                class="dataTables_filter me-1"
                            >
                                <label class="d-inline-flex align-items-center">
                                    <b-form-input
                                        autocomplete="off"
                                        v-model="filterPosted"
                                        type="search"
                                        placeholder="Search P.O..."
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
                                        v-model="perPagePosted"
                                        size="sm"
                                        :options="pageOptions"
                                    ></b-form-select>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="
                        h-50vh
                        d-flex
                        align-items-center
                        justify-content-center
                    "
                    v-if="postedPO.length == 0"
                >
                    <h5 class="text-muted">
                        <i class="fas fa-exclamation-triangle me-2"></i>No Data
                        Found
                    </h5>
                </div>
                <div
                    class="
                        h-50vh
                        d-flex
                        align-items-center
                        justify-content-center
                    "
                    v-if="postedPO.length > 0 && filteredPosted.length == 0"
                >
                    <h5 class="text-muted">
                        <i class="fas fa-exclamation-triangle me-2"></i>Search Not
                        Found
                    </h5>
                </div>
                <div
                    class="
                        h-50vh
                        d-flex
                        align-items-center
                        justify-content-center
                    "
                    v-if="postedLoading"
                >
                    <div class="preloader-component me-2">
                        <div class="status">
                            <div class="spinner-chase w-25px h-25px">
                                <div class="chase-dot"></div>
                                <div class="chase-dot"></div>
                                <div class="chase-dot"></div>
                                <div class="chase-dot"></div>
                                <div class="chase-dot"></div>
                                <div class="chase-dot"></div>
                            </div>
                        </div>
                    </div>
                    <h5 class="mb-0">Loading...</h5>
                </div>
                <div role="tablist" v-for="x in filteredPosted" :key="x.id" class="mb-2">
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
                                    <small>{{ x.poNumber }}</small>
                                    <h4 class="mb-0">{{ x.description }}</h4>
                                    <small
                                        >{{
                                            x.rfqSupplier.supplier.name
                                        }}&nbsp;[<a
                                            href="javascript:void(0);"
                                            @click="x.visible = !x.visible"
                                            >{{
                                                x.visible ? "Hide" : "Show More"
                                            }}
                                            Details</a
                                        >]</small
                                    >
                                </div>
                                <div class="d-flex align-items-center">
                                    <a
                                        href="javascript:void(0);"
                                        class="
                                            action-icon
                                            text-purple
                                            hover-max-width
                                            d-flex
                                            align-items-center
                                        "
                                        @click="printPO(x.id)"
                                        v-if="!x.visible"
                                        ><i
                                            class="
                                                mdi mdi-printer
                                                font-size-22
                                                me-1
                                            "
                                        ></i>
                                        <span class="me-2"
                                            >Print Final P.O</span
                                        >
                                    </a>
                                    <a
                                        href="javascript:void(0);"
                                        class="
                                            action-icon
                                            text-purple
                                            hover-max-width
                                            d-flex
                                            align-items-center
                                        "
                                        @click="printNTP(x.id)"
                                        v-if="!x.visible"
                                        ><i
                                            class="
                                                mdi mdi-printer
                                                font-size-22
                                                me-1
                                            "
                                        ></i>
                                        <span class="me-2"
                                            >Print NTP</span
                                        >
                                    </a>
                                </div>
                            </div>
                        </b-card-header>
                        <b-collapse
                            :visible="x.visible"
                            :accordion="`po-accordion-${x.id}`"
                            role="tabpanel"
                        >
                            <b-card-body>
                                <div class="row">
                                    <div class="col-md-5">
                                        <b class="font-size-16"
                                            >Supplier Details:</b
                                        >
                                        <div class="d-flex ms-4 mt-2">
                                            <i class="me-2">-</i
                                            ><span class="font-size-14"
                                                >Name:
                                                {{
                                                    x.rfqSupplier.supplier.name
                                                }}</span
                                            >
                                        </div>
                                        <div class="d-flex ms-4">
                                            <i class="me-2">-</i
                                            ><span class="font-size-14"
                                                >Address:
                                                {{
                                                    x.rfqSupplier.supplier
                                                        .address
                                                }}</span
                                            >
                                        </div>
                                        <div class="d-flex ms-4">
                                            <i class="me-2">-</i
                                            ><span class="font-size-14"
                                                >Contact No.:
                                                {{
                                                    x.rfqSupplier.supplier
                                                        .contactNumber
                                                }}</span
                                            >
                                        </div>
                                        <div class="d-flex ms-4">
                                            <i class="me-2">-</i
                                            ><span class="font-size-14"
                                                >Email:
                                                <a href="javascript:void(0);">{{
                                                    x.rfqSupplier.supplier.email
                                                }}</a></span
                                            >
                                        </div>
                                        <div
                                            class="d-flex ms-4"
                                            v-if="x.rfqSupplier.supplier.note"
                                        >
                                            <i class="me-2">-</i
                                            ><span class="font-size-14"
                                                >Note:
                                                {{
                                                    x.rfqSupplier.supplier.note
                                                }}</span
                                            >
                                        </div>
                                        <div class="mt-2">
                                            <div
                                                class="
                                                    d-flex
                                                    align-items-center
                                                "
                                            >
                                                <span
                                                    class="
                                                        font-size-16
                                                        me-1
                                                        no-wrap
                                                    "
                                                    ><b
                                                        ><i
                                                            class="
                                                                bx bx-calendar
                                                                font-size-16
                                                            "
                                                        ></i>
                                                        P.O Date Received:</b
                                                    ></span
                                                >
                                                <div
                                                    class="
                                                        d-flex
                                                        align-items-center
                                                    "
                                                    v-if="!x.editDate"
                                                >
                                                    <span
                                                        class="
                                                            font-size-16
                                                            ms-1
                                                        "
                                                        >{{
                                                            formatDate(
                                                                x.dateReceived
                                                            )
                                                        }}</span
                                                    >
                                                    <a
                                                        href="javascript:void(0);"
                                                        class="
                                                            hover-max-width
                                                            d-flex
                                                            align-items-center
                                                        "
                                                        @click="
                                                            x.editDate = true
                                                        "
                                                    >
                                                        <i
                                                            class="
                                                                bx bx-edit
                                                                font-size-16
                                                                mx-1
                                                            "
                                                        ></i>
                                                        <span
                                                            >Edit P.O Received
                                                            Date</span
                                                        >
                                                    </a>
                                                </div>
                                                <div
                                                    class="d-flex w-100"
                                                    v-if="x.editDate"
                                                >
                                                    <div class="w-100">
                                                        <date-picker
                                                            v-model="
                                                                x.dateReceived
                                                            "
                                                            lang="en"
                                                            placeholder="Enter P.O Date Received..."
                                                            :class="{
                                                                'is-invalid':
                                                                    submitted &&
                                                                    x.dateError,
                                                            }"
                                                        ></date-picker>
                                                        <div
                                                            v-if="
                                                                submitted &&
                                                                x.dateError
                                                            "
                                                            class="
                                                                invalid-feedback
                                                            "
                                                        >
                                                            <span
                                                                >This value is
                                                                required.</span
                                                            >
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        class="
                                                            ms-2
                                                            btn btn-success
                                                            no-wrap
                                                        "
                                                        @click="savePODate(x)"
                                                    >
                                                        <span
                                                            class="
                                                                spinner-border
                                                                text-dark
                                                            "
                                                            style="
                                                                width: 15px;
                                                                height: 15px;
                                                            "
                                                            v-if="x.isSaving"
                                                        ></span>
                                                        <span v-else
                                                            ><i
                                                                class="
                                                                    bx bx-save
                                                                    me-1
                                                                "
                                                            ></i
                                                            >Save</span
                                                        >
                                                    </button>
                                                    <button
                                                        type="button"
                                                        class="
                                                            ms-2
                                                            btn
                                                            no-wrap
                                                            btn-link
                                                        "
                                                        @click="cancelSaving(x)"
                                                    >
                                                        <span>Cancel</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mt-2">
                                            <button
                                                type="button"
                                                class="btn btn-purple me-2"
                                                @click="printPO(x.id)"
                                            >
                                                <i
                                                    class="bx bx-printer me-1"
                                                ></i
                                                >Print Final P.O
                                            </button>
                                            <button
                                                type="button"
                                                class="btn btn-purple"
                                                @click="printNTP(x.id)"
                                            >
                                                <i
                                                    class="bx bx-printer me-1"
                                                ></i
                                                >Print NTP
                                            </button>
                                            <div class="invalid-feedback">
                                                <span
                                                    >This value is
                                                    required.</span
                                                >
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-7 border-start border-3">
                                        <div class="ms-2">
                                            <div class="mb-2">
                                                <b class="font-size-16"
                                                    >Supplier Offers:</b
                                                >
                                            </div>
                                            <div>
                                                <table width="100%">
                                                    <thead>
                                                        <tr
                                                            class="
                                                                border-bottom
                                                            "
                                                        >
                                                            <th
                                                                style="
                                                                    width: 90px;
                                                                "
                                                                class="py-2"
                                                            >
                                                                Qty
                                                            </th>
                                                            <th class="py-2">
                                                                Item Name
                                                            </th>
                                                            <th
                                                                class="py-2"
                                                                style="
                                                                    width: 200px;
                                                                "
                                                            >
                                                                Unit Price
                                                            </th>
                                                            <th
                                                                class="py-2"
                                                                style="
                                                                    width: 200px;
                                                                "
                                                            >
                                                                Total Price
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr
                                                            v-for="y in x
                                                                .rfqSupplier
                                                                .rfqSupplierOffers"
                                                            :key="y.id"
                                                            class="
                                                                border-bottom
                                                            "
                                                        >
                                                            <td class="py-2">
                                                                {{ y.quantity }}
                                                            </td>
                                                            <td class="py-2">
                                                                <div>
                                                                    {{
                                                                        y.itemName
                                                                    }}
                                                                </div>
                                                                <small>{{
                                                                    y.description
                                                                }}</small>
                                                            </td>
                                                            <td class="py-2">
                                                                {{
                                                                    Intl.NumberFormat(
                                                                        "ja-JP",
                                                                        {
                                                                            currency:
                                                                                "PHP",
                                                                            style: "currency",
                                                                        }
                                                                    ).format(
                                                                        y.unitCost
                                                                    )
                                                                }}
                                                            </td>
                                                            <td class="py-2">
                                                                {{
                                                                    Intl.NumberFormat(
                                                                        "ja-JP",
                                                                        {
                                                                            currency:
                                                                                "PHP",
                                                                            style: "currency",
                                                                        }
                                                                    ).format(
                                                                        y.unitCost *
                                                                            y.quantity
                                                                    )
                                                                }}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </b-card-body>
                        </b-collapse>
                    </b-card>
                </div>
                <div class="row mb-2 mt-4" v-if="postedPO.length > 0">
                    <div class="col-md-12 text-right">
                        <ul class="pagination pagination-rounded mb-0 float-end">
                            <!-- pagination -->
                            <b-pagination
                                v-model="currentPagePosted"
                                :total-rows="rowsPosted"
                                :per-page="perPagePosted"
                            ></b-pagination>
                        </ul>
                    </div>
                </div>
            </b-tab>
        </b-tabs>
        <print-options ref="printOpt"></print-options>
    </Layout>
</template>

