import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  departmentName: string;
  departmentDescription: string;
  departmentImage: string;
  imagePublicId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalDoctors: number;
  totalPatients: number;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    departmentName: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    departmentDescription: {
      type: String,
      required: [true, 'Department description is required'],
      trim: true,
    },
    departmentImage: {
      type: String,
      required: [true, 'Department image is required'], // Using cloudinary URL
    },
    imagePublicId: {
      type: String, // Kept to safely delete image from Cloudinary on edit/delete
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    totalDoctors: {
      type: Number,
      default: 0,
    },
    totalPatients: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Optimize queries
DepartmentSchema.index({ status: 1 });
DepartmentSchema.index({ departmentName: 1 });

const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;
