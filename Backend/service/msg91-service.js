const https = require("https");

const MSG91_BASE_URL = process.env.MSG91_BASE_URL || "https://api.msg91.com/api/v5/otp";

const ensureTemplateId = (url, templateId) => {
  if (!templateId) {
    throw new Error("MSG91 template_id is missing");
  }
  if (url.includes("template_id=")) {
    return url;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}template_id=${encodeURIComponent(templateId)}`;
};

const parseMsg91Response = (body) => {
  try {
    return JSON.parse(body);
  } catch (error) {
    return { raw: body };
  }
};

const buildRequest = (payload, templateId) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const url = new URL(ensureTemplateId(MSG91_BASE_URL, templateId));
    console.log("[msg91] sending request", {
      url: url.toString(),
      sender: payload.sender,
      template_id: payload.template_id,
      route: payload.route,
    });

    const req = https.request(
      {
        method: "POST",
        hostname: url.hostname,
        path: url.pathname + url.search,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
          authkey: process.env.MSG91_AUTH_KEY,
        },
        // Disable SSL verification for development (REMOVE IN PRODUCTION!)
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          const parsed = parseMsg91Response(body);
          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`MSG91 error ${res.statusCode}: ${body}`));
          }
          if (parsed && parsed.type && parsed.type.toLowerCase() === "error") {
            return reject(new Error(`MSG91 error: ${parsed.message || body}`));
          }
          resolve(parsed);
        });
      }
    );

    req.on("error", reject);
    req.write(data);
    req.end();
  });
};

const sendOtp = async ({ mobile, otp }) => {
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID;
  if (!process.env.MSG91_AUTH_KEY) {
    throw new Error("MSG91 auth key is missing");
  }
  if (!senderId) {
    throw new Error("MSG91 sender ID is missing");
  }

  const normalizedMobile = mobile.length === 10 ? `91${mobile}` : mobile;
  const payload = {
    mobile: normalizedMobile,
    otp,
    sender: senderId,
    template_id: templateId,
    otp_length: parseInt(process.env.MSG91_OTP_LENGTH || "6", 10),
    otp_expiry: parseInt(process.env.MSG91_OTP_EXPIRY_MINUTES || "5", 10),
    route: process.env.MSG91_OTP_ROUTE || "login",
  };

  return buildRequest(payload, templateId);
};

module.exports = {
  sendOtp,
};
