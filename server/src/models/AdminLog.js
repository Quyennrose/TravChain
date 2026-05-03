import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const AdminLog = mongoose.model('AdminLog', adminLogSchema);
