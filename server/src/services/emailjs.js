const axios = require('axios');

/**
 * EmailJS service for sending emails via EmailJS REST API
 * For setup, go to https://www.emailjs.com
 */
class EmailJSService {
  constructor() {
    this.publicKey = process.env.EMAILJS_PUBLIC_KEY;
    this.privateKey = process.env.EMAILJS_PRIVATE_KEY;
    this.serviceId = process.env.EMAILJS_SERVICE_ID;
    this.templateId = process.env.EMAILJS_TEMPLATE_ID;
    this.apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
  }

  /**
   * Send an email using EmailJS
   * @param {Object} templateParams - Template parameters (e.g., { to_name, ticket_code, ... })
   * @param {string} toEmail - Recipient email address
   * @returns {Promise<Object>} Response from EmailJS
   */
  async sendEmail(templateParams, toEmail) {
    try {
      const data = {
        service_id: this.serviceId,
        template_id: this.templateId,
        user_id: this.publicKey,
        accessToken: this.privateKey,
        template_params: {
          ...templateParams,
          to_email: toEmail
        }
      };

      const response = await axios.post(this.apiUrl, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Email sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending email via EmailJS:', error.response?.data || error.message);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send ticket confirmation email
   * @param {Object} ticketData - Ticket details
   * @param {Object} userData - User details
   */
  async sendTicketConfirmation(ticketData, userData) {
    const templateParams = {
      to_name: `${userData.first_name} ${userData.last_name}`,
      to_email: userData.email,
      ticket_code: ticketData.unique_code,
      ticket_plan: ticketData.plan_name,
      ticket_price: ticketData.price,
      purchase_date: ticketData.purchased_at
    };

    return this.sendEmail(templateParams, userData.email);
  }
}

module.exports = new EmailJSService();
