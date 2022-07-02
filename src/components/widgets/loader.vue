<script>
import axios from "axios";

/**
 * Preloader component
 */
export default {
  data() {
    return {};
  },
  props: {
    loading: Boolean,
  },
};
</script>

<template>
  <div :class="{ 'is-loading': loading }" v-if="loading">
    <div class="preloader-component">
      <div class="status">
        <div class="spinner-chase">
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
        </div>
      </div>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.is-loading {
  position: relative;
}
.preloader-component {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 2000;
  width: 100%;
}
.status {
  width: 40px;
  height: 40px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin: -20px 0 0 -20px;
}
</style>