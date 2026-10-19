import mongoose, { Schema, Types } from "mongoose";

const BannerSchema = new Schema({
  image: { type: String, default: null },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  ctaText: { type: String, default: "" },
  ctaLink: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
});

const SocialLinksSchema = new Schema({
  facebook: { type: String, default: "" },
  instagram: { type: String, default: "" },
  twitter: { type: String, default: "" },
  others: { type: Map, of: String, default: {} }
}, { _id: false });

const ThemeColorsSchema = new Schema({
  primary: { type: String, default: "#000000" },
  primaryForeground: { type: String, default: "#ffffff" },
  secondary: { type: String, default: "#f4f4f5" },
  secondaryForeground: { type: String, default: "#18181b" },
  background: { type: String, default: "#ffffff" },
  foreground: { type: String, default: "#09090b" },
  muted: { type: String, default: "#f4f4f5" },
  mutedForeground: { type: String, default: "#71717a" }
}, { _id: false });

const ThemeSchema = new Schema({
  colors: { type: ThemeColorsSchema, default: () => ({}) }
}, { _id: false });

const WebsiteConfigSchema = new Schema(
  {
    restaurant: {
      type: Types.ObjectId,
      ref: "Restaurant",
      required: true,
      unique: true,
      index: true,
    },
    theme: { type: ThemeSchema, default: () => ({}) },

    homepage: {
      banners: {
        isEnabled: { type: Boolean, default: true },
        items: [BannerSchema],
      },
      sections: [{
        sectionType: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        displayOrder: { type: Number, default: 0 },
        config: { type: Schema.Types.Mixed, default: {} }
      }]
    },

    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
    customSettings: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },

    displayPreferences: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },

    ordering: {
      acceptedTypes: [{
        type: String,
        enum: ["DINE_IN", "TAKEAWAY", "DELIVERY"]
      }],
      defaultType: {
        type: String,
        enum: ["DINE_IN", "TAKEAWAY", "DELIVERY"]
      },
      paymentMethods: [{
        type: String,
        enum: ["CASH", "ONLINE", "UPI"]
      }],
      defaultPaymentMethod: {
        type: String,
        enum: ["CASH", "ONLINE", "UPI"]
      },
      upiId: {
        type: String,
        trim: true,
        default: ""
      },
      razorpayEnabled: {
        type: Boolean,
        default: true
      },
      paymentSettings: {
        upi: {
          isEnabled: { type: Boolean, default: false },
          upiId: { type: String, trim: true, default: "" },
        },
        razorpay: {
          isEnabled: { type: Boolean, default: false },
        },
        activeProvider: {
          type: String,
          enum: ["RAZORPAY", "UPI", "BOTH"],
          default: "RAZORPAY",
        },
      },
      minOrderValue: {
        isEnabled: { type: Boolean, default: false },
        amount: { type: Number, default: 0 },
        dineIn: {
          isEnabled: { type: Boolean, default: false },
          amount: { type: Number, default: 0 }
        },
        takeaway: {
          isEnabled: { type: Boolean, default: false },
          amount: { type: Number, default: 0 }
        },
        delivery: {
          isEnabled: { type: Boolean, default: false },
          amount: { type: Number, default: 0 }
        },
        orderTypes: {
          DINE_IN: {
            isEnabled: { type: Boolean, default: false },
            amount: { type: Number, default: 0 }
          },
          TAKEAWAY: {
            isEnabled: { type: Boolean, default: false },
            amount: { type: Number, default: 0 }
          },
          DELIVERY: {
            isEnabled: { type: Boolean, default: false },
            amount: { type: Number, default: 0 }
          }
        }
      },
      deliveryCharge: {
        isEnabled: { type: Boolean, default: false },
        amount: { type: Number, default: 0 },
        freeDeliveryAbove: { type: Number, default: 0 }
      },
      packingCharges: {
        isEnabled: { type: Boolean, default: false },
        amount: { type: Number, default: 0 },
        applicableOrderTypes: [{
          type: String,
          enum: ["DELIVERY", "TAKEAWAY", "DINE_IN"]
        }],
        delivery: {
          isEnabled: { type: Boolean, default: false },
          amount: { type: Number, default: 0 }
        },
        takeaway: {
          isEnabled: { type: Boolean, default: false },
          amount: { type: Number, default: 0 }
        },
        dineIn: {
          isEnabled: { type: Boolean, default: false },
          amount: { type: Number, default: 0 }
        },
        orderTypes: {
          DELIVERY: {
            isEnabled: { type: Boolean, default: false },
            amount: { type: Number, default: 0 }
          },
          TAKEAWAY: {
            isEnabled: { type: Boolean, default: false },
            amount: { type: Number, default: 0 }
          },
          DINE_IN: {
            isEnabled: { type: Boolean, default: false },
            amount: { type: Number, default: 0 }
          }
        }
      },
      platformFee: {
        isEnabled: { type: Boolean, default: false },
        amount: { type: Number, default: 0 },
        applicableOrderTypes: [{
          type: String,
          enum: ["DELIVERY", "TAKEAWAY", "DINE_IN"]
        }],
        delivery: {
          isEnabled: { type: Boolean, default: false },
          amount: { type: Number, default: 0 }
        },
        takeaway: {
          isEnabled: { type: Boolean, default: false },
          amount: { type: Number, default: 0 }
        },
        dineIn: {
          isEnabled: { type: Boolean, default: false },
          amount: { type: Number, default: 0 }
        },
        orderTypes: {
          DELIVERY: {
            isEnabled: { type: Boolean, default: false },
            amount: { type: Number, default: 0 }
          },
          TAKEAWAY: {
            isEnabled: { type: Boolean, default: false },
            amount: { type: Number, default: 0 }
          },
          DINE_IN: {
            isEnabled: { type: Boolean, default: false },
            amount: { type: Number, default: 0 }
          }
        }
      },
      taxAndServiceFee: {
        isEnabled: { type: Boolean, default: false },
        amount: { type: Number, default: 0 },
        applicableOrderTypes: [{
          type: String,
          enum: ["DELIVERY", "TAKEAWAY", "DINE_IN"]
        }],
        delivery: {
          isEnabled: { type: Boolean, default: false },
          amount: { type: Number, default: 0 }
        },
        takeaway: {
          isEnabled: { type: Boolean, default: false },
          amount: { type: Number, default: 0 }
        },
        dineIn: {
          isEnabled: { type: Boolean, default: false },
          amount: { type: Number, default: 0 }
        },
        orderTypes: {
          DELIVERY: {
            isEnabled: { type: Boolean, default: false },
            amount: { type: Number, default: 0 }
          },
          TAKEAWAY: {
            isEnabled: { type: Boolean, default: false },
            amount: { type: Number, default: 0 }
          },
          DINE_IN: {
            isEnabled: { type: Boolean, default: false },
            amount: { type: Number, default: 0 }
          }
        }
      }
    }
  },
  {
    timestamps: true,
    strict: true 
  }
);

export default mongoose.models.WebsiteConfig || mongoose.model("WebsiteConfig", WebsiteConfigSchema);
