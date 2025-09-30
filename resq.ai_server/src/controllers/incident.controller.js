import Incident from '../models/incident.model.js';
import Team from '../models/team.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// Create incident (citizen or any authenticated user)
export const createIncident = catchAsync(async (req, res, next) => {
  const body = req.body || {};

  const incident = await Incident.create({
    title: body.title || 'Emergency Report',
    description: body.description,
    reporter: {
      user: req.user?._id,
      name: body.reporter?.name,
      phone: body.reporter?.phone,
      email: body.reporter?.email
    },
    location: body.location,
    priority: body.priority || 'high'
  });

  res.status(201).json({ status: 'success', data: { incident } });
});

// List incidents
export const listIncidents = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.user.role === 'rescue') {
    // Rescue sees all new/assigned to their teams
    filter.$or = [
      { status: 'new' },
      { assignedTeam: { $exists: true } }
    ];
  }
  const incidents = await Incident.find(filter)
    .sort('-createdAt')
    .populate('assignedTeam', 'name leader')
    .populate('acceptedBy', 'name leader');
  res.status(200).json({ status: 'success', results: incidents.length, data: { incidents } });
});

// Assign team (admin)
export const assignTeam = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin') return next(new AppError('Only admin can assign', 403));
  const { incidentId } = req.params;
  const { teamId, etaMinutes } = req.body;

  const team = await Team.findById(teamId);
  if (!team) return next(new AppError('Team not found', 404));

  const incident = await Incident.findByIdAndUpdate(
    incidentId,
    { assignedTeam: teamId, status: 'assigned', etaMinutes },
    { new: true }
  );
  if (!incident) return next(new AppError('Incident not found', 404));

  res.status(200).json({ status: 'success', data: { incident } });
});

// Accept incident (rescue team leader/member)
export const acceptIncident = catchAsync(async (req, res, next) => {
  const { incidentId } = req.params;
  const { teamId, etaMinutes } = req.body;
  const incident = await Incident.findById(incidentId);
  if (!incident) return next(new AppError('Incident not found', 404));

  // mark accepted
  incident.status = 'accepted';
  incident.acceptedBy = teamId || incident.assignedTeam;
  if (etaMinutes) incident.etaMinutes = etaMinutes;
  await incident.save();

  res.status(200).json({ status: 'success', data: { incident } });
});

// Cancel incident (admin)
export const cancelIncident = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin') return next(new AppError('Only admin can cancel', 403));
  const { incidentId } = req.params;
  const { reason } = req.body;
  const incident = await Incident.findByIdAndUpdate(
    incidentId,
    { status: 'cancelled', cancelReason: reason, cancelledBy: req.user._id },
    { new: true }
  );
  if (!incident) return next(new AppError('Incident not found', 404));
  res.status(200).json({ status: 'success', data: { incident } });
});

// Get single incident (for reporter polling)
export const getIncident = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const incident = await Incident.findById(id)
    .populate({ path: 'acceptedBy', select: 'name leader', populate: { path: 'leader', select: 'name email' } })
    .populate({ path: 'assignedTeam', select: 'name leader', populate: { path: 'leader', select: 'name email' } });
  if (!incident) return next(new AppError('Incident not found', 404));
  res.status(200).json({ status: 'success', data: { incident } });
});

export default { createIncident, listIncidents, assignTeam, acceptIncident, cancelIncident, getIncident };


