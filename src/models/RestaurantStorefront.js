import mongoose from "mongoose";

const restaurantStorefrontSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
            unique: true,
            index: true,
        },

        template: {
            type: String,
            enum: ["modern", "elegant", "minimal"],
            default: "modern",
        },

        theme: {
            colors: {
                primary: {
                    type: String,
                    default: "#C2410C",
                },

                primaryForeground: {
                    type: String,
                    default: "#FFFFFF",
                },

                secondary: {
                    type: String,
                    default: "#FFF7ED",
                },

                secondaryForeground: {
                    type: String,
                    default: "#431407",
                },

                background: {
                    type: String,
                    default: "#FFFFFF",
                },

                foreground: {
                    type: String,
                    default: "#18181B",
                },

                muted: {
                    type: String,
                    default: "#F4F4F5",
                },

                mutedForeground: {
                    type: String,
                    default: "#71717A",
                },

                border: {
                    type: String,
                    default: "#E4E4E7",
                },
            },

            typography: {
                headingFont: {
                    type: String,
                    default: "poppins",
                },

                bodyFont: {
                    type: String,
                    default: "poppins",
                },
            },

            radius: {
                type: String,
                enum: ["sharp", "rounded", "soft", "pill"],
                default: "rounded",
            },
        },

        branding: {
            logo: {
                type: String,
                default: "",
            },

            favicon: {
                type: String,
                default: "",
            },

            coverImage: {
                type: String,
                default: "",
            },
        },
        isPublished: {
            type: Boolean,
            default: false,
        },

        publishedAt: {
            type: Date,
            default: null,
        },
    },

    {
        timestamps: true,
    }
);

const RestaurantStorefront =
    mongoose.models.RestaurantStorefront ||
    mongoose.model(
        "RestaurantStorefront",
        restaurantStorefrontSchema
    );

export default RestaurantStorefront;