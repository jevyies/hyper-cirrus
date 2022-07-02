<script>
export default {
  components: {},
  props: {
    title: {
      type: String,
      default: '',
    },
    items: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
}
</script>

<template>
  <!-- start page title -->
  <div class="row mb-2">
    <div class="col-6 d-flex flex-row align-items-center">
      <h4 class="mb-0 font-size-18">{{ title }}</h4>
    </div>
    <div class="col-6 d-flex justify-content-end align-items-end">
      <div class="page-title-right">
        <ol class="breadcrumb m-0">
          <li class="breadcrumb-item" v-for="x in items" :key="x.id">
            <a href="javascript:void(0);" @click="$router.push(x.href)">{{x.text}}</a>
          </li>
        </ol>
        <!-- <b-breadcrumb :items="items" class="m-0"></b-breadcrumb> -->
      </div>
    </div>
  </div>
  <!-- end page title -->
</template>
