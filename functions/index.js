const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const { WebpayPlus } = require('transbank-sdk');
const { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require('transbank-sdk');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// ... (configuración de nodemailer igual)

// 1. Iniciar Transacción con validaciones
exports.initWebpayTransaction = onRequest({ 
  region: 'us-central1',
  maxInstances: 10,
  invoker: 'public'
}, (req, res) => {
  return cors(req, res, async () => {
    try {
      const { buyOrder, sessionId, amount, returnUrl } = req.body;
      
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Monto inválido' });
      }

      logger.info("Iniciando pago", { buyOrder, amount, returnUrl });
      const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
      const createResponse = await tx.create(buyOrder, sessionId, amount, returnUrl);
      
      return res.json(createResponse);
    } catch (error) {
      logger.error("Error en initWebpayTransaction", error);
      return res.status(500).json({ error: 'Error interno del servidor de pagos' });
    }
  });
});

// 2. Confirmar Transacción
exports.confirmWebpayTransaction = onRequest({ 
  region: 'us-central1',
  maxInstances: 10 
}, (req, res) => {
  return cors(req, res, async () => {
    try {
      const token = req.query.token_ws || req.body.token_ws;
      const frontendUrl = 'https://medistock-15247.web.app';

      if (!token) {
        const tbkToken = req.query.TBK_TOKEN || req.body.TBK_TOKEN;
        return res.redirect(`${frontendUrl}/checkout?status=${tbkToken ? 'cancelled' : 'error'}`);
      }

      const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
      const commitResponse = await tx.commit(token);

      const status = (commitResponse.response_code === 0 && commitResponse.status === 'AUTHORIZED') ? 'success' : 'rejected';
      return res.redirect(`${frontendUrl}/checkout?status=${status}&token=${token}&buyOrder=${commitResponse.buy_order}`);
      
    } catch (error) {
      logger.error("Error en confirmWebpayTransaction", error);
      return res.redirect('https://medistock-15247.web.app/checkout?status=error');
    }
  });
});

// Función para enviar correo con PDF
exports.sendEmailWithPdf = onRequest({ region: 'us-central1', cors: true }, async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { to, subject, text, html, pdfBase64, pdfName } = req.body;

    if (!to || !subject) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const mailOptions = {
      from: `"Medistock" <no-reply@medistock.com>`,
      to: to,
      subject: subject,
      text: text || 'Adjunto su comprobante.',
      html: html || '<p>Adjunto su comprobante de compra.</p>',
      attachments: []
    };

    if (pdfBase64 && pdfName) {
      mailOptions.attachments.push({
        filename: pdfName,
        content: pdfBase64,
        encoding: 'base64'
      });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    return res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: error.message });
  }
});

// --- API PROPIA PARA ERP (EXPOSICIÓN DE SERVICIOS) ---
// Endpoint: GET /api/v1/productos/{id}
exports.getProductApi = onRequest({ region: 'us-central1', cors: true }, async (req, res) => {
  try {
    const parts = req.path.split('/');
    const productId = parts[parts.length - 1];

    if (!productId) {
      return res.status(400).json({ error: 'ID de producto requerido' });
    }

    const doc = await admin.firestore().collection('products').doc(productId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const data = doc.data();
    return res.json({
      id: doc.id,
      nombre: data.nombre,
      precio: data.precio,
      stock: data.stock,
      categoria: data.categoria,
      ultima_actualizacion: data.updatedAt || new Date().toISOString()
    });
  } catch (error) {
    logger.error("Error en API de productos", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- INTEGRACIÓN LOGÍSTICA (SIMULACIÓN API SHIPPO/CHILEXPRESS) ---
exports.createLogisticsLabel = onRequest({ region: 'us-central1', cors: true }, async (req, res) => {
  try {
    const { orderId, address, city } = req.body;

    if (!orderId) return res.status(400).json({ error: 'orderId es requerido' });

    // Simulación de respuesta de API externa (Shippo/Chilexpress)
    const trackingNumber = `MS-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;
    const labelUrl = `https://logistics-provider.com/labels/${trackingNumber}.pdf`;

    // Actualizar el pedido con el número de seguimiento real de la "API"
    await admin.firestore().collection('orders').doc(orderId).update({
      trackingNumber: trackingNumber,
      logisticsStatus: 'label_created',
      labelUrl: labelUrl
    });

    return res.json({
      success: true,
      tracking_number: trackingNumber,
      carrier: 'Medistock Express (Simulated API)',
      estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    logger.error("Error en API de logística", error);
    return res.status(500).json({ error: 'Error en la integración logística' });
  }
});