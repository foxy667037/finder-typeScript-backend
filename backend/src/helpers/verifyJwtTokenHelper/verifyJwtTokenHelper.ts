import jwt from "jsonwebtoken";

// Helper Function to verify the token
const verifyJwtTokenHelper = async (
  token: string
): Promise<{ email: string }> => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    return new Promise((resolve, reject) => {
      jwt.verify(token, `${JWT_SECRET}`, (err, decoded) => {
        if (err || !decoded) {
          return reject(new Error("Invalid or expired token"));
        }
        resolve(decoded as { email: string });
      });
    });
  } catch (error) {
    throw new Error("Token verification failed");
  }
};

export default verifyJwtTokenHelper;