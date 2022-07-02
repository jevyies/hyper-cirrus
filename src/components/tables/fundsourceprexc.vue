<script>
export default {
  props: {
    prexcTable: null,
    tableBusy: null,
  },
  data() {
    return {
      prexcFields: [
        {
          key: "uacs",
          label: "UACS Code",
          sortable: true,
          tdClass: "py-1 fontfont-size: 11px;",
        },
        {
          key: "prexcName",
          label: "Prexc Name",
          sortable: true,
          tdClass: "py-1 fontfont-size: 11px;",
        },
        {
          key: "classification",
          label: "Classification",
          sortable: false,
          tdClass: "py-1 fontfont-size: 11px;",
        },
        {
          key: "action",
          label: "Actions",
          sortable: false,
          tdClass: "py-1 fontfont-size: 11px;",
        },
      ],
    };
  },
  methods: {
    viewOE(data) {
      // console.log(data);
      this.$router.push(`/finance/expenditures/${data}`);
    },
  },
};
</script>

<template>
  <div class="table-responsive">
    <b-table
      class="datatables"
      :items="prexcTable"
      :fields="prexcFields"
      responsive="sm"
      :busy="tableBusy"
      bordered
      outlined
      hover
      striped
      show-empty
    >
      <template #cell(classification)="row">
        <p class="mb-0">{{ row.item.prexcClassification.classification }}</p>
        <small
          ><strong>Priority: </strong>{{ row.item.prexcClassification.priority }}</small
        ><br />
      </template>
      <template #cell(action)="row">
        <div class="float-end">
          <b-dropdown
            id="dropdown-dropleft"
            right
            variant="link"
            toggle-class="text-decoration-none"
            menu-class="dropdown-menu-end"
            no-caret
          >
            <template #button-content>
              <i class="fas fa-ellipsis-v"></i>
            </template>
            <b-dropdown-item variant="secondary" @click="viewOE(row.item.id)"
              ><i class="mdi mdi-view-list font-size-18 me-1"></i>View
              Expenditures</b-dropdown-item
            >
          </b-dropdown>
        </div>
      </template>
    </b-table>
  </div>
</template>
