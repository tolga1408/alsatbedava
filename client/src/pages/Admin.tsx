import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Loader2, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

export default function Admin() {
  const [isTriggering, setIsTriggering] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: user } = trpc.auth.me.useQuery();
  const triggerNotifications = trpc.savedSearches.triggerNotifications.useMutation();

  const handleTriggerNotifications = async () => {
    setIsTriggering(true);
    setError(null);
    setResult(null);

    try {
      const response = await triggerNotifications.mutateAsync();
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger notifications');
    } finally {
      setIsTriggering(false);
    }
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to access the admin panel. Admin access is required.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Saved Search Email Notifications
            </CardTitle>
            <CardDescription>
              Manually trigger the saved search notification job. This will check all saved searches 
              with email notifications enabled and send emails for new listings created in the last 12 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleTriggerNotifications}
              disabled={isTriggering}
              className="w-full sm:w-auto"
            >
              {isTriggering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Bildirimleri Manuel Tetikle
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Job Completed Successfully</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-1">
                      <p><strong>Total searches processed:</strong> {result.totalSearches}</p>
                      <p><strong>Notifications sent:</strong> {result.notificationsSent}</p>
                      <p><strong>Errors:</strong> {result.errors}</p>
                    </div>
                  </AlertDescription>
                </Alert>

                {result.details && result.details.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detailed Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.details.map((detail: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 rounded-lg border"
                          >
                            {detail.status === 'success' ? (
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{detail.searchName}</p>
                              <p className="text-sm text-muted-foreground">
                                {detail.userEmail || 'No email'}
                              </p>
                              <p className="text-sm">
                                {detail.matchingListings > 0 ? (
                                  <span className="text-green-600">
                                    {detail.matchingListings} matching listing(s) found
                                  </span>
                                ) : (
                                  <span className="text-gray-500">No new listings</span>
                                )}
                              </p>
                              {detail.error && (
                                <p className="text-sm text-red-600 mt-1">
                                  Error: {detail.error}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Test Mode Notice
              </h3>
              <p className="text-sm text-muted-foreground">
                The notification system is currently in test mode. Emails are logged to the console 
                and the owner is notified, but actual emails are not sent to users yet.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>To enable real email sending:</strong>
              </p>
              <ol className="text-sm text-muted-foreground list-decimal list-inside mt-1 space-y-1">
                <li>Install an email service package (SendGrid, AWS SES, or Resend)</li>
                <li>Add API key to secrets</li>
                <li>Update the sendSavedSearchNotification function in server/jobs/savedSearchNotifications.ts</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
