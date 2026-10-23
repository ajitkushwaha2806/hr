import dbConnect from "@/lib/db";
import OfficeLocation from "@/models/OfficeLocation";
import { BadRequestError } from "@/lib/api/response-handler";

export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; 
  const φ1 = (Number(lat1) * Math.PI) / 180;
  const φ2 = (Number(lat2) * Math.PI) / 180;
  const Δφ = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const Δλ = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export class OfficeLocationService {
  static async getOfficeLocation(organizationId) {
    await dbConnect();

    const targetOrgId = organizationId || "default_org";

    let location = await OfficeLocation.findOne({
      organizationId: targetOrgId,
      isActive: true,
    }).lean();

    if (!location) {
      const created = await OfficeLocation.create({
        organizationId: targetOrgId,
        officeName: "Headquarters",
        radiusMeters: 200,
        matchThreshold: 75,
        shiftStart: "10:00",
        shiftEnd: "19:00",
        gracePeriod: 15,
        isActive: true,
      });
      location = created.toObject();
    }

    return location;
  }

  static async setOfficeLocation(organizationId, payload) {
    await dbConnect();

    const targetOrgId = organizationId || "default_org";

    const {
      latitude,
      longitude,
      radiusMeters = 200,
      officeName = "Headquarters",
      matchThreshold = 75,
      shiftStart = "10:00",
      shiftEnd = "19:00",
      gracePeriod = 15,
      address = "",
      calibratedBy = "",
      companyName = "",
      companyAddress = "",
      companyPhone = "",
      companyWebsite = "",
      companyRepresentative = "",
      companyDesignation = "",
      companyLogo = "",
    } = payload;

    const numericRadius = Math.max(10, Math.min(5000, Number(radiusMeters) || 200));
    const numericThreshold = Math.max(50, Math.min(100, Number(matchThreshold) || 75));
    const numericGrace = Math.max(0, Math.min(120, Number(gracePeriod) || 0));

    const updateData = {
      organizationId: targetOrgId,
      officeName: officeName.trim() || "Headquarters",
      radiusMeters: numericRadius,
      matchThreshold: numericThreshold,
      shiftStart: shiftStart || "10:00",
      shiftEnd: shiftEnd || "19:00",
      gracePeriod: numericGrace,
      address: address.trim(),
      companyName: companyName.trim(),
      companyAddress: companyAddress.trim(),
      companyPhone: companyPhone.trim(),
      companyWebsite: companyWebsite.trim(),
      companyRepresentative: companyRepresentative.trim(),
      companyDesignation: companyDesignation.trim() || "Authorized Signatory",
      companyLogo: companyLogo.trim(),
      isActive: true,
      calibratedAt: new Date(),
      calibratedBy: calibratedBy || "Admin",
    };

    if (latitude !== undefined && latitude !== null && latitude !== "") {
      const numericLat = Number(latitude);
      if (isNaN(numericLat) || numericLat < -90 || numericLat > 90) {
        throw new BadRequestError("Invalid latitude value");
      }
      updateData.latitude = numericLat;
    }

    if (longitude !== undefined && longitude !== null && longitude !== "") {
      const numericLng = Number(longitude);
      if (isNaN(numericLng) || numericLng < -180 || numericLng > 180) {
        throw new BadRequestError("Invalid longitude value");
      }
      updateData.longitude = numericLng;
    }

    const updated = await OfficeLocation.findOneAndUpdate(
      { organizationId: targetOrgId },
      { $set: updateData },
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
