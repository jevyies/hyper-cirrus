<script>
import Layout from "../../layouts/main";
import appConfig from "@/app.config";
import PageHeader from "@/components/page-header";

import Profile from "@/components/widgets/profile";
import Earning from "@/components/widgets/earning";
import Stat from "@/components/widgets/stat";
import Emailsent from "@/components/widgets/emailsent";
import SocialSource from "@/components/widgets/social-source";
import Activity from "@/components/widgets/activity";
import SellingProduct from "@/components/widgets/selling-product";

/**
 * Dashboard Component
 */
export default {
  page: {
    title: "Dashboard",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  components: {
    Layout,
    PageHeader,
    Profile,
    Earning,
    Stat,
    Emailsent,
    SocialSource,
    Activity,
    SellingProduct
  },
  data() {
    return {
      title: "Dashboard",
      items: [
        {
          text: "Home",
          href: "/",
        },
        {
          text: "Dashboards",
          active: true,
        },
      ],
      fetchingStats: true,
      earningStatus: true,
      statData: [
        {
          icon: "bx bx-copy-alt",
          title: "Orders",
          value: "1,235",
        },
        {
          icon: "bx bx-archive-in",
          title: "Revenue",
          value: "$35, 723",
        },
        {
          icon: "bx bx-purchase-tag-alt",
          title: "Average Price",
          value: "$16.2",
        },
      ],
    };
  },
  mounted() {},
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="row">
      <div class="col-xl-4">
        <Profile />
        <Earning />
      </div>
      <!-- end col -->
      <div class="col-xl-8">
        <div class="row">
          <div v-for="stat of statData" :key="stat.icon" class="col-md-4">
            <Stat :icon="stat.icon" :title="stat.title" :value="stat.value" />
          </div>
        </div>
        <Emailsent />
      </div>
    </div>
    <div class="row">
      <div class="col-xl-4">
        <SocialSource />
      </div>
      <!-- end col -->
      <div class="col-xl-4">
        <Activity />
      </div>
      <!-- end col -->
      <div class="col-xl-4">
        <SellingProduct />
      </div>
      <!-- end col -->
    </div>
  </Layout>
</template>
