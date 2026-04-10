import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

/* =====================================================
   Sub Schemas
===================================================== */

const QualificationSchema = new Schema(
  {
    degree: {
      type: String,
      required: true,
    },
    fieldOfStudy: {
      type: String,
    },
    university: {
      type: String,
      required: true,
    },
    collegeName: {
      type: String,
    },
    yearOfCompletion: {
      type: Number,
      min: 1950,
      validate: {
        validator: function (value: number) {
          return value <= new Date().getFullYear();
        },
        message: "Year of completion cannot be in the future.",
      },
    },
    country: {
      type: String,
    },
  },
  { _id: false },
);

const ClinicSchema = new Schema(
  {
    clinicName: {
      type: String,
      required: true,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
    },
    landmark: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    facilities: [
      {
        type: String,
      },
    ],
    consultationMode: {
      type: String,
      enum: ["Offline", "Online", "Both"],
      default: "Offline",
    },
  },
  { _id: false },
);

/* =====================================================
   Main Doctor Profile Schema
===================================================== */

const DoctorProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },

    basicInfo: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
      },
      dateOfBirth: {
        type: Date,
      },
      profileImageUrl: {
        type: String,
      },
      profileImagePublicId: {
        type: String,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
      alternatePhoneNumber: {
        type: String,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
      bloodGroup: {
        type: String,
      },
      languagesSpoken: [
        {
          type: String,
        },
      ],
      nationality: {
        type: String,
      },
    },

    professionalInfo: {
      specialization: {
        type: String,
      },
      superSpecialization: {
        type: String,
      },
      totalExperience: {
        type: Number,
        min: 0,
      },
      medicalRegistrationNumber: {
        type: String,
      },
      medicalCouncil: {
        type: String,
      },
      consultationFee: {
        type: Number,
        min: 0,
      },
      emergencyFee: {
        type: Number,
        min: 0,
      },
      aboutDoctor: {
        type: String,
      },
      servicesOffered: [
        {
          type: String,
        },
      ],
      awards: [
        {
          type: String,
        },
      ],
      memberships: [
        {
          type: String,
        },
      ],
    },

    qualifications: [QualificationSchema],

    clinics: [ClinicSchema],

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isProfileCompleted: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

/* =====================================================
   Infer Type Automatically
===================================================== */

export type IDoctorProfile = InferSchemaType<typeof DoctorProfileSchema>;

/* =====================================================
   Prevent Model Overwrite (Hot Reload Safe)
===================================================== */

export const DoctorProfile: Model<IDoctorProfile> =
  mongoose.models.DoctorProfile ||
  mongoose.model<IDoctorProfile>("DoctorProfile", DoctorProfileSchema);
