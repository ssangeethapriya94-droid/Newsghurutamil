importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

const urlParams = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: urlParams.get("apiKey"),
  authDomain: urlParams.get("authDomain"),
  projectId: urlParams.get("projectId"),
  storageBucket: urlParams.get("storageBucket"),
  messagingSenderId: urlParams.get("messagingSenderId"),
  appId: urlParams.get("appId")
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
    
    const notificationTitle = payload.notification ? payload.notification.title : "📰 NewsGhuru";
    const bodyText = payload.notification ? payload.notification.body : "";
    const linkUrl = payload.data?.link || (payload.fcmOptions && payload.fcmOptions.link) || "/";

    const imageUrl = payload.notification?.image || payload.data?.image || "";

    const notificationOptions = {
      body: bodyText,
      icon: "/favicontam.png",
      image: imageUrl,
      data: {
        link: linkUrl
      }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.warn("[firebase-messaging-sw.js] Firebase credentials not provided in query parameters.");
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link || "/";
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      let targetUrl;
      try {
        targetUrl = new URL(link, self.location.origin);
      } catch (e) {
        targetUrl = new URL("/", self.location.origin);
      }

      // If there is an open window matching the pathname, focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        try {
          const clientUrl = new URL(client.url, self.location.origin);
          if (clientUrl.pathname === targetUrl.pathname && "focus" in client) {
            return client.focus();
          }
        } catch (err) {
          // ignore
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl.href);
      }
    })
  );
});

