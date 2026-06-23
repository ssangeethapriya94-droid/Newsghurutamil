importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCkpy-nLDStT7oI8phWPxv0qGKGWb239UY",
  authDomain: "newsghuru-notification.firebaseapp.com",
  projectId: "newsghuru-notification",
  storageBucket: "newsghuru-notification.firebasestorage.app",
  messagingSenderId: "473545042099",
  appId: "1:473545042099:web:7d3b0180885d8eaad5a8c6"
};

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});


if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log(
      "[firebase-messaging-sw.js] Received background message ",
      payload
    );
    
    // Note: Firebase FCM automatically shows a notification for messages with a `notification` payload.
    // Manually calling self.registration.showNotification here causes duplicate notifications.
    /* 
    const notificationTitle = payload.notification ? payload.notification.title : "📰 NewsGhuru";
    const bodyText = payload.notification ? payload.notification.body : "";
    const linkUrl = payload.data?.link || (payload.fcmOptions && payload.fcmOptions.link) || "/";

    const imageUrl = payload.notification?.image || payload.data?.image || "";

    const notificationOptions = {
      body: bodyText,
      icon: "/faviconeng.png",
      image: imageUrl,
      data: {
        link: linkUrl
      }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
    */
  });
} else {
  console.warn("[firebase-messaging-sw.js] Firebase credentials not provided in query parameters.");
}

// Helper to parse the redirection link from FCM payloads
function getNotificationLink(notification) {
  const data = notification.data;
  if (!data) return "/";

  // 1. Direct link property (e.g. from custom foreground showNotification or custom payloads)
  if (data.link) {
    return data.link;
  }

  // 2. Nested FCM payload format automatically handled by Firebase SDK
  if (data.FCM_MSG) {
    const fcmMsg = data.FCM_MSG;
    if (fcmMsg.data && fcmMsg.data.link) {
      return fcmMsg.data.link;
    }
    if (fcmMsg.notification && fcmMsg.notification.click_action) {
      return fcmMsg.notification.click_action;
    }
    if (fcmMsg.notification && fcmMsg.notification.fcm_options && fcmMsg.notification.fcm_options.link) {
      return fcmMsg.notification.fcm_options.link;
    }
  }

  return "/";
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const relativeLink = getNotificationLink(event.notification);
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      let targetUrl;
      try {
        // Resolve target URL pathname relative to the active website origin
        const parsedLink = new URL(relativeLink, self.location.origin);
        targetUrl = new URL(parsedLink.pathname + parsedLink.search + parsedLink.hash, self.location.origin);
      } catch (e) {
        targetUrl = new URL("/", self.location.origin);
      }

      // 1. If there is an open window matching the pathname exactly, focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        try {
          const clientUrl = new URL(client.url, self.location.origin);
          if (clientUrl.pathname === targetUrl.pathname && "focus" in client) {
            if ("navigate" in client) {
              client.navigate(targetUrl.href);
            }
            return client.focus();
          }
        } catch (err) {
          // ignore
        }
      }

      // 2. Otherwise, if there is ANY open window of our origin, focus and navigate it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        try {
          if ("focus" in client && "navigate" in client) {
            client.navigate(targetUrl.href);
            return client.focus();
          }
        } catch (err) {
          // ignore
        }
      }

      // 3. Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl.href);
      }
    })
  );
});


