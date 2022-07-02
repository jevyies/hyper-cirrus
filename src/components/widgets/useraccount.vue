<script>
import { required, email, minLength } from "vuelidate/lib/validators";

export default {
  props: {
    record: {},
  },
  data() {
    return {
      credentials: {
        employeeId: 0,
        isDisable: false,
        isAdmin: false,
        userName: null,
        email: null,
        password: null,
      },
      credentialModal: false,
      submitted: false,
      info: {
        id: 0,
        isAdmin: null,
        isDisable: null,
      },
      loading: false,
    };
  },
  created() {
    if (this.record.applicationUser) {
      this.info = {
        id: this.record.id,
        isAdmin: this.record.applicationUser.isAdmin,
        isDisable: this.record.applicationUser.isDisable,
      };
    }
  },
  methods: {
    displayModal(record) {
      this.credentials.employeeId = record.id;
      this.credentialModal = true;
    },
    onReset() {
      this.credentials = {
        employeeId: 0,
        isDisable: false,
        isAdmin: false,
        userName: null,
        email: null,
        password: null,
      };
    },
    testing() {
      console.log(window.location.origin);
    },
    onSubmit() {
      this.submitted = true;
      this.$v.credentials.$touch();
      if (this.$v.credentials.$invalid) {
        return;
      } else {
        this.pageLoader(true);
        this.$store
          .dispatch("auth/createAccount", this.credentials)
          .then((response) => {
            console.log(response);
            if (response.data.error) {
              // this.credentialModal = false;
              this.showToast(response.data.errorMessage, "error");
              return;
            }
            const url = `${window.location.origin}/confirmation`;
            this.$store
              .dispatch("auth/sendEmailConfirmation", {
                email: this.credentials.email,
                url: url,
              })
              .then(() => {
                this.$emit("close");
                this.credentialModal = false;
                this.pageLoader(false);
                this.onReset();
                this.showToast("Account created successfully", "success");
              })
              .catch((error) => {
                this.pageLoader(false);
                this.showToast(
                  "Cannot send confirmation to user. Please ask your administrator",
                  "error"
                );
              });
            // this.credentialModal = false;
            // this.onReset();
            // this.showToast("Account created successfully", "success");
          })
          .catch((error) => {
            this.pageLoader(false);
            this.showToast(
              "Something went wrong. Failed to create account. Please contact your administrator",
              "error"
            );
          });
      }
    },
    updateCredentials() {
      this.$store
        .dispatch("auth/updateCredentials", { id: this.info.id, data: this.info })
        .then((response) => {
          console.log(response);
          if (response.data.error) {
            this.showToast("Cannot update info. " + response.data.errorMessage, "error");
            return;
          }
          this.showToast("Account updated successfully", "success");
        })
        .catch((error) => {
          this.showToast(
            "Something went wrong. Failed to update account. Please contact your administrator",
            "error"
          );
        });
    },
  },
  validations: {
    credentials: {
      userName: { required },
      email: { required, email },
      password: { required, minLength: minLength(6) },
    },
  },
};
</script>
<template>
  <div>
    <div class="card overflow-hidden">
      <div class="bg-primary bg-soft">
        <div class="row">
          <div class="col-7">
            <div class="text-primary p-3">
              <h5 class="text-light mb-3">Account information</h5>
              <!-- <p>It will seem like simplified</p> -->
            </div>
          </div>
          <!-- <div class="col-5 align-self-end">
            <img src="assets/images/profile-img.png" alt="" class="img-fluid" />
          </div> -->
        </div>
      </div>
      <div class="card-body pt-0">
        <div class="row">
          <div class="col-sm-7">
            <div class="avatar-md profile-user-wid mb-1">
              <div class="avatar-sm">
                <span
                  class="avatar-title rounded-circle bg-soft bg-info text-info font-size-15"
                >
                  {{ record.firstName.toUpperCase().charAt(0)
                  }}{{ record.lastName.toUpperCase().charAt(0) }}
                </span>
              </div>
            </div>
            <h5 class="font-size-15 text-truncate mb-0">
              {{ `${record.firstName} ${record.lastName}` }}
            </h5>
            <small class="text-muted mb-0 text-truncate">{{ record.position }}</small>
          </div>

          <div class="col-sm-5 text-end">
            <div class="pt-4 mt-4">
              <b-button
                size="sm"
                variant="primary"
                @click="displayModal(record)"
                v-if="!record.applicationUser"
              >
                <i class="bx bx-user-plus font-size-16 align-middle me-2"></i>
                Create Account
              </b-button>
            </div>
          </div>
        </div>
        <div class="table-responsive mt-4">
          <table class="table table-nowrap mb-0 table-sm">
            <tbody>
              <tr>
                <th scope="row">Office :</th>
                <td class="text-warning">
                  {{
                    record.department.deliveryUnit
                      ? record.department.deliveryUnit.name
                      : "No record"
                  }}
                </td>
              </tr>
              <tr>
                <th scope="row">Department :</th>
                <td class="text-warning">
                  {{ record.department ? record.department.departmentName : "No record" }}
                </td>
              </tr>
              <tr>
                <th scope="row">Email :</th>
                <td class="text-warning">
                  {{ record.email ? record.email : "No record" }}
                </td>
              </tr>
              <tr>
                <th scope="row">Username:</th>
                <td>
                  {{
                    record.applicationUser
                      ? record.applicationUser.userName
                      : "No Record Found"
                  }}
                </td>
              </tr>
              <tr>
                <th scope="row">Admin :</th>
                <td v-if="!record.applicationUser">No Record Found</td>
                <td v-else>
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="isActiveInfo"
                      v-model="info.isAdmin"
                      @change="updateCredentials"
                    />
                    <label class="form-check-label" for="isActiveInfo">{{
                      info.isAdmin ? "Yes" : "No"
                    }}</label>
                  </div>
                </td>
              </tr>
              <tr>
                <th scope="row">Disabled :</th>
                <td v-if="!record.applicationUser">No Record Found</td>
                <td v-else>
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="isDisableInfo"
                      v-model="info.isDisable"
                      @change="updateCredentials"
                    />
                    <label class="form-check-label" for="isDisableInfo">{{
                      info.isDisable ? "Yes" : "No"
                    }}</label>
                  </div>
                </td>
              </tr>
              <tr>
                <th scope="row">Password changed :</th>
                <td>
                  {{
                    record.applicationUser
                      ? record.applicationUser.passwordChanged
                      : "No Record Found"
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- Modal here -->
    <b-modal
      v-model="credentialModal"
      title="Create User Credentials"
      hide-footer
      no-close-on-backdrop
    >
      <div class="mb-3">
        <p>
          <strong>Create account for: </strong
          ><span class="text-warning">{{ record.firstName }} {{ record.lastName }}</span>
        </p>
      </div>
      <hr />
      <b-overlay :show="loading" rounded="sm">
        <div class="mb-3">
          <label>Username</label>
          <b-input
            v-model="credentials.userName"
            placeholder="Enter Username..."
            :class="{
              'is-invalid': submitted && $v.credentials.userName.$error,
            }"
          ></b-input>
          <div
            v-if="submitted && $v.credentials.userName.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.credentials.userName.required">This value is required.</span>
          </div>
        </div>
        <div class="mb-3">
          <label>Email</label>
          <b-input
            v-model="credentials.email"
            placeholder="Enter Email..."
            :class="{
              'is-invalid': submitted && $v.credentials.email.$error,
            }"
          ></b-input>
          <div v-if="submitted && $v.credentials.email.$error" class="invalid-feedback">
            <span v-if="!$v.credentials.email.required">This value is required. </span>
            <span v-if="!$v.credentials.email.email"
              >Please input valid email address.
            </span>
          </div>
        </div>
        <div class="mb-3">
          <label>Password</label>
          <b-input
            v-model="credentials.password"
            type="password"
            placeholder="Enter Password..."
            :class="{
              'is-invalid': submitted && $v.credentials.password.$error,
            }"
          ></b-input>
          <div
            v-if="submitted && $v.credentials.password.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.credentials.password.required">This value is required. </span>
            <span v-if="!$v.credentials.password.minLength"
              >Password shoule be at least 6 characters.
            </span>
          </div>
        </div>
        <div class="form-check form-switch mb-3">
          <input
            class="form-check-input"
            type="checkbox"
            id="isAdmin"
            v-model="credentials.isAdmin"
          />
          <label class="form-check-label" for="isAdmin">{{
            credentials.isAdmin ? "Administrator" : "Not Administrator"
          }}</label>
        </div>
        <div class="form-check form-switch mb-3">
          <input
            class="form-check-input"
            type="checkbox"
            id="isActive"
            v-model="credentials.isDisable"
          />
          <label class="form-check-label" for="isActive">{{
            credentials.isDisable ? "Active" : "Inactive"
          }}</label>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary" @click="onSubmit">Save</button>
          <button type="button" class="btn btn-link">Close</button>
        </div>
      </b-overlay>
    </b-modal>
    <!-- Modal here -->
  </div>
</template>
