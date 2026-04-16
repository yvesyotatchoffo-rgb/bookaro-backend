const axios = require("axios");
const db = require("../models");
const { JWT } = require("google-auth-library");

let serviceAccount = null;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (serviceAccountJson) {
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (error) {
    console.warn("FCM disabled: invalid FIREBASE_SERVICE_ACCOUNT_JSON.");
  }
} else {
  try {
    serviceAccount = require("../../google-services.json");
  } catch (error) {
    console.warn("FCM disabled: provide FIREBASE_SERVICE_ACCOUNT_JSON or local google-services.json.");
  }
}

const firebaseProjectId =
  process.env.FIREBASE_PROJECT_ID ||
  (serviceAccount && serviceAccount.project_id) ||
  "bookaroo-1cd88";

function getAccessToken() {
  try {
    if (!serviceAccount) return null;
    const SCOPES = "https://www.googleapis.com/auth/firebase.messaging";
    return new Promise(function (resolve, reject) {
      const key = serviceAccount;
      const jwtClient = new JWT(
        key.client_email,
        null,
        key.private_key,
        SCOPES,
        null
      );

      jwtClient.authorize(function (err, tokens) {
        if (err) {
          reject(err);
          return;
        }
        resolve(tokens.access_token);
      });
    });
  } catch (error) {
    console.log(error, "=================error");
  }
}

exports.send_fcm_push_notification = async (data) => {
  try {
    let access = await getAccessToken();
    if (!access) return "FCM disabled";
    let payload = {
      message: {
        token: data.device_token,
        notification: {
          title: data.title,
          body: data.message,
        },
        data: {
          count: "0",
          property_id: data.property_id,
          notification_type: "property"
        },
      },
    };
    const config = {
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
    };
    const url = `https://fcm.googleapis.com/v1/projects/${firebaseProjectId}/messages:send`;
    const response = await axios.post(url, payload, config);
    let all_unread_notification = await db.notifications.countDocuments({
      sendTo: data.sendTo,
      isDeleted: false,
      status: "unread",
    });
    await db.users.updateOne(
      { _id: data.sendTo },
      { unread_notifications_count: all_unread_notification }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error sending FCM notification:",
      error.response ? error.response.data : error.message
    );
    return "Error sending FCM notification";
  }
  //}
};

