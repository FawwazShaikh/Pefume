import nodemailer from 'nodemailer';

/**
 * Creates an SMTP transporter using environment variables.
 * Returns null if SMTP configuration is incomplete.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Silent fallback when not configured, avoiding app crashes.
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends a low stock alert email to the store owner.
 * @param {string} productName - Product name
 * @param {string} bottleLabel - Friendly bottle label (e.g. "Bottle #001")
 * @param {number} remainingML - Current liquid level in ML
 * @param {number} bottleSizeML - Total bottle capacity in ML
 */
export async function sendLowStockAlert(productName, bottleLabel, remainingML, bottleSizeML) {
  const recipient = process.env.ALERT_EMAIL || process.env.SMTP_USER;
  if (!recipient) {
    console.log(`[Email Service] Low Stock Alert (No ALERT_EMAIL configured): ${productName} - ${bottleLabel} is low (${remainingML}ml / ${bottleSizeML}ml)`);
    return;
  }

  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Service] Low Stock Alert (SMTP not configured): ${productName} - ${bottleLabel} is low (${remainingML}ml / ${bottleSizeML}ml)`);
    return;
  }

  const percentage = Math.round((remainingML / bottleSizeML) * 100);

  const mailOptions = {
    from: `"Decant Atelier Inventory" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject: `⚠️ Low Stock Alert: ${productName} (${bottleLabel})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #ea580c; margin-top: 0;">Inventory Alarm Triggered</h2>
        <p>This is an automated warning that a perfume bottle has fallen below its low stock threshold.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Product:</td>
            <td style="padding: 8px 0;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Bottle Label:</td>
            <td style="padding: 8px 0;">${bottleLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Current Status:</td>
            <td style="padding: 8px 0; color: #ef4444; font-weight: bold;">${remainingML}ml / ${bottleSizeML}ml (${percentage}%)</td>
          </tr>
        </table>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <div style="text-align: center; margin-top: 25px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" style="background-color: #1c1b18; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 4px; display: inline-block;">Open Admin Panel</a>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Low Stock Alert email sent successfully: ${info.messageId}`);
  } catch (err) {
    console.error('[Email Service] Failed to send low stock alert email:', err);
  }
}

/**
 * Sends a new order notification email to the store owner.
 * @param {object} order - Order object with items and subtotal
 * @param {string} customerName - Name of customer
 */
export async function sendNewOrderAlert(order, customerName) {
  const recipient = process.env.ALERT_EMAIL || process.env.SMTP_USER;
  if (!recipient) {
    console.log(`[Email Service] New Order Alert (No ALERT_EMAIL configured): Order ${order.orderReference || order.id} placed by ${customerName}`);
    return;
  }

  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Service] New Order Alert (SMTP not configured): Order ${order.orderReference || order.id} placed by ${customerName}`);
    return;
  }

  const itemsHtml = order.orderItems.map(item => {
    const bottleName = item.bottleName;
    const bottleColor = item.bottleColor;
    const bottlePriceAdj = Number(item.bottlePriceAdjustment || 0);
    const bottleText = bottleName ? `${bottleName}${bottleColor ? ` (${bottleColor})` : ''}` : null;

    return `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 10px 0; font-size: 14px;">
        <strong>${item.productName}</strong> (${item.size})
        ${bottleText ? `<div style="font-size: 12px; color: #8b672f; margin-top: 4px;">Bottle: ${bottleText}${bottlePriceAdj > 0 ? ` (+₹${bottlePriceAdj})` : ''}</div>` : ''}
        ${item.bottleSku ? `<div style="font-size: 11px; color: #9ca3af; font-family: monospace;">SKU: ${item.bottleSku}</div>` : ''}
      </td>
      <td style="padding: 10px 0; text-align: center; font-size: 14px;">x${item.quantity}</td>
      <td style="padding: 10px 0; text-align: right; font-size: 14px;">₹${(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `;
  }).join('');

  const mailOptions = {
    from: `"Decant Atelier Sales" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject: `🔔 New Order Received: ${order.orderReference || order.id}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1c1b18; margin-top: 0;">New Customer Order</h2>
        <p>A new order has been successfully placed on Decant Atelier.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        
        <h4 style="margin-bottom: 10px; color: #374151;">Order Summary</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb; text-align: left;">
              <th style="padding-bottom: 8px; font-size: 12px; text-transform: uppercase; color: #6b7280;">Item</th>
              <th style="padding-bottom: 8px; text-align: center; font-size: 12px; text-transform: uppercase; color: #6b7280;">Qty</th>
              <th style="padding-bottom: 8px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <table style="width: 100%; margin-top: 10px;">
          <tr>
            <td style="font-size: 14px; color: #4b5563;">Subtotal:</td>
            <td style="text-align: right; font-size: 14px;">₹${parseFloat(order.subtotal).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="font-size: 14px; color: #4b5563;">Shipping Fee:</td>
            <td style="text-align: right; font-size: 14px;">₹${parseFloat(order.shippingFee).toLocaleString('en-IN')}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 16px; border-top: 1px solid #e5e7eb;">
            <td style="padding-top: 10px;">Total:</td>
            <td style="padding-top: 10px; text-align: right; color: #8b672f;">₹${parseFloat(order.total).toLocaleString('en-IN')}</td>
          </tr>
        </table>
        
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <h4 style="margin-bottom: 10px; color: #374151;">Customer & Delivery Details</h4>
        <table style="width: 100%; font-size: 13px; line-height: 1.6;">
          <tr>
            <td style="font-weight: bold; width: 120px; color: #6b7280;">Customer Name:</td>
            <td>${customerName}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #6b7280;">Method:</td>
            <td>${order.paymentMethod} / ${order.shippingMethod}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" style="background-color: #1c1b18; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 4px; display: inline-block;">Manage Order</a>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] New Order Alert email sent successfully: ${info.messageId}`);
  } catch (err) {
    console.error('[Email Service] Failed to send new order alert email:', err);
  }
}

