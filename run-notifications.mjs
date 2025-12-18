#!/usr/bin/env node

/**
 * Standalone script to run saved search notifications job
 * This script directly imports and executes the notification job
 */

import { processSavedSearchNotifications } from './server/jobs/savedSearchNotifications.ts';

console.log('='.repeat(60));
console.log('Starting Saved Search Notifications Job');
console.log('='.repeat(60));
console.log('');

try {
  const result = await processSavedSearchNotifications();
  
  console.log('');
  console.log('='.repeat(60));
  console.log('Job Completed Successfully');
  console.log('='.repeat(60));
  console.log('');
  console.log('Summary:');
  console.log(`  Total searches processed: ${result.totalSearches}`);
  console.log(`  Notifications sent: ${result.notificationsSent}`);
  console.log(`  Errors: ${result.errors}`);
  console.log('');
  
  if (result.details.length > 0) {
    console.log('Details:');
    result.details.forEach((detail, index) => {
      console.log(`  ${index + 1}. ${detail.searchName} (${detail.userEmail || 'no email'})`);
      console.log(`     - User ID: ${detail.userId}`);
      console.log(`     - Matching listings: ${detail.matchingListings}`);
      console.log(`     - Status: ${detail.status === 'success' ? '✅ Success' : '❌ Error'}`);
      if (detail.error) {
        console.log(`     - Error: ${detail.error}`);
      }
      console.log('');
    });
  }
  
  process.exit(0);
} catch (error) {
  console.error('');
  console.error('='.repeat(60));
  console.error('Job Failed');
  console.error('='.repeat(60));
  console.error('');
  console.error('Error:', error.message);
  console.error('');
  if (error.stack) {
    console.error('Stack trace:');
    console.error(error.stack);
  }
  process.exit(1);
}
