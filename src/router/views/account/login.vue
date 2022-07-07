<script>
import Layout from "../../layouts/auth";
import { authMethods, authFackMethods, notificationMethods } from "@/state/helpers";
import { mapState } from "vuex";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
import GoogleSignInButton from "vue-google-signin-button-directive";

/**
 * Login component
 */
export default {
  page: {
    title: "Login",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  components: {
    Layout,
  },
  directives: {
    GoogleSignInButton,
  },
  data() {
    return {
      username: "",
      password: "",
      submitted: false,
      authError: null,
      tryingToLogIn: false,
      isAuthError: false,
      buttonName: "Login",
      clientId:
        "937184477679-ep1fnml2bggbmuueso6lfc1332189ktm.apps.googleusercontent.com",
      emailConfirm: false,
      emailToConfirm: ''
    };
  },
  validations: {
    username: {
      required,
    },
    password: {
      required,
    },
  },
  computed: {
    ...mapState("authfack", ["status"]),
    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
  },
  methods: {
    ...authMethods,
    ...authFackMethods,
    ...notificationMethods,
    // Try to log the user in with the username
    // and password they provided.
    tryToLogIn() {
      this.submitted = true;
      this.emailConfirm = false;
      this.isAuthError = false;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        this.buttonName = "Logging In";
        this.$store
          .dispatch("account/Login", {
            userName: this.username,
            password: this.password,
          })
          .then((res) => {
            if (res.data.error) {
              if(res.data.errorMessage.includes('email account')){
                this.emailConfirm = true;
                this.authError = `${res.data.errorMessage}`;
                this.emailToConfirm = res.data.messageData;
              }else{
                this.isAuthError = true;
                this.authError = res.data.errorMessage;
              }
              this.buttonName = "Login";
            } else {
              localStorage.setItem("user", JSON.stringify(res.data));
              localStorage.setItem("accessToken", res.data.accessToken);
              localStorage.setItem("userAccess", res.data.userAccessList);
              localStorage.setItem("roles", res.data.roles);
              if (res.data.passwordChanged) {
                return this.$router.go("/");
              } else {
                return this.$router.replace("/reset-password");
              }
            }
          })
          .catch((err) => {
            this.isAuthError = true;
            this.authError = "Something went wrong";
            this.buttonName = "Login";
          });
      }
    },
    OnGoogleAuthSuccess(data) {
      this.$store
        .dispatch("auth/googleLogin", { googleToken: data })
        .then((response) => {
          if (response.data.error) {
            this.showToast(response.data.errorMessage, "error");
            return;
          } else {
            localStorage.setItem("user", JSON.stringify(response.data));
            localStorage.setItem("accessToken", response.data.accessToken);
            this.$store.dispatch("auth/logIn", response.data);
            if (response.data.passwordChanged) {
              return this.$router.go("/");
            } else {
              return this.$router.replace("/reset-password");
            }
          }
        })
        .catch((error) => {
          this.showToast(
            "Login failure. Something went wrong. Please try again later",
            "error"
          );
          return;
        });
    },
    resendConfirmation(){
      const url = `${window.location.origin}/confirmation`;
      this.pageLoader(true);
      this.$store
        .dispatch("auth/sendEmailConfirmation", {
          email: this.emailToConfirm,
          url: url,
        })
        .then(() => {
          this.pageLoader(false);
          this.showToast("Successfully sent to Email", "success");
        })
        .catch((error) => {
          this.pageLoader(false);
          this.showToast(
            "Cannot send confirmation to user. Please ask your administrator",
            "error"
          );
        });
    },
    OnGoogleAuthFail(data) {
      console.log(data);
    },
  },
};
</script>

