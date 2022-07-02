<script>
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
/**
 * Recover password Sample page
 */
export default {
    data() {
        return {
            submitted: false,
            old_password: "",
            password: "",
            password_confirmation: "",
            buttonName: "Reset",
            isAuthError: false,
            authError: "",
        };
    },
    validations: {
        old_password: {
            required,
        },
        password: {
            required,
        },
        password_confirmation: {
            required,
        },
    },
    methods: {
        tryToResetpwd() {
            this.submitted = true;
            // stop here if form is invalid
            this.$v.$touch();

            if (this.$v.$invalid) {
                return;
            } else {
                this.buttonName = "Resetting";
                this.$store
                    .dispatch("account/ChangePassword", {
                        currentPassword: this.old_password,
                        newPassword: this.password,
                    })
                    .then((res) => {
                        if (res.data.error) {
                            this.isAuthError = true;
                            this.authError = res.data.errorMessage;
                            this.buttonName = "Reset";
                        }else{
                            this.$router.push({ name: "default" });
                        }
                    })
                    .catch((err) => {
                        this.isAuthError = true;
                        this.authError = "Old Password is incorrect";
                        this.buttonName = "Reset";
                    });
            }
        },
    },
    page: {
        title: "Reset password",
        meta: [
            {
                name: "description",
                content: appConfig.description,
            },
        ],
    },
};
</script>

<template>
    <div class="account-pages my-5 pt-5">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6 col-xl-5">
                    <div class="card overflow-hidden">
                        <div class="bg-soft-primary">
                            <div class="row">
                                <div class="col-7">
                                    <div class="text-primary p-4">
                                        <h5 class="text-primary">
                                            Reset Password
                                        </h5>
                                        <p>
                                            Your using default password. Reset
                                            your password
                                        </p>
                                    </div>
                                </div>
                                <div class="col-5 align-self-end">
                                    <img
                                        src="@/assets/images/profile-img.png"
                                        alt
                                        class="img-fluid"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="card-body pt-0">
                            <div>
                                <a href="/">
                                    <div
                                        class="avatar-md profile-user-wid mb-4"
                                    >
                                        <span
                                            class="
                                                avatar-title
                                                rounded-circle
                                                bg-light
                                            "
                                        >
                                            <img
                                                src="@/assets/images/logo.svg"
                                                alt
                                                class="rounded-circle"
                                                height="34"
                                            />
                                        </span>
                                    </div>
                                </a>
                            </div>
                            <b-alert :show="isAuthError" variant="danger">
                                <i class="mdi mdi-block-helper me-2"></i
                                >{{ authError }}
                            </b-alert>
                            <div class="p-2">
                                <form
                                    class="form-horizontal"
                                    @submit.prevent="tryToResetpwd"
                                >
                                    <div class="form-group mb-3">
                                        <label for="old_password"
                                            >Current Password</label
                                        >
                                        <input
                                            type="password"
                                            v-model="old_password"
                                            class="form-control"
                                            id="old_password"
                                            placeholder="Enter Current Password"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.old_password.$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                !$v.old_password.required
                                            "
                                            class="invalid-feedback"
                                        >
                                            Password is required.
                                        </div>
                                    </div>

                                    <div class="form-group mb-3">
                                        <label for="password"
                                            >New Password</label
                                        >
                                        <input
                                            type="password"
                                            v-model="password"
                                            class="form-control"
                                            id="password"
                                            placeholder="Enter new password"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.password.$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                !$v.password.required
                                            "
                                            class="invalid-feedback"
                                        >
                                            Password is required.
                                        </div>
                                    </div>

                                    <div class="form-group mb-3">
                                        <label for="confirm_pwd"
                                            >Confirm Password</label
                                        >
                                        <input
                                            v-model="password_confirmation"
                                            type="password"
                                            class="form-control"
                                            id="confirm_pwd"
                                            placeholder="Enter confirm password"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.password_confirmation
                                                        .$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                !$v.password_confirmation
                                                    .required
                                            "
                                            class="invalid-feedback"
                                        >
                                            Password is required.
                                        </div>
                                    </div>

                                    <div class="form-group row mb-0">
                                        <div class="col-12 text-end">
                                            <button
                                                class="btn btn-primary w-md"
                                                type="submit"
                                            >
                                                {{ buttonName }}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
