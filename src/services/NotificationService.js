// Note: This is a client-side implementation for demo purposes
// In production, SMS sending should be handled by a backend service for security

class NotificationService {
  constructor() {
    this.sentNotifications = JSON.parse(localStorage.getItem('sentNotifications')) || [];
  }

  // Simulate sending SMS using Twilio API
  // In production, this would be a backend API call
  async sendSMS(to, message) {
    try {
      // For demo purposes, we'll simulate the API call
      // In production, you would make a request to your backend which uses Twilio
      
      const notification = {
        id: Date.now(),
        to,
        message,
        timestamp: new Date().toISOString(),
        status: 'sent',
        type: 'sms'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store notification in localStorage for demo
      this.sentNotifications.push(notification);
      localStorage.setItem('sentNotifications', JSON.stringify(this.sentNotifications));

      return { success: true, notificationId: notification.id };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Simulate sending email using SendGrid API
  // In production, this would be a backend API call
  async sendEmail(to, subject, content) {
    try {
      // For demo purposes, we'll simulate the API call
      // In production, you would make a request to your backend which uses SendGrid
      
      const notification = {
        id: Date.now(),
        to,
        subject,
        content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        type: 'email'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store notification in localStorage for demo
      this.sentNotifications.push(notification);
      localStorage.setItem('sentNotifications', JSON.stringify(this.sentNotifications));

      return { success: true, notificationId: notification.id };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send SMS notifications about disease outbreak to all members
  async sendDiseaseAlertSMS(members, diseaseData) {
    const results = [];
    const mostCommonDisease = diseaseData.mostCommonDisease;
    
    if (!mostCommonDisease) {
      return { success: false, error: 'No disease data available' };
    }

    const message = `Good News! We cover ${mostCommonDisease.disease} treatment. Recent analysis shows ${mostCommonDisease.percentage}% prevalence. Don't panic - your insurance policy provides full coverage for ${mostCommonDisease.disease}. Schedule a preventive checkup today. - Insurance Admin`;
    
    for (const member of members) {
      const result = await this.sendSMS(member.phone, message);
      results.push({
        member,
        ...result
      });
    }

    return {
      success: true,
      results,
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      diseaseInfo: mostCommonDisease
    };
  }

  // Send bulk notifications
  async sendBulkNotifications(members, template) {
    const results = [];
    
    for (const member of members) {
      const personalizedContent = this.personalizeTemplate(template, member);
      const result = await this.sendEmail(
        member.email,
        template.subject,
        personalizedContent
      );
      
      results.push({
        member,
        ...result
      });
    }

    return results;
  }

  // Send bulk SMS notifications
  async sendBulkSMS(members, message) {
    const results = [];
    
    for (const member of members) {
      const personalizedMessage = this.personalizeSMSMessage(message, member);
      const result = await this.sendSMS(member.phone, personalizedMessage);
      
      results.push({
        member,
        ...result
      });
    }

    return results;
  }

  // Personalize SMS message with member data
  personalizeSMSMessage(message, member) {
    let personalizedMessage = message;
    
    // Replace placeholders with member data
    personalizedMessage = personalizedMessage.replace(/{{name}}/g, member.name);
    personalizedMessage = personalizedMessage.replace(/{{policyNumber}}/g, member.policyNumber);
    
    return personalizedMessage;
  }

  // Personalize email template with member data
  personalizeTemplate(template, member) {
    let content = template.content;
    
    // Replace placeholders with member data
    content = content.replace(/{{name}}/g, member.name);
    content = content.replace(/{{policyNumber}}/g, member.policyNumber);
    content = content.replace(/{{email}}/g, member.email);
    
    return content;
  }

  // Get notification history
  getNotificationHistory() {
    return this.sentNotifications;
  }

  // Get notification statistics
  getNotificationStats() {
    const total = this.sentNotifications.length;
    const today = new Date().toDateString();
    const todayCount = this.sentNotifications.filter(
      n => new Date(n.timestamp).toDateString() === today
    ).length;

    const emailCount = this.sentNotifications.filter(n => n.type === 'email').length;
    const smsCount = this.sentNotifications.filter(n => n.type === 'sms').length;

    return {
      total,
      today: todayCount,
      successful: this.sentNotifications.filter(n => n.status === 'sent').length,
      failed: this.sentNotifications.filter(n => n.status === 'failed').length,
      emails: emailCount,
      sms: smsCount
    };
  }

  // Clear notification history (for demo purposes)
  clearHistory() {
    this.sentNotifications = [];
    localStorage.removeItem('sentNotifications');
  }
}

// SMS templates
export const SMS_TEMPLATES = {
  coverage_notification: {
    message: 'Hi {{name}}, your insurance policy {{policyNumber}} is active and you are fully covered. Contact us for any questions. - Insurance Admin'
  },
  
  health_reminder: {
    message: 'Hello {{name}}, time for your annual health checkup! Your insurance policy {{policyNumber}} covers preventive care. Schedule today. - Insurance Admin'
  },

  disease_alert: {
    message: 'Good News! We cover {{disease}} treatment. Recent data shows {{percentage}}% prevalence. Don\'t panic - your policy {{policyNumber}} provides full coverage for {{disease}}. Schedule checkup today. - Insurance Admin'
  },

  welcome: {
    message: 'Welcome {{name}}! Your insurance policy {{policyNumber}} is now active. You are covered for comprehensive healthcare. - Insurance Admin'
  }
};

// Email templates
export const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to Our Insurance Program',
    content: `Dear {{name}},

Welcome to our comprehensive insurance program! We're excited to have you as a member.

Your Policy Details:
- Policy Number: {{policyNumber}}
- Email: {{email}}

You are now covered under our insurance plan. Our team is here to support you with any questions or concerns.

Best regards,
Insurance Admin Team`
  },
  
  coverage_notification: {
    subject: 'Insurance Coverage Confirmation',
    content: `Dear {{name}},

This is to confirm that you are covered under our insurance program.

Policy Information:
- Policy Number: {{policyNumber}}
- Coverage Status: Active
- Contact Email: {{email}}

If you have any questions about your coverage, please don't hesitate to contact our support team.

Thank you for choosing our insurance program.

Best regards,
Insurance Admin Team`
  },

  health_reminder: {
    subject: 'Health Checkup Reminder',
    content: `Dear {{name}},

We hope this message finds you in good health. As part of our commitment to your wellbeing, we would like to remind you about the importance of regular health checkups.

Your insurance policy ({{policyNumber}}) covers annual health screenings and preventive care.

Please schedule your checkup at your earliest convenience.

Stay healthy!

Best regards,
Insurance Admin Team`
  }
};

export default NotificationService;
