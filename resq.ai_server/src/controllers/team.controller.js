import Team from '../models/team.model.js';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// Helper function to check team permissions
const checkTeamPermission = (team, userId, role) => {
  if (role === 'admin') return true;
  if (team.leader.toString() === userId.toString()) return true;
  return false;
};

// Create a new team
export const createTeam = catchAsync(async (req, res, next) => {
  // Check if user is admin or has permission to create teams
  if (req.user.role !== 'admin' && req.user.role !== 'rescue') {
    return next(
      new AppError('You do not have permission to create teams', 403)
    );
  }

  // Format the location data for geospatial queries
  const { location } = req.body;
  const formattedLocation = {
    type: 'Point',
    coordinates: location.coordinates || [0, 0],
    address: location.address || '',
    city: location.city || '',
    state: location.state || '',
    pincode: location.pincode || ''
  };

  // Create the team with empty members array
  const teamData = {
    ...req.body,
    location: formattedLocation,
    leader: req.user._id,
    createdBy: req.user._id,
    status: 'active',
    members: [] // Ensure members is initialized as an empty array
  };

  const team = await Team.create(teamData);

  // Add creator as team leader
  if (team) {
    await team.addMember(req.user._id, 'supervisor');
  }

  res.status(201).json({
    status: 'success',
    data: { team }
  });
});

// Get all teams with filtering and pagination
export const getAllTeams = catchAsync(async (req, res, next) => {
  // 1) Filtering
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  // 2) Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
  let query = Team.find(JSON.parse(queryStr));

  // 3) Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // 4) Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // 5) Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  
  const total = await Team.countDocuments();
  
  if (req.query.page) {
    const numTeams = await Team.countDocuments();
    if (skip >= numTeams) throw new Error('This page does not exist');
  }
  
  query = query.skip(skip).limit(limit);
  
  // Execute query
  const teams = await query.populate('leader', 'name email');

  res.status(200).json({
    status: 'success',
    results: teams.length,
    total,
    data: { teams }
  });
});

// Get single team
export const getTeam = catchAsync(async (req, res, next) => {
  const team = await Team.findById(req.params.id)
    .populate('leader', 'name email')
    .populate('members.user', 'name email role')
    .populate('createdBy', 'name email');
  
  if (!team) return next(new AppError('No team found with that ID', 404));
  
  res.status(200).json({
    status: 'success',
    data: { team }
  });
});

// Update team
export const updateTeam = catchAsync(async (req, res, next) => {
  // 1) Check if team exists
  const team = await Team.findById(req.params.id);
  if (!team) return next(new AppError('No team found with that ID', 404));
  
  // 2) Check if user has permission to update
  if (!checkTeamPermission(team, req.user._id, req.user.role)) {
    return next(
      new AppError('You do not have permission to update this team', 403)
    );
  }
  
  // 3) Update team
  const updatedTeam = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    status: 'success',
    data: { team }
  });
});

// Delete team
export const deleteTeam = catchAsync(async (req, res, next) => {
  // 1) Check if team exists
  const team = await Team.findById(req.params.id);
  if (!team) return next(new AppError('No team found with that ID', 404));
  
  // 2) Check if user has permission to delete
  if (req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to delete this team', 403)
    );
  }
  
  // 3) Delete team
  await Team.findByIdAndDelete(req.params.id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Add member to team
export const addTeamMember = catchAsync(async (req, res, next) => {
  const { userId, role = 'member' } = req.body;
  
  // 1) Check if team exists
  const team = await Team.findById(req.params.id);
  if (!team) {
    return next(new AppError('No team found with that ID', 404));
  }
  
  // 2) Check if user has permission to add members
  if (!checkTeamPermission(team, req.user._id, req.user.role)) {
    return next(
      new AppError('You do not have permission to add members to this team', 403)
    );
  }
  
  // 3) Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  // 4) Add member to team
  await team.addMember(userId, role);
  
  res.status(200).json({
    status: 'success',
    message: 'Member added to team successfully'
  });
});

// Remove member from team
export const removeTeamMember = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  // 1) Check if team exists
  const team = await Team.findById(req.params.teamId);
  if (!team) {
    return next(new AppError('No team found with that ID', 404));
  }
  
  // 2) Check if user has permission to remove members
  if (!checkTeamPermission(team, req.user._id, req.user.role)) {
    return next(
      new AppError('You do not have permission to remove members from this team', 403)
    );
  }
  
  // 3) Remove member from team
  await team.removeMember(userId);
  
  res.status(200).json({
    status: 'success',
    message: 'Member removed from team successfully'
  });
});

