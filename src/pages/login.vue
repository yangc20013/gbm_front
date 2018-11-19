<template>
  <!--   <el-form :model="form" :rules="rules" ref="form" label-position="left" label-width="0px">
    <h3 class="title">后台管理登录</h3>
    <el-form-item prop="account">
      <el-input type="text" v-model="form.account" :maxlength='20' auto-complete="off" placeholder="请输入用户名" @keyup.enter.native='handleSubmit2'></el-input>
    </el-form-item>
    <el-form-item prop="checkPass">
      <el-input type="password" v-model="form.checkPass" :maxlength='16' auto-complete="off" placeholder="请输入密码" @keyup.enter.native='handleSubmit2'></el-input>
    </el-form-item>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit2" :loading="loading">登录</el-button>
    </el-form-item>
    <p class="forgetP" @click="goToforget">忘记密码？</p>
  </el-form> -->
  <el-row>
    <el-col :span="12" :offset="6">
      <div class="login">
        <el-row slot="body" :gutter="0">
          <el-col :span="24" :xs="24" :sm="16" :md="16" :lg="16">
            <el-form :model="form" :rules="rules" ref="form" label-position="left" label-width="0px" class="login-form">
              <div class="card-block">
                <h3 class="title">Vue-Admin</h3>
                <el-form-item prop="username">
                  <el-input type="text" v-model="form.username" :maxlength='20' auto-complete="off" placeholder="请输入用户名" @keyup.enter.native='handleSubmit2'></el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input type="password" v-model="form.password" :maxlength='16' auto-complete="off" placeholder="请输入密码" @keyup.enter.native='handleSubmit2'></el-input>
                </el-form-item>
                <el-form-item style="width:100%;">
                  <el-button type="primary" style="width:100%;" @click.native.prevent="login" :loading="loading">登录</el-button>
                </el-form-item>
                <p class="btn btn-link forgot" @click="goToforget">忘记密码？</p>
              </div>
            </el-form>
          </el-col>
          <el-col :span="24" :xs="24" :sm="8" :md="8" :lg="8">
            <div class="login-register">
              <div class="card-block">
                <h2>注册</h2>
                <p>平台暂时只支持使用公司邮箱注册.</p>
                <el-button type="info" class="btn btn-primary active m-t-1"> 马上注册</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import types from "../store/mutation-types";
import * as api from "../api";
import auth from "../common/auth";
import * as sysApi from "../services/sys";
import { mapGetters, mapActions, mapMutations } from "vuex";

export default {
  name: "login",
  data() {
    var validateAccount = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入用户名"));
      } else {
        var targ = /^[A-Za-z0-9]+$/;
        if (!targ.test(value)) {
          callback(new Error("用户名只支持英文、数字"));
        }
        callback();
      }
    };
    return {
      rules: {
        username: [
          { validator: validateAccount, trigger: "blur" },
          {
            min: 5,
            max: 18,
            required: true,
            message: "账号长度为5-18位",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 5,
            max: 18,
            required: true,
            message: "账号长度为5-18位",
            trigger: "blur"
          }
        ]
      },
      form: {
        username: "admin",
        password: "admin"
      },
      loading: false
    };
  },
  components: {},
  methods: {
    ...mapMutations({
      setUserInfo: types.SET_USER_INFO
    }),
    ...mapActions({
      loadMenuList: "loadMenuList" // 映射 this.load() 为 this.$store.dispatch('loadMenuList')
    }),
    login() {
      let _this = this;
      this.$refs["form"].validate(valid => {
        if (valid) {
          _this.loginSubmit();
        } else {
          console.log("valid error!!");
          return false;
        }
      });
    },
    loginSubmit() {
      var redirectUrl = "/index";
      if (
        this.$route.query &&
        this.$route.query != null &&
        this.$route.query.redirect &&
        this.$route.query.redirect != null
      ) {
        redirectUrl = this.$route.query.redirect;
      }

      sysApi.login(this.form).then(res => {
        this.loginSuccess({ ...res.data, redirectUrl });
      }).catch(err =>{
        this.$message({type: "error", message: "登录失败"});
      });
    },
    loginSuccess({ JSESSIONID, data, redirectUrl }) {
      auth.login(JSESSIONID);
      window.sessionStorage.setItem("user-info", JSON.stringify(data.principal.user));
      this.setUserInfo(data.principal.user);
      this.$http.defaults.headers.common["authSid"] = JSESSIONID;
      this.loadMenuList();
      redirectUrl && this.$router.push({ path: redirectUrl });
    },
    goToforget() {
      alert("goToforget");
    }
  }
};
</script>

<style>
.login {
  margin-top: 160px;
  width: 100%;
  border: 1px solid #cfd8dc;
  margin-right: auto !important;
  margin-left: auto !important;
  display: table;
  table-layout: fixed;
  background-color: #20a8d8;
}

.login .el-button {
  border-radius: 0;
}

.login .el-button.forgot,
.login .el-button.forgot:hover {
  border: none;
}

.login .login-form {
  background-color: #ffffff;
  width: 100%;
  height: 100%;
  display: block;
}

.login .login-form .card-block {
  padding: 35px;
}

.login .login-form .card-block p {
  margin: 15px 0;
}

.input-group {
  width: 100%;
  display: table;
  border-collapse: separate;
  margin-bottom: 20px !important;
}

.input-group,
.input-group-btn,
.input-group-btn > .btn,
.navbar {
  position: relative;
}

.input-group-addon:not(:last-child) {
  border-right: 0;
}

.input-group-addon,
.input-group-btn {
  min-width: 40px;
  white-space: nowrap;
  vertical-align: middle;
  width: 1%;
}

.btn-link:focus,
.btn-link:hover {
  color: #167495;
  text-decoration: underline;
  background-color: transparent;
}

.btn-link,
.btn-link:active,
.btn-link:focus,
.btn-link:hover {
  border-color: transparent;
}

.btn.focus,
.btn:focus,
.btn:hover {
  text-decoration: none;
}

.input-group-addon {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.75rem;
  color: #607d8b;
  text-align: center;
  background-color: #cfd8dc;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.input-group .form-control,
.input-group-addon,
.input-group-btn {
  display: table-cell;
}

.input-group .form-control {
  position: relative;
  z-index: 2;
  float: left;
  margin-bottom: 0;
}

.form-control {
  width: 90%;
  padding: 0.5rem 0.75rem;
  font-size: 1.5rem;
  line-height: 1.75rem;
  color: #607d8b;
  background: #fff none;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
}

.login .login-form .card-block .row {
  display: block;
  margin: 15px 0;
}

.login .login-register {
  width: 100%;
  height: 100%;
  display: block;
  background-color: #20a8d8;
  color: #fff;
}

.login .login-register .card-block {
  text-align: center !important;
  padding: 30px;
}

.login .login-register .card-block p {
  text-align: left !important;
  margin: 15px 0;
  height: 100px;
}
</style>
