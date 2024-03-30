// import { Toast } from "vant";

export const asyncHandle = async (handle, errorHandle) => {
  try {
    await handle();
  } catch (e) {
    console.log(e);
    errorHandle && errorHandle();
    // Toast.fail(e.message);
  }
};
