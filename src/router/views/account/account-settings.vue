<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { required, email, minLength } from "vuelidate/lib/validators";
import MaskedInput from "vue-text-mask";
import { cloneDeep } from "lodash";

export default {
    page: {
        title: "Account Settings",
    },
    components: {
        Layout,
        PageHeader,
        MaskedInput,
    },
    created() {
        this.getUser();
    },
    data() {
        return {
            title: "Account Settings",
            submitted: false,
            items: [
                {
                    text: "Dashboards",
                    href: "/",
                },
                {
                    text: "Account Settings",
                    active: true,
                },
            ],
            username: JSON.parse(localStorage.getItem("user")).userName,
            password: {
                old: "",
                new: "",
                confirm: "",
            },
            alert: {
                type: "",
                message: "",
            },
            profileEmail: "",
            userProfile: {
                applicationUser: {
                    phoneNumberConfirmed: false,
                },
            },
            updatePhone: false,
            updateEmail: false,
            phoneNumber: "09",
            vStep1: "",
            vStep2: "",
            vStep3: "",
            vStep4: "",
            vStep5: "",
            vStep6: "",
        };
    },
    validations: {
        password: {
            old: { required },
            new: { required },
            confirm: { required },
        },
        profileEmail: { required, email },
        phoneNumber: { required, minLength: minLength(11) },
        vStep1: { required },
        vStep2: { required },
        vStep3: { required },
        vStep4: { required },
        vStep5: { required },
        vStep6: { required },
    },
    methods: {
        getUser() {
            this.$store
                .dispatch("account/GetProfile")
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    if (!res.data.applicationUser.phoneNumber) {
                        this.phoneNumber = "09";
                    } else {
                        this.phoneNumber = cloneDeep(
                            res.data.applicationUser.phoneNumber
                        );
                    }
                    this.userProfile = res.data;
                    this.profileEmail = cloneDeep(res.data.email);
                })
                .catch((err) => {
                    return this.showToast(
                        "Something went wrong! - Getting User Profile",
                        "error"
                    );
                });
        },
        changePassword() {
            this.submitted = true;
            this.$v.password.$touch();
            if (this.$v.password.$invalid) {
                return;
            }
            if (this.password.new !== this.password.confirm) {
                return this.showToast(
                    "New password and confirm password does not match",
                    "error"
                );
            }
            this.$store
                .dispatch("account/ChangePassword", {
                    currentPassword: this.password.old,
                    newPassword: this.password.new,
                })
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    this.showToast("Password updated successfully", "success");
                    this.submitted = false;
                })
                .catch((err) => {
                    this.submitted = false;
                    this.showToast("Something went wrong!", "error");
                });
        },
        emailUpdate() {
            this.updateEmail = true;
        },
        submitEmailChanges() {
            this.$v.profileEmail.$touch();
            if (this.$v.profileEmail.$invalid) {
                return;
            }
            this.$store
                .dispatch("account/ChangeEmail", {
                    email: this.profileEmail,
                    id: this.userProfile.applicationUser.id,
                })
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    this.showToast("Email updated successfully", "success");
                    this.userProfile.email = cloneDeep(this.profileEmail);
                    this.updateEmail = false;
                })
                .catch((err) => {
                    this.showToast("Something went wrong!", "error");
                });
        },
        cancelEmailUpdate() {
            this.updateEmail = false;
            this.profileEmail = cloneDeep(this.userProfile.email);
        },
        numberUpdate() {
            this.updatePhone = true;
        },
        submitNumberChanges() {
            this.$v.phoneNumber.$touch();
            if (this.$v.phoneNumber.$invalid) {
                return;
            }
            this.$store
                .dispatch("account/ChangePhoneNumber", {
                    phoneNumber: this.phoneNumber.replace(/ /g, ""),
                    id: this.userProfile.applicationUser.id,
                })
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    this.showToast(
                        "Phone Number updated successfully",
                        "success"
                    );
                    this.userProfile.email = cloneDeep(this.phoneNumber);
                    this.updatePhone = false;
                })
                .catch((err) => {
                    this.showToast("Something went wrong!", "error");
                });
        },
        cancelNumberUpdate() {
            this.updatePhone = false;
            this.profileEmail = cloneDeep(this.userProfile.email);
        },
        verifyNumber() {
            this.$store
                .dispatch("account/VerifyPhoneNumber")
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    this.$bvModal.show("verify-modal");
                })
                .catch((err) => {
                    this.showToast("Something went wrong!", "error");
                });
        },
        checkNumber(event) {
            if (!isNaN(event.key)) {
                if (
                    event.target.nextSibling &&
                    event.target.nextSibling.tagName.toLowerCase() === "input"
                ) {
                    event.target.nextSibling.focus();
                } else {
                    this.verifyNow();
                }
            } else {
                if (
                    event.key.toLowerCase() === "backspace" &&
                    event.target.previousSibling &&
                    event.target.previousSibling.tagName.toLowerCase() ===
                        "input"
                ) {
                    event.target.previousSibling.focus();
                    event.target.previousSibling.value = "";
                }
            }
        },
        verifyNow() {
            this.$v.vStep1.$touch();
            this.$v.vStep2.$touch();
            this.$v.vStep3.$touch();
            this.$v.vStep4.$touch();
            this.$v.vStep5.$touch();
            this.$v.vStep6.$touch();
            if (this.$v.vStep1.$invalid) {
                return;
            }
            if (this.$v.vStep2.$invalid) {
                return;
            }
            if (this.$v.vStep3.$invalid) {
                return;
            }
            if (this.$v.vStep4.$invalid) {
                return;
            }
            if (this.$v.vStep5.$invalid) {
                return;
            }
            if (this.$v.vStep6.$invalid) {
                return;
            }
            let code = `${this.vStep1}${this.vStep2}${this.vStep3}${this.vStep4}${this.vStep5}${this.vStep6}`;
            this.$store
                .dispatch("account/PhoneNumberVerification", code)
                .then((res) => {
                    if (res.data.error) {
                        return this.showToast(res.data.errorMessage, "error");
                    }
                    this.showToast("Phone Number was successfully verified", "success");
                    this.userProfile.applicationUser.phoneNumberConfirmed = true;
                    this.$bvModal.hide('verify-modal')
                })
                .catch((err) => {
                    this.showToast("Something went wrong!", "error");
                });
        },
    },
};
</script>
<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <b-modal
            id="verify-modal"
            title="Verification Code"
            size="md"
            title-class="font-18"
            hide-footer
            no-close-on-backdrop
        >
            <div class="text-center">
                <p class="text-center">
                    <b
                        >Please enter the verification code sent to your phone
                        number</b
                    >
                </p>
                <div id="form">
                    <masked-input
                        type="text"
                        maxLength="1"
                        size="1"
                        :mask="[/[0-9]/, /\d/]"
                        v-on:keyup="checkNumber"
                        :guide="false"
                        v-model="vStep1"
                        :class="{
                        'is-invalid':
                            $v.vStep1.$error,
                        }"
                    ></masked-input>
                    <masked-input
                        type="text"
                        maxLength="1"
                        size="1"
                        :mask="[/[0-9]/, /\d/]"
                        v-on:keyup="checkNumber"
                        :guide="false"
                        v-model="vStep2"
                        :class="{
                        'is-invalid':
                            $v.vStep2.$error,
                        }"
                    ></masked-input>
                    <masked-input
                        type="text"
                        maxLength="1"
                        size="1"
                        :mask="[/[0-9]/, /\d/]"
                        v-on:keyup="checkNumber"
                        :guide="false"
                        v-model="vStep3"
                        :class="{
                        'is-invalid':
                            $v.vStep3.$error,
                        }"
                    ></masked-input>
                    <masked-input
                        type="text"
                        maxLength="1"
                        size="1"
                        :mask="[/[0-9]/, /\d/]"
                        v-on:keyup="checkNumber"
                        :guide="false"
                        v-model="vStep4"
                        :class="{
                        'is-invalid':
                            $v.vStep4.$error,
                        }"
                    ></masked-input>
                    <masked-input
                        type="text"
                        maxLength="1"
                        size="1"
                        :mask="[/[0-9]/, /\d/]"
                        v-on:keyup="checkNumber"
                        :guide="false"
                        v-model="vStep5"
                        :class="{
                        'is-invalid':
                            $v.vStep5.$error,
                        }"
                    ></masked-input>
                    <masked-input
                        type="text"
                        maxLength="1"
                        size="1"
                        :mask="[/[0-9]/, /\d/]"
                        v-on:keyup="checkNumber"
                        :guide="false"
                        v-model="vStep6"
                        :class="{
                        'is-invalid':
                            $v.vStep6.$error,
                        }"
                    ></masked-input>
                </div>
                <b-button class="mt-3" variant="primary" @click="verifyNow">
                    Verify
                </b-button>
            </div>
        </b-modal>
        <div class="row">
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
                            <i class="bx bx-user"></i>
                        </span>
                        <span class="d-none d-sm-inline-block"
                            ><i class="bx bx-user me-1"></i> General</span
                        >
                    </template>
                    <div class="card">
                        <div class="card-body">
                            <div class="media mb-5">
                                <div class="media-aside align-self-start me-3">
                                    <!-- <a href="#" target="_self" class=""
                                        ><img
                                            src="../../assets/images/profile-img.png"
                                            height="80"
                                            class="rounded border"
                                    /></a> -->
                                    <a
                                        href="javascript:void(0);"
                                        class="
                                            p-3
                                            d-flex
                                            align-items-center
                                            justify-content-center
                                            bg-success bg-soft
                                            text-white
                                            font-size-22
                                            rounded
                                        "
                                    >
                                        {{ username.slice(0, 2).toUpperCase() }}
                                    </a>
                                </div>
                                <div class="media-body align-self-end">
                                    <button
                                        type="button"
                                        class="btn me-1 btn-primary btn-sm"
                                    >
                                        Upload</button
                                    ><input
                                        hidden="hidden"
                                        type="file"
                                        accept=".jpg, .png, .gif"
                                        class="form-control-file"
                                        id="__BVID__1347"
                                    /><button
                                        type="button"
                                        class="
                                            btn
                                            mb-75
                                            mr-75
                                            btn-outline-secondary btn-sm
                                        "
                                    >
                                        Reset
                                    </button>
                                    <p class="card-text mt-2">
                                        Allowed JPG, GIF or PNG. Max size of
                                        800kB
                                    </p>
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col-sm-3">
                                    <div class="form-group">
                                        <label for="name">First Name</label>
                                        <input
                                            autocomplete="off"
                                            type="text"
                                            class="form-control"
                                            id="fname"
                                            placeholder="First Name"
                                            v-model="userProfile.firstName"
                                        />
                                    </div>
                                </div>
                                <div class="col-sm-3">
                                    <div class="form-group">
                                        <label for="name">Middle Name</label>
                                        <input
                                            autocomplete="off"
                                            type="text"
                                            class="form-control"
                                            id="mname"
                                            placeholder="Middle Name"
                                            v-model="userProfile.middleName"
                                        />
                                    </div>
                                </div>
                                <div class="col-sm-3">
                                    <div class="form-group">
                                        <label for="name">Last Name</label>
                                        <input
                                            autocomplete="off"
                                            type="text"
                                            class="form-control"
                                            id="lname"
                                            placeholder="Last Name"
                                            v-model="userProfile.lastName"
                                        />
                                    </div>
                                </div>
                                <div class="col-sm-3">
                                    <label for="email">Email</label>
                                    <b-input-group>
                                        <template #append>
                                            <b-button
                                                @click="emailUpdate"
                                                variant="outline-info"
                                                v-if="!updateEmail"
                                                ><i class="bx bx-edit"></i
                                            ></b-button>
                                            <b-button
                                                v-if="updateEmail"
                                                @click="submitEmailChanges"
                                                variant="outline-success"
                                                ><i class="bx bx-check"></i
                                            ></b-button>
                                            <b-button
                                                v-if="updateEmail"
                                                @click="cancelEmailUpdate"
                                                variant="outline-danger"
                                                ><i class="bx bx-x"></i
                                            ></b-button>
                                        </template>
                                        <input
                                            autocomplete="off"
                                            type="email"
                                            class="form-control"
                                            id="email"
                                            placeholder="Email"
                                            v-model="profileEmail"
                                            :disabled="!updateEmail"
                                            :class="{
                                                'is-invalid':
                                                    $v.profileEmail.$error,
                                            }"
                                        />
                                    </b-input-group>
                                    <div
                                        v-if="$v.profileEmail.$error"
                                        class="invalid-feedback"
                                    >
                                        <span v-if="!$v.profileEmail.required"
                                            >This value is required.</span
                                        >
                                        <span v-if="!$v.profileEmail.email"
                                            >Must be email format.</span
                                        >
                                    </div>
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col-sm-3">
                                    <div class="form-group">
                                        <label for="phoneNumber"
                                            >Phone Number</label
                                        >
                                        <b-input-group>
                                            <template #append>
                                                <b-button
                                                    @click="numberUpdate"
                                                    variant="outline-info"
                                                    v-if="!updatePhone"
                                                    ><i class="bx bx-edit"></i
                                                ></b-button>
                                                <b-button
                                                    v-if="updatePhone"
                                                    @click="submitNumberChanges"
                                                    variant="outline-success"
                                                    ><i class="bx bx-check"></i
                                                ></b-button>
                                                <b-button
                                                    v-if="updatePhone"
                                                    @click="cancelNumberUpdate"
                                                    variant="outline-danger"
                                                    ><i class="bx bx-x"></i
                                                ></b-button>
                                            </template>
                                            <masked-input
                                                autocomplete="off"
                                                type="text"
                                                class="form-control"
                                                id="phoneNumber"
                                                placeholder="Phone Number"
                                                v-model="phoneNumber"
                                                :mask="[
                                                    /[0-9]/,
                                                    /\d/,
                                                    /\d/,
                                                    /\d/,
                                                    ' ',
                                                    /\d/,
                                                    /\d/,
                                                    /\d/,
                                                    ' ',
                                                    /\d/,
                                                    /\d/,
                                                    /\d/,
                                                    /\d/,
                                                ]"
                                                :guide="false"
                                                :disabled="!updatePhone"
                                                :class="{
                                                'is-invalid':
                                                    $v.phoneNumber.$error,
                                                }"
                                            ></masked-input>
                                        </b-input-group>
                                        <div
                                            v-if="$v.phoneNumber.$error"
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="!$v.phoneNumber.required"
                                                >This value is required.</span
                                            >
                                            <span
                                                v-if="!$v.phoneNumber.minLength"
                                                >Must be 11 digit.</span
                                            >
                                        </div>
                                        <div
                                            v-if="
                                                !userProfile.applicationUser
                                                    .phoneNumberConfirmed
                                            "
                                        >
                                            <small class="text-warning">
                                                <i
                                                    class="bx bx-info-circle"
                                                ></i>
                                                <i>Verify Phone Number</i>
                                                <a
                                                    href="javascript:void(0);"
                                                    class="ms-1"
                                                    @click="verifyNumber"
                                                    >[Click here to verify]</a
                                                >
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div class="text-right">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bx bx-save me-1"></i> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </b-tab>
                <b-tab title-item-class="mb-2">
                    <template v-slot:title>
                        <span class="d-inline-block d-sm-none">
                            <i class="bx bx-lock"></i>
                        </span>
                        <span class="d-none d-sm-inline-block"
                            ><i class="bx bx-lock me-1"></i> Password</span
                        >
                    </template>
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-sm-4">
                                    <div class="form-group">
                                        <label for="old">Old Password</label>
                                        <input
                                            autocomplete="off"
                                            type="password"
                                            class="form-control"
                                            id="old"
                                            placeholder="Old Password"
                                            v-model="password.old"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.password.old.$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.password.old.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="!$v.password.old.required"
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-4">
                                    <div class="form-group">
                                        <label for="new">New Password</label>
                                        <input
                                            autocomplete="off"
                                            type="password"
                                            class="form-control"
                                            id="new"
                                            placeholder="New Password"
                                            v-model="password.new"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.password.new.$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.password.new.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="!$v.password.new.required"
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-4">
                                    <div class="form-group">
                                        <label for="confirm"
                                            >Retype New Password</label
                                        >
                                        <input
                                            autocomplete="off"
                                            type="password"
                                            class="form-control"
                                            id="confirm"
                                            placeholder="Retype New Password"
                                            v-model="password.confirm"
                                            :class="{
                                                'is-invalid':
                                                    submitted &&
                                                    $v.password.confirm.$error,
                                            }"
                                        />
                                        <div
                                            v-if="
                                                submitted &&
                                                $v.password.confirm.$error
                                            "
                                            class="invalid-feedback"
                                        >
                                            <span
                                                v-if="
                                                    !$v.password.confirm
                                                        .required
                                                "
                                                >This value is required.</span
                                            >
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div class="text-right">
                                <button
                                    type="button"
                                    @click="changePassword"
                                    class="btn btn-primary"
                                >
                                    <i class="bx bx-save me-1"></i> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </b-tab>
            </b-tabs>
        </div>
    </Layout>
</template>