<template>
  <Layout>
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6 col-xl-5">
        <div class="card overflow-hidden">
          <div class="bg-soft bg-primary">
            <div class="row">
              <div class="col-7">
                <div class="text-primary p-4">
                  <h5 class="text-primary">Welcome Back !</h5>
                  <p>Sign in to continue</p>
                </div>
              </div>
              <div class="col-5 align-self-end">
                <img src="@/assets/images/profile-img.png" alt class="img-fluid" />
              </div>
            </div>
          </div>
          <div class="card-body pt-0">
            <div>
              <router-link tag="a" to="/">
                <div class="avatar-md profile-user-wid mb-4">
                  <span class="avatar-title rounded-circle bg-light">
                    <img src="@/assets/images/logo/g-colored.png" alt height="60" />
                  </span>
                </div>
              </router-link>
            </div>
            <b-alert v-model="isAuthError" variant="danger" class="mt-3" dismissible>{{
              authError
            }}</b-alert>
            <b-alert v-model="emailConfirm" variant="warning" class="mt-3" dismissible>{{
              authError 
            }}
            <br>
            {{emailToConfirm}}<a href="javascript:void(0);" @click="resendConfirmation()"> [Resend Confirmation]</a>
            </b-alert>

            <div v-if="notification.message" :class="'alert ' + notification.type">
              {{ notification.message }}
            </div>

            <b-form class="p-2" @submit.prevent="tryToLogIn">
              <b-form-group
                class="mb-3"
                id="input-group-1"
                label="Username"
                label-for="input-1"
              >
                <b-form-input
                  id="input-1"
                  v-model="username"
                  type="text"
                  placeholder="Enter username"
                  :class="{
                    'is-invalid': submitted && $v.username.$error,
                  }"
                  :disabled="buttonName === 'Logging In'"
                ></b-form-input>
                <div v-if="submitted && $v.username.$error" class="invalid-feedback">
                  <span v-if="!$v.username.required">Username is required.</span>
                </div>
              </b-form-group>

              <b-form-group
                class="mb-3"
                id="input-group-2"
                label="Password"
                label-for="input-2"
              >
                <b-form-input
                  id="input-2"
                  v-model="password"
                  type="password"
                  placeholder="Enter password"
                  :class="{
                    'is-invalid': submitted && $v.password.$error,
                  }"
                  :disabled="buttonName === 'Logging In'"
                ></b-form-input>
                <div v-if="submitted && !$v.password.required" class="invalid-feedback">
                  Password is required.
                </div>
              </b-form-group>
              <div class="mt-3 d-grid">
                <b-button
                  type="submit"
                  variant="primary"
                  class="btn-block d-flex align-items-center justify-content-center"
                  :disabled="buttonName === 'Logging In'"
                >
                  <b-spinner
                    class="m-2 small-size"
                    variant="dark"
                    role="status"
                    v-show="buttonName === 'Logging In'"
                  ></b-spinner>
                  {{ buttonName }}
                </b-button>
              </div>
              <div class="mt-3 justify-content-center align-items-center d-flex">
                <h5 class="font-size-14 mb-0">Sign in with</h5>
                <button
                  v-google-signin-button="clientId"
                  class="btn btn-default"
                  id="Google"
                  name="provider"
                  value="Google"
                  title="Log in using your Google account"
                  type="button"
                >
                  <img
                    width="20px"
                    style="margin-bottom: 3px; margin-right: 5px"
                    alt="Google sign-in"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
                  />
                  Google
                </button>
              </div>
              <div class="mt-4 text-center">
                <router-link tag="a" to="/forgot-password" class="text-muted">
                  <i class="mdi mdi-lock me-1"></i> Forgot your password?
                </router-link>
              </div>
            </b-form>
          </div>
          <!-- end card-body -->
        </div>
        <!-- end card -->

        <div class="mt-5 text-center">
          <p>
            Don't have an account ? Contact Admin
            <!-- <router-link tag="a" to="/register" class="fw-medium text-primary"
              >Contact Admin</router-link
            > -->
          </p>
          <p>© {{ new Date().getFullYear() }} Hyper Cirrus</p>
        </div>
        <!-- end row -->
      </div>
    </div>
  </Layout>
</template>

<style scoped>
.small-size {
  width: 15px;
  height: 15px;
}
</style>
