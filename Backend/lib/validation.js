const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const sanitizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const sanitizeMobile = (value) => sanitizeString(value).replace(/[^0-9]/g, "");

const isValidMobile = (value) => /^[0-9]{10,15}$/.test(value);

const isValidEmail = (value) =>
  !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidUserType = (value) =>
  ["Farmer", "Agri-Retailer", "Agent"].includes(value);

module.exports = {
  isNonEmptyString,
  sanitizeString,
  sanitizeMobile,
  isValidMobile,
  isValidEmail,
  isValidUserType,
};
