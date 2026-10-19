import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Restaurant from "@/models/Restaurant";
import { DomainService, TENANT_CNAME_TARGET, TENANT_SERVER_IP } from "@/services/backend/domain";

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { domain } = await req.json();
    const { id: restaurantId } = await params;

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    const cleanDomain = domain
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .replace(/\/$/, "");

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found or unauthorized" },
        { status: 404 }
      );
    }

    restaurant.domain = cleanDomain;
    await restaurant.save();

    return NextResponse.json(
      {
        success: true,
        message: "Domain added successfully. Please configure your DNS records.",
        domain: cleanDomain,
        dnsTarget: TENANT_CNAME_TARGET,
        serverIp: TENANT_SERVER_IP,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[DOMAIN_API_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id: restaurantId } = await params;

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    if (restaurant.domain) {
      restaurant.domain = "";
      await restaurant.save();
    }

    return NextResponse.json({ success: true, message: "Domain removed" });
  } catch (error) {
    console.error("[DOMAIN_API_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id: restaurantId } = await params;

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    if (!restaurant.domain) {
      return NextResponse.json({ error: "No domain configured" }, { status: 400 });
    }

    const verifyResult = await DomainService.verifyDomain(restaurant.domain);
    
    return NextResponse.json(verifyResult);
  } catch (error) {
    console.error("[DOMAIN_VERIFY_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
