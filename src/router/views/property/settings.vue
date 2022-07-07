<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Location from '@/router/views/property/settings-template/location';

export default {
    page: {
        title: "Supply & Assets Settings",
    },
    components: {
        Layout,
        PageHeader,
        Location
    },
    data() {
        return {
            title: "Supply & Assets Settings",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Supply & Assets Settings",
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
                        >Location</span>
                </template>
                <location ref="location"></location>
            </b-tab>
        </b-tabs>
    </Layout>
</template>