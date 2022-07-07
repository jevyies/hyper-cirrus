<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import RequestForPayments from "@/components/widgets/request-for-payments";
import RequestedForPayment from "@/components/widgets/requested-for-payment";
import PrintOptions from "@/components/modals/print-options.vue";

export default {
    page: {
        title: "For Charging",
    },
    components: {
        Layout,
        PageHeader,
        RequestForPayments,
        RequestedForPayment,
        PrintOptions,
    },
    data() {
        return {
            title: "For Charging",
            items: [
                {
                    text: "Dashboard",
                    href: "/",
                },
                {
                    text: "For Charging",
                    active: true,
                },
            ],
            available: [],
            posted: [],
            pending: [],
        };
    },
    methods: {
        changeCycle(cycle) {
            this.fetchList(cycle)
        },
        async fetchList(cycle) {
            const available = await this.$store.dispatch(
                "rfppayment/getAllAvailable",
                cycle
            );
            available.data.forEach((item) => {
                item.searchItem = `${item.objectOfExpenditure.fundSource.sourceName} ${item.objectOfExpenditure.account.accountGroup.groupName} ${item.objectOfExpenditure.account.accountGroup.fundClassification.classification}  ${item.objectOfExpenditure.account.accountName}`;
            });
            this.available = available.data;
            const posted = await this.$store.dispatch(
                "rfppayment/getAllPosted",
                cycle
            );
            this.posted = posted.data;
            const pending = await this.$store.dispatch(
                "rfppayment/getAllPending",
                cycle
            );
            this.pending = pending.data;
        },
        async updateAvailable(record) {
            if (record.action === "add") {
                let index = this.available.findIndex(
                    (item) => item.id == record.deliveryUnitBudgetItemId
                );
                this.available[index].available = record.balance;
                if (record.isPosted) {
                    this.posted.push(record.response);
                } else {
                    this.pending.push(record.response);
                }
            }
            if (record.action === "delete") {
                this.available.find(
                    (item) => item.id == record.data.deliveryUnitBudgetItemId
                ).available += record.data.amount;
                let index = this.pending.findIndex(
                    (item) => item.id == record.data.id
                );
                this.pending.splice(index, 1);
            }
            if (record.action === "update") {
                let index = this.available.findIndex(
                    (item) => item.id == record.deliveryUnitBudgetItemId
                );
                this.available[index].available = record.balance;
                let pendingIndex = this.pending.findIndex(
                    (item) => item.id == record.response.id
                );
                this.pending.splice(pendingIndex, 1, record.response);
            }
        },
        postPayment(record) {
            let data = record;
            data.status = "POSTED";
            this.pending.splice(this.pending.indexOf(record), 1);
            this.posted.push(data);
        },
        pushToPost(record) {
            this.posted.push(record);
        },
        printRFP(id) {
            this.$refs.printOpt.putOptions({
                apiUrl: "Finance/RFP/Payment/Print/RFP",
                routeVariables: [id],
            });
            this.$bvModal.show("print-options-modal");
        },
    },
    async created() {
        await this.fetchList(this.$store.state.data.cycle);
    },
};
</script>

<template>
    <Layout @changeCycle="changeCycle">
        <PageHeader :title="title" :items="items" />
        <b-tabs content-class="pt-3 pb-3 text-muted">
            <b-tab>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Available Items</span
                    >
                </template>
                <RequestForPayments
                    :records="available"
                    @updateAvailable="updateAvailable"
                    @pushToPost="pushToPost"
                />
            </b-tab>
            <b-tab>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block">Pending</span>
                </template>
                <RequestedForPayment
                    :records="pending"
                    @postPayment="postPayment"
                    @print-rfp="printRFP"
                />
            </b-tab>
            <b-tab>
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block">Posted</span>
                </template>
                <RequestedForPayment :records="posted" @print-rfp="printRFP" />
            </b-tab>
        </b-tabs>
        <print-options ref="printOpt"></print-options>
    </Layout>
</template>
