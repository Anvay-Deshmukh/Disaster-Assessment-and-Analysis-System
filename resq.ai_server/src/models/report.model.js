 import mongoose from 'mongoose';

 const ReportSchema = new mongoose.Schema(
   {
     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     disasterType: { type: String, enum: ['natural', 'manmade', 'accident'], required: true },
     disasterSubType: { type: String, required: true },
     location: { type: String, required: true },
     pincode: { type: String, required: true },
     description: { type: String, required: true },
     urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
     peopleAffected: { type: Number, default: 1 },

     // workflow
     status: { type: String, enum: ['pending', 'live', 'completed', 'cancelled'], default: 'pending', index: true },
     assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
     assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     assignedAt: { type: Date },
     etaMinutes: { type: Number },
     adminNotes: { type: String },
     resolutionNotes: { type: String },
     completedAt: { type: Date },
   },
   { timestamps: true }
 );

 ReportSchema.index({ user: 1, createdAt: -1 });

 const Report = mongoose.model('Report', ReportSchema);
 export default Report;

