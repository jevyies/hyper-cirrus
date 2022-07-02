<script>
import { decode } from "querystring";

export default {
  name: "confirmation",
  title: "Confirmation",
  data() {
    return {
      userId: this.$route.query.userId,
      token: this.$route.query.token,
      confirm: false,
      invalidToken: false,
    };
  },
  created() {
    this.confirm = true;
    if (this.$route.query) {
      this.$store
        .dispatch("auth/verifyEmail", {
          userId: this.$route.query.userId,
          token: decodeURI(this.$route.query.token),
        })
        .then((response) => {
          if (response.data.error) {
            this.confirm = false;
            this.invalidToken = true;
            return;
          }
          this.confirm = false;
        })
        .catch(() => {
          this.showToast("Failed to confirm. Please contact your administrator", "error");
        });
    }
  },
  methods: {
    gotoLogin() {
      this.$router.push("/login");
    },
  },
};
</script>
<template>
  <div class="my-5 pt-sm-5">
    <div class="container">
      <div class="row">
        <div class="col-lg-12">
          <div class="text-center">
            <div class="row justify-content-center mt-5">
              <div>
                <img src="@/assets/images/coming-soon.svg" alt height="300" v-if="invalidToken"/>
                <img src="@/assets/images/coming-soon.svg" alt height="300" v-if="!invalidToken"/>
              </div>
              <!-- confirming -->
              <div class="col-sm-4" v-if="confirm">
                <h4 class="mt-5">Processing....</h4>
                <p class="text-muted">
                  Please wait while we process your request. This won't take too long.
                  Thank you!
                </p>
              </div>
              <div class="col-sm-4" v-if="invalidToken">
                <h4 class="mt-5">Invalid Token</h4>
                <!-- <p class="text-muted">
                  Th
                </p> -->
              </div>


              <!-- confirmed -->

              <div class="col-sm-4" v-else>
                <h4 class="mt-5">CONFIRMED!</h4>
                <p class="text-muted">
                  Your account has been confirmed. Please click the button below to
                  proceed to login page.
                </p>
                <b-button variant="primary" class="btn-block" @click="gotoLogin"
                  >Go to Login</b-button
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
