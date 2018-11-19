import axios from "axios";
import qs from "qs";
import auth from "./auth";
import { getBaseUrl } from "../common/utils";
import { MessageBox } from "element-ui";

// axios 配置
axios.defaults.timeout = 5000;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
//axios.defaults.baseURL = 'http://localhost:8008';
axios.defaults.baseURL = getBaseUrl(window.location.href)+"/api";
axios.defaults.headers.common[ 'authUid' ] = auth.getUid();
axios.defaults.headers.common[ 'authSid' ] = auth.getSid();

//POST传参序列化
axios.interceptors.request.use((config) => {
  if (config.method === 'post') {
    config.data = qs.stringify(config.data);
  }
  return config;
}, (error) => {
  Message.error({message: '请求超时!'});
  // return Promise.reject(error);
});

//返回状态判断
axios.interceptors.response.use(
  response => {
    if (response.data && response.data.code) {
      if (response.data.code === '2001') {
        auth.logout()
      }
    }
    return response;
  },
  error => {
    if (error.response.status == 504 || error.response.status == 404) {
      MessageBox({type:"error",message: error.response.data.message, title: error.response.data.error});
    } else if (error.response.status == 401) {
      MessageBox({type:"error",message:"权限不足,请联系管理员",title:"温馨提示",});
    } else if (error.response.status == 403) {
      MessageBox({type:"error",message: error.response.data,title:"温馨提示",});
    } else {
      MessageBox({type: "error",message:"未知错误",title: error.response.status + " Error",});
    }
    // return Promise.resolve(error);
  });

export function fetch (url, config = { method: 'get' }) {
  return axios.request({ ...config, url })
  return new Promise((resolve, reject) => {
    axios.request({ ...config, url })
      .then(response => {
        resolve(response.data);
      }, err => {
        reject(err);
      })
      .catch((error) => {
        reject(error)
      })
  })
}

export default axios
