
const adminAuth = async (req, res, next) => {
  try {
    const { role } = req.identity;
    console.log("ROLE", role);
    if (role !== "admin") {
      res.status(403).send({
        message: "unauthorized",
        success: false,
        error: "unauthorized",
      });
      return;
    }

    next();
  } catch (error) {
    console.log("error>>>>>>>>>>>>>>>", error);
    res.status(401).send({
      message: "Admin only route",
      success: false,
      error: "invalid_token",
    });
  }
};

module.exports = { adminAuth };
