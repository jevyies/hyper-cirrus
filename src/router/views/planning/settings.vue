<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import CompanyList from '@/router/views/planning/settings-template/company-list';
import CompanyType from '@/router/views/planning/settings-template/company-type';
import PriorityApi from '@/router/views/planning/settings-template/priority-api';
import ApiType from '@/router/views/planning/settings-template/api-type';
import IndicatorItemClassification from '@/router/views/planning/settings-template/indicator-item-classification';
import PrexcClass from '@/router/views/planning/settings-template/prexc-classification';

export default {
    page: {
        title: "Planning Settings",
    },
    components: {
        Layout,
        PageHeader,
        CompanyList,
        CompanyType,
        PriorityApi,
        ApiType,
        IndicatorItemClassification,
        PrexcClass
    },
    data() {
        return {
            title: "Planning Settings",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Planning Settings",
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
                        >Company</span>
                </template>
                <company-list ref="companyList"></company-list>
            </b-tab>
            <b-tab title-item-class="mb-2">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Company Type</span>
                </template>
                <company-type ref="companyType"></company-type>
            </b-tab>
            <b-tab title-item-class="mb-2">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >API Type</span>
                </template>
                <api-type ref="apiType"></api-type>
            </b-tab>
            <b-tab title-item-class="mb-2">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Priority API</span>
                </template>
                <priority-api ref="priorityApi"></priority-api>
            </b-tab>
            <b-tab title-item-class="mb-2">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Indicator Item Classification</span>
                </template>
                <indicator-item-classification ref="indicatorItemClassification"></indicator-item-classification>
            </b-tab>
            <b-tab title-item-class="mb-2">
                <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                        <i class="bx bx-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block"
                        >Prexc Classification</span>
                </template>
                <prexc-class ref="prexcClass"></prexc-class>
            </b-tab>
        </b-tabs>
    </Layout>
</template>