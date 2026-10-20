import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: [true, "Organization ID is required"],
      index: true,
    },
    clerkId: {
      type: String,
      index: true,
      default: null,
    },
    role: {
      type: String,
      enum: ["org:admin", "org:member"],
      default: "org:member",
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      default: "General",
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Contract", "Intern"],
      default: "Full-Time",
    },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Probation", "Inactive", "Terminated"],
      default: "Active",
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      default: "Male",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    currentAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    permanentAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "India" },
      sameAsCurrent: { type: Boolean, default: false },
    },
    documents: {
      aadhar: {
        number: { type: String, default: "" },
        frontUrl: { type: String, default: "" },
        backUrl: { type: String, default: "" },
      },
      pan: {
        number: { type: String, default: "" },
        fileUrl: { type: String, default: "" },
      },
    },
    bankDetails: {
      accountHolderName: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      branchName: { type: String, default: "" },
      upiId: { type: String, default: "" },
    },
    emergencyContact: {
      name: { type: String, default: "" },
      relation: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

EmployeeSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

EmployeeSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true });
EmployeeSchema.index({ organizationId: 1, email: 1 });
export const Employee =
  mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

export default Employee;