/**
 * Sends a customer order confirmation email.
 * @param {object} order - Order object with items, subtotal, and user relation
 * @param {string} recipientEmail - Customer email address
 */
export async function sendCustomerOrderConfirmation(order, recipientEmail) {
  if (!recipientEmail) return;

  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Service] Customer Confirmation (SMTP not configured): Order ${order.orderReference || order.id} for ${recipientEmail}`);
    return;
  }

  const itemsHtml = order.orderItems.map(item => {
    const bottleName = item.bottleName;
    const bottleColor = item.bottleColor;
    const bottlePriceAdj = Number(item.bottlePriceAdjustment || 0);
    const bottleText = bottleName ? `${bottleName}${bottleColor ? ` (${bottleColor})` : ''}` : null;

    return `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 12px 0;">
        <strong style="color: #1c1b18; font-size: 14px;">${item.productName}</strong> <span style="color: #6b7280; font-size: 13px;">(${item.size})</span>
        ${bottleText ? `<div style="font-size: 12px; color: #8b672f; margin-top: 4px;">Packaging: ${bottleText}${bottlePriceAdj > 0 ? ` (+₹${bottlePriceAdj})` : ''}</div>` : ''}
      </td>
      <td style="padding: 12px 0; text-align: center; font-size: 14px;">x${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 600;">₹${(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `;
  }).join('');

  const mailOptions = {
    from: `"Decant Atelier" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: `✨ Order Confirmed: ${order.orderReference || order.id}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fefcf9; color: #1c1b18;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; color: #1c1b18; margin: 0;">Decant Atelier</h1>
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #8b672f; margin-top: 4px;">Order Confirmation</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">Thank you for your order. Your niche fragrance selections have been received and are being hand-poured at our studio.</p>
        
        <div style="background: #ffffff; border: 1px solid #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">Order Reference: <strong style="color: #1c1b18;">#${order.orderReference || order.id}</strong></p>
          <p style="margin: 0; font-size: 13px; color: #6b7280;">Payment Method: <strong style="color: #1c1b18;">${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid Online Payment'}</strong></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb; text-align: left;">
              <th style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280;">Selection</th>
              <th style="padding-bottom: 8px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280;">Qty</th>
              <th style="padding-bottom: 8px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table style="width: 100%; margin-top: 10px;">
          <tr>
            <td style="font-size: 14px; color: #6b7280;">Subtotal:</td>
            <td style="text-align: right; font-size: 14px;">₹${parseFloat(order.subtotal).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="font-size: 14px; color: #6b7280;">Delivery:</td>
            <td style="text-align: right; font-size: 14px;">${parseFloat(order.shippingFee) > 0 ? `₹${parseFloat(order.shippingFee).toLocaleString('en-IN')}` : 'Complimentary'}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 16px; border-top: 1px solid #e5e7eb;">
            <td style="padding-top: 12px; color: #1c1b18;">Total Paid:</td>
            <td style="padding-top: 12px; text-align: right; color: #8b672f;">₹${parseFloat(order.total).toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" style="background-color: #1c1b18; color: #fefcf9; padding: 12px 28px; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; display: inline-block;">Track Your Order</a>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Customer confirmation email sent successfully to ${recipientEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service] Failed to send customer confirmation email to ${recipientEmail}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a test email to verify SMTP configuration.
 * @param {string} testRecipient - Recipient email address
 */
export async function sendTestEmail(testRecipient) {
  const transporter = createTransporter();
  if (!transporter) {
    throw new Error('SMTP configuration is missing. Required environment variables: SMTP_HOST, SMTP_USER, SMTP_PASS.');
  }

  const recipient = testRecipient || process.env.ALERT_EMAIL || process.env.SMTP_USER;

  const mailOptions = {
    from: `"Decant Atelier Verification" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject: `✅ Decant Atelier SMTP Test Connection`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #10b981; border-radius: 8px;">
        <h2 style="color: #10b981; margin-top: 0;">SMTP Dispatch Operational</h2>
        <p>This is a test email sent from your Decant Atelier server environment.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;" />
        <p style="font-size: 13px; color: #4b5563;"><strong>Host:</strong> ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || '587'}</p>
        <p style="font-size: 13px; color: #4b5563;"><strong>Sender:</strong> ${process.env.SMTP_USER}</p>
        <p style="font-size: 13px; color: #4b5563;"><strong>Recipient:</strong> ${recipient}</p>
        <p style="font-size: 13px; color: #4b5563;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email Service] Test email sent successfully to ${recipient}: ${info.messageId}`);
  return { success: true, messageId: info.messageId, recipient };
}
