import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    reporter: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      phone: String,
      email: String
    },
    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
      }
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: {
      type: String,
      enum: ['new', 'assigned', 'accepted', 'cancelled', 'completed'],
      default: 'new'
    },
    assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    etaMinutes: { type: Number },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelReason: { type: String }
  },
  { timestamps: true }
);

incidentSchema.index({ 'location.coordinates': '2dsphere' });

const Incident = mongoose.model('Incident', incidentSchema);
export default Incident;


