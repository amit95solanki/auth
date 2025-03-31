import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  console.log("hello");

  const token =
    req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ success: false, msg: "Token is required" });
  }
  try {
    const bearer = token.split(" ");
    const bearerToken = bearer[1];

    const decodeData = jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET);

    req.user = decodeData;
    return next();
  } catch (err) {
    return res.status(403).json({ success: false, msg: "Invalid token" });
  }
};

export default verifyToken;
