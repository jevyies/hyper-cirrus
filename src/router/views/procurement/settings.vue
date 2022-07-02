<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import ItemList from '@/router/views/procurement/settings-template/item-list';
import UnitList from '@/router/views/procurement/settings-template/unit-list';
import ItemCategory from '@/router/views/procurement/settings-template/item-category';
import ModeOfProcurement from '@/router/views/procurement/settings-template/mode-of-procurement';
import SupplierList from '@/router/views/procurement/settings-template/supplier-list';

export default {
    page: {
        title: "Procurement Settings",
    },
    components: {
        Layout,
        PageHeader,
        ItemList,
        UnitList,
        ItemCategory,
        ModeOfProcurement,
        SupplierList
    },
    data() {
        return {
            title: "Procurement Settings",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Procurement Settings",
                    active: true,
                },
            ],
        }
    },
    methods: {
        
    }
};
</script>
<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <b-tabs
            pills
            vertical
            nav-class="p-0"
            nav-wrapper-class="col-sm-2"
            content-class="pt-0 px-2 text-muted"
        >
            <b-tab title-item-class="mb-2">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Items</span>
                </template>
                <item-list ref="itemList"></item-list>
            </b-tab>
            <b-tab title-item-class="mb-2">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Item Category</span>
                </template>
                <item-category ref="itemCategory"></item-category>
            </b-tab>
            <b-tab title-item-class="mb-2">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Units</span>
                </template>
                <unit-list ref="unitList"></unit-list>
            </b-tab>
            <b-tab title-item-class="mb-2">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Mode of Procurement</span>
                </template>
                <mode-of-procurement ref="modeOfProcurement"></mode-of-procurement>
            </b-tab>
            <b-tab title-item-class="mb-2">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Supplier</span>
                </template>
                <supplier-list ref="supplierList"></supplier-list>
            </b-tab>
        </b-tabs>
    </Layout>
</template>