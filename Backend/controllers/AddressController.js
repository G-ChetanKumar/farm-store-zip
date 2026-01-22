const Address = require("../models/AddressModel");

const sanitizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

exports.addAddress = async (req, res) => {
  try {
    const userId = req.user;
    const label = sanitizeString(req.body.label);
    const tag = sanitizeString(req.body.tag);
    const name = sanitizeString(req.body.name);
    const phone = sanitizeString(req.body.phone);
    const line1 = sanitizeString(req.body.line1);
    const line2 = sanitizeString(req.body.line2);
    const city = sanitizeString(req.body.city);
    const state = sanitizeString(req.body.state);
    const postal_code = sanitizeString(req.body.postal_code);
    const country = sanitizeString(req.body.country) || "India";
    const is_default = Boolean(req.body.is_default);

    if (!label || !line1 || !city || !state || !postal_code) {
      return res.status(400).json({ message: "Missing required address fields" });
    }

    if (is_default) {
      await Address.updateMany(
        { user_id: userId, is_default: true },
        { is_default: false }
      );
    }

    const address = await Address.create({
      user_id: userId,
      label,
      tag,
      name,
      phone,
      line1,
      line2,
      city,
      state,
      postal_code,
      country,
      is_default,
    });

    res.status(201).json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user;
    const addresses = await Address.find({ user_id: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const updates = {
      label: sanitizeString(req.body.label),
      tag: sanitizeString(req.body.tag),
      name: sanitizeString(req.body.name),
      phone: sanitizeString(req.body.phone),
      line1: sanitizeString(req.body.line1),
      line2: sanitizeString(req.body.line2),
      city: sanitizeString(req.body.city),
      state: sanitizeString(req.body.state),
      postal_code: sanitizeString(req.body.postal_code),
      country: sanitizeString(req.body.country),
    };
    const is_default = req.body.is_default;
    if (typeof is_default === "boolean") {
      updates.is_default = is_default;
    }

    if (updates.is_default) {
      await Address.updateMany(
        { user_id: userId, is_default: true },
        { is_default: false }
      );
    }

    const address = await Address.findOneAndUpdate(
      { _id: id, user_id: userId },
      updates,
      { new: true }
    );
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    res.status(200).json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, user_id: userId });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    res.status(200).json({ success: true, message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const address = await Address.findOne({ _id: id, user_id: userId });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    await Address.updateMany({ user_id: userId, is_default: true }, { is_default: false });
    address.is_default = true;
    await address.save();
    res.status(200).json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
