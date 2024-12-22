import cron from "node-cron";
import UsersPlans from "../../models/UsersPlans/UsersPlans.js";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js"; 
import utc from "dayjs/plugin/utc.js";  

// Extending dayjs with both plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// check every minutes
cron.schedule("* * * * *", async () => {
  try {
    // Get the current time in Karachi time zone
    const now = dayjs().tz('Asia/Karachi'); 

    // Set the next reset time to 30 days from the current time and set milliseconds to 00
    const nextReset = now.add(30, 'days').millisecond(0);  

    // Find users whose apiLimitResetDate has passed
    const usersToUpdate = await UsersPlans.find({
      apiLimitResetDate: { $lte: now.toDate() }, 
    });

    console.log(`Found ${usersToUpdate.length} users to update.`);

    // Update each user's API usage limits and reset date for 30 days from now
    for (const user of usersToUpdate) {
      user.currently_user_api_request = 0;
      user.remaining_api_request = 60000;
      user.apiLimitResetDate = nextReset.toDate();  
      await user.save();  
      console.log(`Updated user ${user.username} API limits.`);
    }

  } catch (error) {
    console.error("Error resetting API limits:", error);
  }
});