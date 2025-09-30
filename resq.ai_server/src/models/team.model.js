import mongoose from 'mongoose';

// Team Model
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: props => `${props.value} is not a valid coordinate pair [longitude, latitude]`
      }
    },
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  specialization: [{
    type: String,
    enum: ['medical', 'evacuation', 'fire', 'flood', 'earthquake', 'rescue', 'other']
  }],
  contact: {
    phone: String,
    email: String,
    emergencyContact: String
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: {
    type: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['member', 'supervisor'],
        default: 'member'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_mission'],
    default: 'active'
  },
  capacity: {
    type: Number,
    min: 1,
    default: 10
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for better query performance
teamSchema.index({ location: '2dsphere' });

// Virtual for member count (includes leader)
teamSchema.virtual('memberCount').get(function() {
  const membersCount = Array.isArray(this.members) ? this.members.length : 0;
  return membersCount + 1; // +1 for the leader
});

// Pre-save hook to handle timestamps
teamSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

// Method to add a member to the team
teamSchema.methods.addMember = async function(userId, role = 'member') {
  // Check if user is already a member
  const isMember = this.members.some(member => 
    member.user.toString() === userId.toString()
  );
  
  if (isMember) {
    throw new Error('User is already a member of this team');
  }
  
  // Check capacity
  if (this.memberCount >= this.capacity) {
    throw new Error('Team has reached maximum capacity');
  }
  
  this.members.push({
    user: userId,
    role
  });
  
  return this.save();
};

// Method to remove a member from the team
teamSchema.methods.removeMember = async function(userId) {
  const initialLength = this.members.length;
  this.members = this.members.filter(
    member => member.user.toString() !== userId.toString()
  );
  
  if (this.members.length === initialLength) {
    throw new Error('User is not a member of this team');
  }
  
  return this.save();
};

// Method to change team leader
teamSchema.methods.changeLeader = async function(newLeaderId) {
  if (this.leader.toString() === newLeaderId.toString()) {
    throw new Error('User is already the team leader');
  }
  
  // Find the member to promote to leader
  const newLeader = this.members.find(
    member => member.user.toString() === newLeaderId.toString()
  );
  
  if (!newLeader) {
    throw new Error('User is not a member of this team');
  }
  
  // Add current leader to members
  this.members.push({
    user: this.leader,
    role: 'member'
  });
  
  // Remove new leader from members
  this.members = this.members.filter(
    member => member.user.toString() !== newLeaderId.toString()
  );
  
  // Set new leader
  this.leader = newLeaderId;
  
  return this.save();
};

// Static method to find teams by specialization
teamSchema.statics.findBySpecialization = function(specialization) {
  return this.find({ specialization });
};

// Static method to find teams near a location
teamSchema.statics.findNearLocation = function(coordinates, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: maxDistance // in meters
      }
    },
    isActive: true
  });
};

const Team = mongoose.model('Team', teamSchema);

export default Team;