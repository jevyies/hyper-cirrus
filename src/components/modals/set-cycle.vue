<script>
export default {
  name: "SetCycle",
  data() {
    return {
      cycle: this.$store.getters["data/getCycle"],
      cycles: [],
      indexSelected: -1,
    };
  },
  methods: {
    hideModal() {
      this.$bvModal.hide("set-cycle-modal");
    },
    dropData() {
      this.$store.commit("data/changeCycle", this.cycle);
      this.$bvModal.hide("set-cycle-modal");
      this.$emit("changeCycle", this.cycle);
    },
  },
  created() {
    var cycles = [{ text: "", value: 0 }];
    this.$store
      .dispatch("cycle/GetAllCycle")
      .then((res) => {
        res.data.forEach((item) => {
          cycles.push({ value: item.year, text: item.year });
        });
        this.cycles = cycles;
      })
      .catch(() => {
        this.showToast("Something went wrong!","error");
      });
  },
};
</script>

<template>
  <b-modal
    id="set-cycle-modal"
    title="Set Cycle"
    size="sm"
    title-class="font-18"
    hide-footer
    no-close-on-backdrop
  >
    <div class="mb-3">
      <label for="name">Cycle </label>
      <b-form-select
        v-model="cycle"
        :options="cycles"
        class="form-select"
      ></b-form-select>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-primary" @click="dropData">Set Cycle</button>
      <button type="button" class="btn btn-link" @click="hideModal">Close</button>
    </div>
  </b-modal>
</template>
