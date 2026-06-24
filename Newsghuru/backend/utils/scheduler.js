const EmailSchedule = require("../models/EmailSchedule");
const { sendNewsPublishEmail } = require("./emailService");

/**
 * Convert a UTC Date to its local IST date string (YYYY-MM-DD).
 * We offset by +5:30 so that "today" is computed in IST regardless of
 * the server's OS timezone.
 */
const toISTDateString = (date) => {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +05:30
  const istDate = new Date(date.getTime() + IST_OFFSET_MS);
  return istDate.toISOString().slice(0, 10); // "YYYY-MM-DD"
};

/**
 * Get current IST hour and minute.
 */
const getISTHourMin = () => {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(Date.now() + IST_OFFSET_MS);
  return {
    hour: istDate.getUTCHours(),
    min: istDate.getUTCMinutes(),
  };
};

const startEmailScheduler = () => {
  console.log("⏰ [SCHEDULER] Starting background email newsletter scheduler...");

  // Check every 60 seconds
  setInterval(async () => {
    try {
      const schedules = await EmailSchedule.find({ isEnabled: true });
      const now = new Date();
      const { hour: currentHour, min: currentMin } = getISTHourMin();
      const todayIST = toISTDateString(now);

      for (const schedule of schedules) {
        if (schedule.scheduleType === "daily") {
          if (!schedule.time) continue;

          const [schHour, schMin] = schedule.time.split(":").map(Number);

          // Use a ±1 minute window to avoid missing the exact second
          const currentTotalMin = currentHour * 60 + currentMin;
          const scheduledTotalMin = schHour * 60 + schMin;
          const diff = Math.abs(currentTotalMin - scheduledTotalMin);

          if (diff <= 1) {
            // Check if already sent today (in IST)
            const lastSentIST = schedule.lastSent ? toISTDateString(new Date(schedule.lastSent)) : "";

            if (lastSentIST !== todayIST) {
              console.log(
                `⏰ [SCHEDULER] Triggering daily ${schedule.language} newsletter at IST ${currentHour}:${String(currentMin).padStart(2, "0")} (scheduled ${schedule.time})...`
              );
              schedule.lastSent = now;
              await schedule.save();

              sendNewsPublishEmail(schedule.language).catch((err) => {
                console.error(`❌ [SCHEDULER] Error sending daily ${schedule.language} newsletter:`, err);
              });
            } else {
              console.log(
                `ℹ️ [SCHEDULER] Daily ${schedule.language} newsletter already sent today (${todayIST}). Skipping.`
              );
            }
          }
        } else if (schedule.scheduleType === "one-time") {
          if (schedule.dateTime && now >= new Date(schedule.dateTime) && !schedule.isSent) {
            console.log(`⏰ [SCHEDULER] Triggering one-time ${schedule.language} newsletter...`);
            schedule.isSent = true;
            schedule.lastSent = now;
            await schedule.save();

            sendNewsPublishEmail(schedule.language).catch((err) => {
              console.error(`❌ [SCHEDULER] Error sending one-time ${schedule.language} newsletter:`, err);
            });
          }
        }
      }
    } catch (err) {
      console.error("❌ [SCHEDULER] Error in email scheduler loop:", err);
    }
  }, 60000); // Check every minute
};

module.exports = { startEmailScheduler };
