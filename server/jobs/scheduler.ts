import cron from 'node-cron';
import { processSavedSearchNotifications } from './savedSearchNotifications';

/**
 * Automated scheduler for saved search email notifications
 * Runs every 12 hours at 8 AM and 8 PM (server timezone)
 * 
 * To change schedule, modify the cron expression:
 * - '0 8,20 * * *' = 8 AM and 8 PM daily
 * - '0 */12 * * *' = Every 12 hours
 * - '0 0 * * *' = Midnight daily
 * - '0 9 * * 1-5' = 9 AM on weekdays
 * 
 * Cron format: second minute hour day month weekday
 */

let schedulerStarted = false;

export function startScheduler() {
  if (schedulerStarted) {
    console.log('[Scheduler] Already started, skipping...');
    return;
  }

  // Run every 12 hours at 8 AM and 8 PM
  cron.schedule('0 8,20 * * *', async () => {
    console.log('[Scheduler] Triggering saved search notifications...');
    try {
      const result = await processSavedSearchNotifications();
      console.log('[Scheduler] Notification job completed:', {
        totalSearches: result.totalSearches,
        notificationsSent: result.notificationsSent,
        errors: result.errors,
      });
    } catch (error) {
      console.error('[Scheduler] Notification job failed:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Europe/Istanbul', // Turkish timezone
  });

  schedulerStarted = true;
  console.log('[Scheduler] Started - saved search notifications will run every 12 hours at 8 AM and 8 PM (Istanbul time)');
}

export function stopScheduler() {
  schedulerStarted = false;
  console.log('[Scheduler] Stopped');
}
