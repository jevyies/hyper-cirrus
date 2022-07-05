<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import AccessList from '@/router/views/administration/settings-template/access-list';

export default {
    page: {
        title: "Admin Settings",
    },
    components: {
        Layout,
        PageHeader,
        AccessList
    },
    data() {
        return {
            title: "Admin Settings",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Admin Settings",
                    active: true,
                },
            ],
        }
    },
}
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
                        >Access List</span>
                </template>
                <access-list ref="accessList"></access-list>
            </b-tab>
        </b-tabs>
    </Layout>
</template>