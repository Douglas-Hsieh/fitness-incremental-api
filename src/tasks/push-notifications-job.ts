import UserService from '@/services/users.service';
import { CronJob } from 'cron';
import { Expo } from 'expo-server-sdk';
import quotes from '@/data/betterQuotes';
import { getStepsToday, refreshAccessToken } from '@/auth/google-auth';
import { STEP_THRESHOLDS } from '@/data/constants';

const EVERY_SECOND = '* * * * * *';
const EVERY_MINUTE = '0 * * * * *';
const EVERY_HALF_HOUR = '0 0,30 * * * *';
const EVERY_HOUR = '0 0 * * * *';

/**
 * e.g. 1 => -23, 12 => -12
 */
function getLocalOffsetAlt(offset: number) {
  if (offset > 0) {
    return offset - 24;
  } else if (offset < 0) {
    return offset + 24;
  } else {
    return 0;
  }
}

export const pushNotificationsJob = new CronJob(EVERY_HALF_HOUR, async () => {
  console.log('Starting pushNotificationsJob');

  // Create a new Expo SDK client
  // optionally providing an access token if you have enabled push security
  const expo = new Expo({ accessToken: 'EZ1XaCYRsU1rhL8fzgPVLXvF9zCLV65vR0SKHIX7' });

  const userService = new UserService();
  const users = await userService.findAllUser();

  const now = new Date();
  const halfDayBefore = new Date(Date.now() - 43200000);

  // localTime = utcTime + localOffset => localTime - utcTime = localOffset
  const LOCAL_TIME_5PM = 17;
  const utcTime = now.getUTCHours();
  const localOffset5PM = LOCAL_TIME_5PM - utcTime;

  const usersToNotify = users
    .filter(user => user.expoPushToken)
    .filter(user => user.lastNotificationTime < halfDayBefore)
    .filter(user => {
      const localOffset = -(user.timezoneOffsetMinutes / 60);
      const localOffsetAlt = getLocalOffsetAlt(localOffset);
      const localOffsetEquivalents = [localOffset, localOffsetAlt];
      return localOffsetEquivalents.includes(localOffset5PM);
    });

  console.log('usersToNotify.length', usersToNotify.length);

  // Create the messages that you want to send to clients
  const messages = [];
  for (const user of usersToNotify) {
    const { expoPushToken } = user;

    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
      continue;
    }

    let title: string, body: string;
    if (user.os === 'android') {
      await refreshAccessToken(user);
      const stepsToday = await getStepsToday(user);
      const stepsThresholds = STEP_THRESHOLDS.filter(threshold => stepsToday < threshold);
      const rewardsLeft = stepsThresholds.length;

      title = `${stepsToday} steps since 5 PM`;
      const stepsThreshold = Math.min(...stepsThresholds);
      const stepsUntilReward = stepsThreshold - stepsToday;

      if (rewardsLeft <= 0) {
        body = `Great job! You've claimed all step rewards today`;
      } else if (rewardsLeft < STEP_THRESHOLDS.length) {
        const rewardsEarned = STEP_THRESHOLDS.length - rewardsLeft;
        body = `You have earned ${rewardsEarned} step rewards today. ${stepsUntilReward} more steps to claim your next reward`;
      } else {
        body = `Only ${stepsUntilReward} more steps to claim your first reward`;
      }
    } else {
      const i = Math.floor(Math.random() * quotes.length);
      const quote = quotes[i];
      title = quote.author ? quote.author : '';
      body = quotes[i].text;
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body,
      data: { withSome: 'data' },
    });

    userService.updateUser(user.id, { lastNotificationTime: new Date() });
  }

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log('ticketChunk', ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }
  })();

  // Later, after the Expo push notification service has delivered the
  // notifications to Apple or Google (usually quickly, but allow the the service
  // up to 30 minutes when under load), a "receipt" for each notification is
  // created. The receipts will be available for at least a day; stale receipts
  // are deleted.
  //
  // The ID of each receipt is sent back in the response "ticket" for each
  // notification. In summary, sending a notification produces a ticket, which
  // contains a receipt ID you later use to get the receipt.
  //
  // The receipts may contain error codes to which you must respond. In
  // particular, Apple or Google may block apps that continue to send
  // notifications to devices that have blocked notifications or have uninstalled
  // your app. Expo does not control this policy and sends back the feedback from
  // Apple and Google so you can handle it appropriately.
  const receiptIds = [];
  for (const ticket of tickets) {
    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (const chunk of receiptIdChunks) {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log('receipts', receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (const receiptId in receipts) {
          const receipt = receipts[receiptId];
          const { status } = receipt;
          if (status === 'ok') {
            continue;
          } else if (status === 'error') {
            const { message, details } = receipt;
            console.error(`There was an error sending a notification: ${message}`);
            if (details && details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
              // You must handle the errors appropriately.
              console.error(`The error code is ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
});
