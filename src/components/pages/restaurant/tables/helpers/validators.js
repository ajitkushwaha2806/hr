import * as Yup from "yup";
import { TABLE_STATUSES, TABLE_CAPACITY_MIN, TABLE_CAPACITY_MAX, ZONE_DEFAULT } from "./constants";

export const tableFormSchema = Yup.object({
    tableNumber: Yup.number()
        .required("Table number is required")
        .min(1, "Must be at least 1")
        .integer("Must be a whole number"),
    zone: Yup.string()
        .trim()
        .max(50, "Max 50 characters")
        .default(ZONE_DEFAULT),
    label: Yup.string()
        .max(50, "Max 50 characters"),
    capacity: Yup.number()
        .required("Capacity is required")
        .min(TABLE_CAPACITY_MIN, `Min capacity is ${TABLE_CAPACITY_MIN}`)
        .max(TABLE_CAPACITY_MAX, `Max capacity is ${TABLE_CAPACITY_MAX}`),
    status: Yup.string()
        .oneOf(TABLE_STATUSES, "Invalid status"),
    isActive: Yup.boolean(),
});

export const getTableInitialValues = (table) => ({
    tableNumber: table?.tableNumber || "",
    zone:        table?.zone        || ZONE_DEFAULT,
    label:       table?.label       || "",
    capacity:    table?.capacity    || 4,
    status:      table?.status      || "available",
    isActive:    table?.isActive    ?? true,
});