// Change team leader
export const changeTeamLeader = catchAsync(async (req, res, next) => {
  const { newLeaderId } = req.body;
  
  // 1) Check if team exists
  const team = await Team.findById(req.params.id);
  if (!team) {
    return next(new AppError('No team found with that ID', 404));
  }
  
  // 2) Check if user has permission to change leader
  if (!checkTeamPermission(team, req.user._id, req.user.role)) {
    return next(
      new AppError('You do not have permission to change team leader', 403)
    );
  }
  
  // 3) Change team leader
  await team.changeLeader(newLeaderId);
  
  res.status(200).json({
    status: 'success',
    message: 'Team leader changed successfully'
  });
});

// Get teams by specialization
export const getTeamsBySpecialization = catchAsync(async (req, res, next) => {
  const { specialization } = req.params;
  
  const teams = await Team.findBySpecialization(specialization)
    .populate('leader', 'name email')
    .populate('members.user', 'name email');
    
  res.status(200).json({
    status: 'success',
    results: teams.length,
    data: { teams }
  });
});

// Get teams near location
export const getTeamsNearLocation = catchAsync(async (req, res, next) => {
  const { lng, lat, maxDistance = 10000 } = req.query; // maxDistance in meters
  
  if (!lng || !lat) {
    return next(
      new AppError('Please provide latitude and longitude in the format: lat,lng', 400)
    );
  }
  
  const teams = await Team.findNearLocation(
    [parseFloat(lng), parseFloat(lat)],
    parseInt(maxDistance)
  )
  .populate('leader', 'name email')
  .populate('members.user', 'name email');
  
  res.status(200).json({
    status: 'success',
    results: teams.length,
    data: { teams }
  });
});

// Get teams current user can join (not already a member/leader)
export const getAvailableTeams = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const teams = await Team.find({
    $and: [
      { leader: { $ne: userId } },
      { 'members.user': { $ne: userId } },
      { isActive: true }
    ]
  })
    .sort('-createdAt')
    .populate('leader', 'name email');

  res.status(200).json({
    status: 'success',
    results: teams.length,
    data: { teams }
  });
});

// Join a team (self-service)
export const joinTeam = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const teamId = req.params.id;

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('No team found with that ID', 404));

  // Prevent leader duplication and duplicate membership
  if (team.leader.toString() === userId.toString()) {
    return next(new AppError('You are already the leader of this team', 400));
  }

  const alreadyMember = team.members.some(m => m.user.toString() === userId.toString());
  if (alreadyMember) {
    return next(new AppError('You are already a member of this team', 400));
  }

  // Capacity check via memberCount virtual
  if (team.memberCount >= team.capacity) {
    return next(new AppError('Team has reached maximum capacity', 400));
  }

  await team.addMember(userId, 'member');

  res.status(200).json({
    status: 'success',
    message: 'Joined team successfully'
  });
});

// Leave a team (self-service)
export const leaveTeam = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const teamId = req.params.id;

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('No team found with that ID', 404));

  // Leader cannot leave their own team via self-service
  if (team.leader.toString() === userId.toString()) {
    return next(new AppError('Team leader cannot leave the team. Transfer leadership first.', 400));
  }

  const isMember = team.members.some(m => m.user.toString() === userId.toString());
  if (!isMember) {
    return next(new AppError('You are not a member of this team', 400));
  }

  await team.removeMember(userId);

  res.status(200).json({
    status: 'success',
    message: 'Left team successfully'
  });
});

export default {
  createTeam,
  getAllTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  changeTeamLeader,
  getTeamsBySpecialization,
  getTeamsNearLocation,
  getAvailableTeams,
  joinTeam,
  leaveTeam
};
