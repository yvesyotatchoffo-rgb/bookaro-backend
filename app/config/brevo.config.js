const dotenv = require("dotenv");
dotenv.config();
const { BrevoClient } = require('@getbrevo/brevo');

const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

const senders = {
    auth: {
        email: process.env.BREVO_AUTH_FROM_EMAIL,
        name: process.env.BREVO_AUTH_FROM_NAME,
    },
    payment: {
        email: process.env.BREVO_PAYMENT_FROM_EMAIL,
        name: process.env.BREVO_PAYMENT_FROM_NAME,
    },
};

const brevoEmailModules = {
    AUTH: 'auth',
    PAYMENT: 'payment'
};

async function sendEmail({ module, to, subject, htmlContent, params = {} }) {
    try {
        const sender = senders[module];

        if (!sender) {
            throw new Error(`Unknown email module: ${module}`);
        }

        const toList = Array.isArray(to)
            ? to.map((t) => (typeof t === 'string' ? { email: t } : t))
            : [typeof to === 'string' ? { email: to } : to];

        const payload = {
            sender,
            to: toList,
            subject,
            htmlContent,
            ...(Object.keys(params).length > 0 && { params }),
        };

        const result = await client.transactionalEmails.sendTransacEmail(payload);
        
        console.log(`✅ Email sent [${module}] to ${JSON.stringify(toList)} — MessageId: ${result?.messageId}`);
        return { success: true, messageId: result?.messageId };
    } catch (error) {
        // ✅ Brevo v4 error handling
        if (error?.statusCode === 401) {
            console.error(`Brevo API key invalid`);
        } else if (error?.statusCode === 400) {
            console.error(`Brevo bad request:`, error?.body);
        } else {
            console.error(`Email failed [${module}]:`, error?.message || error);
        }

        return { success: false, error: error?.message };
    }
}


module.exports = { brevoEmailModules, sendEmail };