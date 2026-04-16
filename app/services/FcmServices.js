const axios = require("axios");
const db = require("../models");
const { JWT } = require("google-auth-library");

let serviceAccount = null;
try {
  serviceAccount = require("../../google-services.json");
} catch (error) {
  console.warn("FCM disabled: google-services.json not found.");
}

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
    const url = "https://fcm.googleapis.com/v1/projects/bookaroo-1cd88/messages:send";
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

