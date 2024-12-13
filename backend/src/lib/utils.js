import jwt from "jsonwebtoken";
export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
    // todo set  ccokie  not cookies
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // prevents client side JS from accessing the cookie
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
  return token;
};
