import { supabase } from '../lib/supabase';

// Email notification service using Resend API
export class EmailNotificationService {
  private static async sendEmail({
    to,
    subject,
    html,
    from = 'Accreda <noreply@accreda.com>'
  }: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    try {
      // Call our Supabase Edge Function to send email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html,
          from
        }
      });

      if (error) {
        console.error('Error sending email:', error);
        return false;
      }

      console.log('Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Check if user has email notifications enabled for a specific type
  private static async getUserEmailPreference(userId: string, preferenceType: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select(preferenceType)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Default to true if no preferences found
        return true;
      }

      return (data as any)[preferenceType] ?? true;
    } catch (error) {
      console.error('Error fetching email preferences:', error);
      return true; // Default to enabled
    }
  }

  // Get user email and name
  private static async getUserInfo(userId: string): Promise<{ email: string; name: string } | null> {
    try {
      // Try EIT profile first
      const { data: eitProfile } = await supabase
        .from('eit_profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (eitProfile?.email) {
        return {
          email: eitProfile.email,
          name: eitProfile.full_name || 'User'
        };
      }

      // Try supervisor profile
      const { data: supervisorProfile } = await supabase
        .from('supervisor_profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (supervisorProfile?.email) {
        return {
          email: supervisorProfile.email,
          name: supervisorProfile.full_name || 'User'
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  // Send supervisor review notification email
  static async sendSupervisorReviewEmail(userId: string, reviewTitle: string, reviewerName: string) {
    const isEnabled = await this.getUserEmailPreference(userId, 'supervisor_reviews');
    if (!isEnabled) return false;

    const userInfo = await this.getUserInfo(userId);
    if (!userInfo) return false;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Accreda</h1>
          <p style="color: #ccfbf1; margin: 8px 0 0 0;">Your Professional Development Journey</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 16px 0;">New Review Received!</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            Hi ${userInfo.name},
          </p>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            You have received a new review from <strong>${reviewerName}</strong>:
          </p>
          <div style="background: #f1f5f9; border-left: 4px solid #0d9488; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-weight: 600; color: #1e293b;">${reviewTitle}</p>
          </div>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            Log in to your Accreda account to view the full review and respond if needed.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://accreda.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Review
            </a>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            This email was sent to ${userInfo.email} because you have email notifications enabled for supervisor reviews.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userInfo.email,
      subject: `New Review: ${reviewTitle}`,
      html
    });
  }

  // Send SAO feedback notification email
  static async sendSAOFeedbackEmail(userId: string, saoTitle: string, feedbackSummary: string) {
    const isEnabled = await this.getUserEmailPreference(userId, 'sao_feedback');
    if (!isEnabled) return false;

    const userInfo = await this.getUserInfo(userId);
    if (!userInfo) return false;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Accreda</h1>
          <p style="color: #ccfbf1; margin: 8px 0 0 0;">Your Professional Development Journey</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 16px 0;">SAO Feedback Received!</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            Hi ${userInfo.name},
          </p>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            You have received feedback on your SAO: <strong>"${saoTitle}"</strong>
          </p>
          <div style="background: #f1f5f9; border-left: 4px solid #0d9488; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #1e293b;">${feedbackSummary}</p>
          </div>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            Log in to your Accreda account to view the complete feedback and take any necessary actions.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://accreda.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Feedback
            </a>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            This email was sent to ${userInfo.email} because you have email notifications enabled for SAO feedback.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userInfo.email,
      subject: `SAO Feedback: ${saoTitle}`,
      html
    });
  }

  // Send relationship update notification email
  static async sendRelationshipUpdateEmail(userId: string, relationshipStatus: string, supervisorName: string) {
    const isEnabled = await this.getUserEmailPreference(userId, 'relationships');
    if (!isEnabled) return false;

    const userInfo = await this.getUserInfo(userId);
    if (!userInfo) return false;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Accreda</h1>
          <p style="color: #ccfbf1; margin: 8px 0 0 0;">Your Professional Development Journey</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 16px 0;">Supervisor Relationship Updated</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            Hi ${userInfo.name},
          </p>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            Your relationship with <strong>${supervisorName}</strong> has been updated to: <strong>${relationshipStatus}</strong>
          </p>
          <div style="background: #f1f5f9; border-left: 4px solid #0d9488; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #1e293b;">Status: ${relationshipStatus}</p>
          </div>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            Log in to your Accreda account to view more details about this relationship change.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://accreda.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Relationship
            </a>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            This email was sent to ${userInfo.email} because you have email notifications enabled for relationship updates.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userInfo.email,
      subject: `Supervisor Relationship Updated: ${relationshipStatus}`,
      html
    });
  }

  // Send user skills notification email
  static async sendUserSkillsEmail(userId: string, skillName: string, action: string) {
    const isEnabled = await this.getUserEmailPreference(userId, 'user_skills');
    if (!isEnabled) return false;

    const userInfo = await this.getUserInfo(userId);
    if (!userInfo) return false;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Accreda</h1>
          <p style="color: #ccfbf1; margin: 8px 0 0 0;">Your Professional Development Journey</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 16px 0;">Skill ${action}</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            Hi ${userInfo.name},
          </p>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            Your skill <strong>"${skillName}"</strong> has been ${action.toLowerCase()}.
          </p>
          <div style="background: #f1f5f9; border-left: 4px solid #0d9488; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #1e293b;">Skill: ${skillName}</p>
            <p style="margin: 8px 0 0 0; color: #64748b;">Status: ${action}</p>
          </div>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            Log in to your Accreda account to view the complete details and track your progress.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://accreda.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Skills
            </a>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            This email was sent to ${userInfo.email} because you have email notifications enabled for skill updates.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userInfo.email,
      subject: `Skill ${action}: ${skillName}`,
      html
    });
  }

  // Send portfolio reminder email
  static async sendPortfolioReminderEmail(userId: string, frequency: string) {
    const isEnabled = await this.getUserEmailPreference(userId, 'portfolio_reminder_enabled');
    if (!isEnabled) return false;

    const userInfo = await this.getUserInfo(userId);
    if (!userInfo) return false;

    const frequencyText = {
      daily: 'daily',
      weekly: 'weekly',
      biweekly: 'bi-weekly',
      monthly: 'monthly'
    }[frequency] || frequency;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Accreda</h1>
          <p style="color: #ccfbf1; margin: 8px 0 0 0;">Your Professional Development Journey</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 16px 0;">Portfolio Update Reminder</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            Hi ${userInfo.name},
          </p>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            This is your ${frequencyText} reminder to update your application/portfolio on Accreda.
          </p>
          <div style="background: #f1f5f9; border-left: 4px solid #0d9488; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #1e293b; font-weight: 600;">Keep your portfolio current!</p>
            <p style="margin: 8px 0 0 0; color: #64748b;">Regular updates help showcase your progress and achievements to supervisors and potential employers.</p>
          </div>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
            Log in to your Accreda account to update your portfolio with recent achievements, skills, and experiences.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://accreda.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Update Portfolio
            </a>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            This email was sent to ${userInfo.email} because you have portfolio reminders enabled (${frequencyText}).
          </p>
          <p style="color: #64748b; font-size: 14px; margin: 8px 0 0 0;">
            You can change your reminder preferences in your account settings.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userInfo.email,
      subject: 'Reminder: Please update your application/portfolio',
      html
    });
  }
}
