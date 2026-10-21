import dbConnect from "@/lib/db";
import OfficeLocation from "@/models/OfficeLocation";
import { BadRequestError } from "@/lib/api/response-handler";

/**
 * Calculates distance in meters between two GPS coordinates using the Haversine formula
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (Number(lat1) * Math.PI) / 180;
  const φ2 = (Number(lat2) * Math.PI) / 180;
  const Δφ = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const Δλ = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}

export class OfficeLocationService {
  static async getOfficeLocation(organizationId) {
    await dbConnect();

    let location = await OfficeLocation.findOne({
      organizationId,
      isActive: true,
    }).lean();

    // If no custom office location exists yet, default to an initial office coordinates or return null
    if (!location) {
      location = await OfficeLocation.findOne({
        isActive: true,
      }).lean();
    }

    return location;
  }

  static async setOfficeLocation(organizationId, payload) {
    await dbConnect();

    const {
      latitude,
      longitude,
      radiusMeters = 200,
      officeName = "Headquarters",
      address = "",
      calibratedBy = "",
    } = payload;

    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestError("Latitude and longitude are required to set office location");
    }

    const numericLat = Number(latitude);
    const numericLng = Number(longitude);
    const numericRadius = Math.max(10, Math.min(5000, Number(radiusMeters) || 200));

    if (isNaN(numericLat) || numericLat < -90 || numericLat > 90) {
      throw new BadRequestError("Invalid latitude value");
    }
    if (isNaN(numericLng) || numericLng < -180 || numericLng > 180) {
      throw new BadRequestError("Invalid longitude value");
    }

    const updated = await OfficeLocation.findOneAndUpdate(
      { organizationId },
      {
        organizationId,
        officeName: officeName.trim() || "Headquarters",
        latitude: numericLat,
        longitude: numericLng,
        radiusMeters: numericRadius,
        address: address.trim(),
        isActive: true,
        calibratedAt: new Date(),
        calibratedBy: calibratedBy || "Admin",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return updated;
  }

  static verifyGeofence(userLat, userLng, officeLocation) {
    if (!officeLocation || officeLocation.latitude == null || officeLocation.longitude == null) {
      return {
        isWithinGeofence: false,
        distanceMeters: -1,
        allowedRadius: 200,
        error: "Office location is not calibrated yet. Please set the office location first.",
      };
    }

    const distanceMeters = calculateHaversineDistance(
      userLat,
      userLng,
      officeLocation.latitude,
      officeLocation.longitude
    );

    const allowedRadius = officeLocation.radiusMeters || 200;
    const isWithinGeofence = distanceMeters <= allowedRadius;

    return {
      isWithinGeofence,
      distanceMeters,
      allowedRadius,
      officeName: officeLocation.officeName || "Office",
    };
  }
}
