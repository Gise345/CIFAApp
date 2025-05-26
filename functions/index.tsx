// functions/index.ts
// This is a Firebase Cloud Function that sends welcome emails

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// Configure your email service (example using Gmail)
// You should use environment variables for credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass
  }
});

// Welcome email template
const getWelcomeEmailHtml = (userName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0047AB 0%, #191970 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
        .logo { font-size: 36px; font-weight: bold; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CIFA</div>
          <h1>Welcome to CIFA Mobile App!</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Thank you for joining the Cayman Islands Football Association mobile app community. We're thrilled to have you on board!</p>
          
          <h3>What you can do with the CIFA app:</h3>
          <ul>
            <li>📱 Get real-time match updates and live scores</li>
            <li>📰 Read the latest news about Cayman Islands football</li>
            <li>⚽ Follow your favorite teams and players</li>
            <li>📊 View detailed statistics and league standings</li>
            <li>🔔 Receive push notifications for important updates</li>
            <li>🏆 Track national team performances</li>
          </ul>
          
          <p>To get started, open the app and:</p>
          <ol>
            <li>Select your favorite teams to follow</li>
            <li>Enable notifications to never miss an update</li>
            <li>Explore the latest matches and news</li>
          </ol>
          
          <center>
            <a href="https://caymanislandsfa.com" class="button">Visit Our Website</a>
          </center>
          
          <p>If you have any questions or need assistance, feel free to contact us through the app or reply to this email.</p>
          
          <p>Best regards,<br>The CIFA Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Cayman Islands Football Association</p>
          <p>219 Poindexter Road, P.O. Box 178, Grand Cayman KY1-1104, Cayman Islands</p>
          <p>Created by Invovibe Tech Cayman</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Interface for notification data
interface NotificationData {
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: admin.firestore.FieldValue;
}

// Interface for user data
interface UserData {
  email?: string;
  notificationSettings?: {
    emailNotifications?: boolean;
  };
}

// Send welcome email when a new user is created
export const sendWelcomeEmail = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
  const email = user.email;
  const displayName = user.displayName || 'New User';
  
  if (!email) {
    console.log('No email found for user');
    return null;
  }

  const mailOptions: nodemailer.SendMailOptions = {
    from: 'CIFA Mobile App <noreply@cifaapp.com>',
    to: email,
    subject: 'Welcome to CIFA Mobile App! 🎉',
    html: getWelcomeEmailHtml(displayName),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
    
    // Also create a notification record in Firestore
    const notificationData: NotificationData = {
      userId: user.uid,
      type: 'welcome',
      title: 'Welcome to CIFA!',
      body: 'Thank you for joining. Check your email for more information.',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await admin.firestore().collection('notifications').add(notificationData);
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Error sending welcome email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { error: errorMessage };
  }
});

// Function to send notification emails for important updates
export const sendNotificationEmail = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const notification = snap.data() as NotificationData & { type: string };
    
    // Only send emails for certain notification types
    if (!['match_reminder', 'breaking_news', 'team_update'].includes(notification.type)) {
      return null;
    }
    
    // Get users who have email notifications enabled
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('notificationSettings.emailNotifications', '==', true)
      .get();
    
    const emailPromises: Promise<nodemailer.SentMessageInfo>[] = [];
    
    usersSnapshot.forEach((userDoc: admin.firestore.QueryDocumentSnapshot) => {
      const userData = userDoc.data() as UserData;
      if (userData.email) {
        const mailOptions: nodemailer.SendMailOptions = {
          from: 'CIFA Mobile App <noreply@cifaapp.com>',
          to: userData.email,
          subject: notification.title,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0047AB 0%, #191970 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                  <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">CIFA</div>
                  <h2 style="margin: 0;">${notification.title}</h2>
                </div>
                <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; line-height: 1.6;">${notification.body}</p>
                  <p style="margin-top: 20px;">Open the CIFA app for more details and updates.</p>
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="https://caymanislandsfa.com" style="display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Open CIFA App</a>
                  </div>
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                  <p>© 2025 Cayman Islands Football Association</p>
                  <p>Created by Invovibe Tech Cayman</p>
                </div>
              </div>
            </div>
          `
        };
        
        emailPromises.push(transporter.sendMail(mailOptions));
      }
    });
    
    try {
      await Promise.all(emailPromises);
      console.log(`Notification emails sent: ${emailPromises.length}`);
      return { sent: emailPromises.length };
    } catch (error: unknown) {
      console.error('Error sending notification emails:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { error: errorMessage };
    }
  });

// Function to send match reminder emails
export const sendMatchReminderEmails = functions.pubsub
  .schedule('0 */6 * * *') // Run every 6 hours
  .onRun(async (context) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    try {
      // Get matches scheduled for tomorrow
      const matchesSnapshot = await admin.firestore()
        .collection('matches')
        .where('date', '>=', admin.firestore.Timestamp.fromDate(now))
        .where('date', '<=', admin.firestore.Timestamp.fromDate(tomorrow))
        .where('status', '==', 'scheduled')
        .get();
      
      if (matchesSnapshot.empty) {
        console.log('No matches scheduled for tomorrow');
        return null;
      }
      
      // Get users who have match alert notifications enabled
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('notificationSettings.matchAlerts', '==', true)
        .where('notificationSettings.emailNotifications', '==', true)
        .get();
      
      const emailPromises: Promise<nodemailer.SentMessageInfo>[] = [];
      
      matchesSnapshot.forEach((matchDoc) => {
        const matchData = matchDoc.data();
        
        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data() as UserData;
          
          if (userData.email) {
            const mailOptions: nodemailer.SendMailOptions = {
              from: 'CIFA Mobile App <noreply@cifaapp.com>',
              to: userData.email,
              subject: `Match Reminder: ${matchData.homeTeamName} vs ${matchData.awayTeamName}`,
              html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #0047AB 0%, #191970 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                      <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">CIFA</div>
                      <h2 style="margin: 0;">Match Reminder</h2>
                    </div>
                    <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                      <h3 style="color: #2563eb; text-align: center; margin-bottom: 20px;">
                        ${matchData.homeTeamName} vs ${matchData.awayTeamName}
                      </h3>
                      <div style="text-align: center; margin: 20px 0;">
                        <p><strong>Date:</strong> ${matchData.date.toDate().toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${matchData.time}</p>
                        <p><strong>Venue:</strong> ${matchData.venue}</p>
                        <p><strong>Competition:</strong> ${matchData.competition}</p>
                      </div>
                      <p style="text-align: center;">Don't miss this exciting match! Open the CIFA app for live updates.</p>
                      <div style="text-align: center; margin: 20px 0;">
                        <a href="https://caymanislandsfa.com" style="display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Open CIFA App</a>
                      </div>
                    </div>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                      <p>© 2025 Cayman Islands Football Association</p>
                      <p>Created by Invovibe Tech Cayman</p>
                    </div>
                  </div>
                </div>
              `
            };
            
            emailPromises.push(transporter.sendMail(mailOptions));
          }
        });
      });
      
      await Promise.all(emailPromises);
      console.log(`Match reminder emails sent: ${emailPromises.length}`);
      return { sent: emailPromises.length };
      
    } catch (error: unknown) {
      console.error('Error sending match reminder emails:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { error: errorMessage };
    }
  });