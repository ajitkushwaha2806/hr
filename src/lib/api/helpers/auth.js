import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
export const getAuthUser = (req) => {
    try {
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        return {
            userId: decoded.userId,
            restaurantId: decoded.restaurantId,
            phone: decoded.phone,
            token,
        };
    } catch (err) {
        return null;
    }
};