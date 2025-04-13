import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  // Generate token for user
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

export default generateToken;