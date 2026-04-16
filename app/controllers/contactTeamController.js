const { contactTeam } = require('../models');
module.exports = {
  contact: async (req, res) => {
    try {
      const { name, type, email, message, subSubject, propertyType,
        propertyLocation,
        phoneNumber,
        whenToSell } = req.body;
      const addedBy = req.identity?.id;

      const newContact = await contactTeam.create({
        name,
        type,
        email,
        message,
        subSubject,
        addedBy,
        propertyType,
        propertyLocation,
        phoneNumber,
        whenToSell
      });

      return res.status(200).json({
        success: true,
        message: "Contact message submitted.",
        data: newContact
      });
    } catch (err) {
      console.error("Error adding contact:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Internal Server Error."
      });
    }
  },

  listAll: async (req, res) => {
    try {
      const { name, page = 1, limit = 10 } = req.query;

      let query = {};
      if (name) {
        query.name = { $regex: name, $options: "i" };
      }

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const totalCount = await contactTeam.countDocuments(query);

      const contacts = await contactTeam
        .find(query)
        .populate("addedBy", "fullName email")
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Contact list fetched successfully.",
        data: contacts,
        total: totalCount,
      });
    } catch (err) {
      console.error("Error fetching contact list:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Internal Server Error."
      });
    }
  },

  detail: async (req, res) => {
    try {
      const { id } = req.query;
      const contact = await contactTeam.findById(id).populate("addedBy", "name email");

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact not found."
        });
      }

      return res.status(200).json({
        success: true,
        message: "Contact detail fetched successfully.",
        data: contact
      });
    } catch (err) {
      console.error("Error fetching contact detail:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Internal Server Error."
      });
    }
  },

  deleteContact: async (req, res) => {
    try {
      const { id } = req.query;
      const deleted = await contactTeam.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Contact not found or already deleted."
        });
      }

      return res.status(200).json({
        success: true,
        message: "Contact deleted successfully.",
        data: deleted
      });
    } catch (err) {
      console.error("Error deleting contact:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Internal Server Error."
      });
    }
  }
}