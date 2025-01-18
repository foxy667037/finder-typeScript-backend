import cron from "node-cron";
import UsersPlans from "../../models/UsersPlans/UsersPlans.js";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

// Extending dayjs with both plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// check every minutes
cron.schedule('* * * * *', async () => {
  const now = dayjs().tz('Asia/Karachi');

  try {
    const usersToUpdate = await UsersPlans.find({
      $or: [
        { freeApiLimitResetDate: { $lte: now.toDate() }, user_plan: 'Basic' },
        { paidApiLimitResetDate: { $lte: now.toDate() }, user_plan: { $in: ['Intermediate', 'Extreme'] } },
      ],
    });

    for (const user of usersToUpdate) {
      if (user.user_plan === 'Basic') {
        user.currently_user_api_request = 0;
        user.remaining_api_request = 60000;
        user.user_free_api_request_limit = 60000;
        user.freeApiLimitResetDate = now.add(30, 'days').toDate();
        console.log(`Reset free API limits for user ${user.username}.`);
      } else if (user.user_plan === 'Intermediate') {
        user.user_plan = 'Basic';
        user.currently_user_api_request = 0;
        user.remaining_api_request = 60000;
        user.user_paid_api_request_limit = 0;
        user.paidApiLimitResetDate = null;
        user.freeApiLimitResetDate = now.add(30, 'days').toDate();
        console.log(`Intermediate plan timeout, resetting user ${user.username} back to Basic plan.`);
      } else if (user.user_plan === 'Extreme') {
        user.user_plan = 'Basic';
        user.currently_user_api_request = 0;
        user.remaining_api_request = 60000;
        user.user_paid_api_request_limit = 0;
        user.paidApiLimitResetDate = null;
        user.freeApiLimitResetDate = now.add(30, 'days').toDate();
        console.log(`Extreme plan timeout, resetting user ${user.username} back to Basic plan.`);
      }
      await user.save();
    }
  } catch (error) {
    console.error('Error resetting API limits:', error);
  }
});
