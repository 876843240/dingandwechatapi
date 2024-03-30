import axios from "@/axios.js";
/*
 * 在不同的环境中执行的操作，屏蔽浏览器差异
 */
import * as dd from "dingtalk-jsapi";
// 微信中的api
// import * as weixin from "jwecom";
import getPlat from "./checkPlat";
import { asyncHandle } from "./asyncHandle";

const IN_DINGDING = "dingtalk"; // 钉钉
const IN_WXWORK = "wxwork"; // 企业微信
const WEIXIN = "weixin"; // 微信环境
export const currPlatform = getPlat();
// 获取当前打开的平台
export const getPlantform = function () {
  return currPlatform;
};

// 优先在当前环境中打开某个链接
export const openURL = function (url, opts) {
  return new Promise((resolve, reject) => {
    if (currPlatform == IN_DINGDING) {
      dd.biz.util.openLink({
        url, //要打开链接的地址
        onSuccess: function (result) {
          resolve(result);
        },
        onFail: function (err) {
          reject(err);
        },
        ...opts,
      });
    } else {
      window.open(url, "_top");
    }
  });
};

// 钉钉浏览器标题
export const setHeaderTitle = function (title, opts) {
  return new Promise((resolve, reject) => {
    if (currPlatform == IN_DINGDING) {
      dd.biz.navigation.setTitle({
        title, //控制标题文本，空字符串表示显示默认文本
        onSuccess: function (result) {
          resolve(result);
        },
        onFail: function (err) {
          reject(err);
        },
        ...opts,
      });
      setNavRightState(false);
    } else {
      document.title = title;
    }
  });
};

// 浏览器头部右侧导航相关
export const setNavRightState = function (isShow, opts) {
  if (currPlatform == IN_DINGDING) {
    dd.biz.navigation.setRight({
      show: isShow, //控制按钮显示， true 显示， false 隐藏， 默认true
      onSuccess: function (result) {
        console.log(result);
      },
      onFail: function (err) {
        console.log(err);
      },
      ...opts,
    });
  } else if (currPlatform == IN_WXWORK || currPlatform == WEIXIN) {
    const weixin = window.wx;
    weixin.ready(function () {
      console.log("====进入了ready函数====");
      if (isShow) {
        weixin.showOptionMenu();
      } else {
        weixin.hideOptionMenu();
      }
    });
  }
};

// 因为这两个方法很多地方一起用。就在这里放一个。方便调用
export const setHeaderState = function (title, navRightStatus = false) {
  setHeaderTitle(title);
  setNavRightState(navRightStatus);
};
// 扫码功能
// type 为 all、qrCode、barCode，默认是all。
export const appScan = function (scanType, desc) {
  return new Promise((resolve, reject) => {
    if (currPlatform == IN_DINGDING) {
      dd.biz.util.scan({
        type: scanType,
        onSuccess: (data) => {
          resolve(data);
        },
        onFail: function (err) {
          console.log("===扫码调用失败==");
          reject(err);
        },
      });
    } else if (currPlatform == IN_WXWORK || currPlatform == WEIXIN) {
      window.wx.scanQRCode({
        desc,
        needResult: 0, // 默认为0，扫描结果由企业微信处理，1则直接返回扫描结果，
        scanType: [scanType],
        success: function (res) {
          resolve(res);
        },
        error: function (err) {
          console.log("===扫码调用失败==");
          reject(err);
        },
      });
    }
  });
};
/*
 * 设置浏览器头部的菜单，目前仅支持钉钉
 * items是当前需要设置的内容
 */
export const setMenu = function (items) {
  return new Promise((resolve, reject) => {
    if (currPlatform === IN_DINGDING) {
      dd.biz.navigation.setMenu({
        items,
        onSuccess: (data) => {
          resolve(data);
        },
        onFail: function (err) {
          reject(err);
        },
      });
    }
  });
};
// 在钉钉中预览文件
const previewFileInDing = async function fileCspaceInfo(
  code,
  url,
  fileName,
  fileSize
) {
  const userInfo = JSON.parse(await localStorage.getItem("userInfo"));

  asyncHandle(async () => {
    let { res } = await axios.post(
      "/api/dingtalk/rest/dingTalk/v2/file/cspace/info",
      {
        code: code, //钉钉临时授权码 ,
        companyId: userInfo.companyId, //公司id ,
        employeeCode: userInfo.employeeCode, //员工code ,
        fileName: fileName, //文件名 ,
        filePath: url, //oss文件路径 ,
        fileSize: fileSize, //文件大小
      }
    );
    if (res.data.code == "200") {
      let data = res.data.data;
      dd.biz.cspace.preview({
        corpId: data.corpId,
        spaceId: data.spaceId,
        fileId: data.fileId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        onSuccess: function (res) {
          // 调用成功时回调
          console.log(res);
        },
        onFail: function (err) {
          // 调用失败时回调
          console.log(err);
        },
      });
    } else if (res.data.code !== "760") {
      console.log(res.data.desc ? res.data.desc : "请求失败，请重试！");
    }
  });
};

export const previewFile = async function ({ url, fileName, fileSize }) {
  let { corpId } = JSON.parse(await localStorage.getItem("userInfo"));
  let platform = getPlat();
  if (platform === "dingtalk") {
    console.log("正在进行图片查看");
    if (corpId) {
      dd.runtime.permission.requestAuthCode({
        corpId: corpId,
        onSuccess: (result) => {
          //获取图片 钉盘ID
          previewFileInDing(result.code, url, fileName, fileSize);
        },
        onFail: function (err) {
          console.log(err);
        },
      });
    }
    // 如果是在微信里面
  } else if (platform === "weixin" || platform === "wxwork") {
    // 在微信中预览文件
    window.wx.ready(() => {
      console.log("在微信中预览文件");

      window.wx.invoke("previewFile", {
        url,
        name: fileName,
        size: fileSize, // 需要预览文件的字节大小
      });
    });
  } else {
    console.log("不在钉钉或者微信中");
    window.location.href = url;
  }
};
