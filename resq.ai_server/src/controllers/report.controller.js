 import Report from '../models/report.model.js';
 import AppError from '../utils/appError.js';

 export const createReport = async (req, res, next) => {
   try {
     const data = {
       user: req.user._id,
       disasterType: req.body.disasterType,
       disasterSubType: req.body.disasterSubType,
       location: req.body.location,
       pincode: req.body.pincode,
       description: req.body.description,
       urgency: req.body.urgency || 'medium',
       peopleAffected: req.body.peopleAffected || 1,
     };

     const report = await Report.create(data);
     res.status(201).json({ success: true, data: { report } });
   } catch (err) {
     next(err);
   }
 };

 // Admin: get all, User: get own
 export const getReports = async (req, res, next) => {
   try {
     const { status } = req.query;
     const filter = {};
     if (status) filter.status = status;

     if (req.user.role !== 'admin') {
       filter.user = req.user._id;
     }

     const reports = await Report.find(filter)
       .sort({ createdAt: -1 })
       .populate('assignedTeam', 'name location state')
       .populate('assignedBy', 'name email')
       .populate('user', 'name email');

     res.json({ success: true, data: { reports } });
   } catch (err) {
     next(err);
   }
 };

 export const getReportById = async (req, res, next) => {
   try {
     const report = await Report.findById(req.params.id)
       .populate('assignedTeam', 'name location state')
       .populate('assignedBy', 'name email')
       .populate('user', 'name email');
     if (!report) return next(new AppError('Report not found', 404));

     if (req.user.role !== 'admin' && report.user.toString() !== req.user._id.toString()) {
       return next(new AppError('Not authorized to view this report', 403));
     }

     res.json({ success: true, data: { report } });
   } catch (err) {
     next(err);
   }
 };

 export const assignReport = async (req, res, next) => {
   try {
     const { teamId, etaMinutes, adminNotes } = req.body;
     const report = await Report.findById(req.params.id);
     if (!report) return next(new AppError('Report not found', 404));

     report.assignedTeam = teamId || null;
     report.assignedBy = req.user._id;
     report.assignedAt = new Date();
     report.etaMinutes = etaMinutes;
     if (adminNotes !== undefined) report.adminNotes = adminNotes;
     report.status = 'live';
     await report.save();

     const populated = await Report.findById(report._id)
       .populate('assignedTeam', 'name location state')
       .populate('assignedBy', 'name email')
       .populate('user', 'name email');

     res.json({ success: true, data: { report: populated } });
   } catch (err) {
     next(err);
   }
 };

 export const updateReportStatus = async (req, res, next) => {
   try {
     const { status, resolutionNotes } = req.body;
     const allowed = ['pending', 'live', 'completed', 'cancelled'];
     if (!allowed.includes(status)) {
       return next(new AppError('Invalid status', 400));
     }

     const report = await Report.findById(req.params.id);
     if (!report) return next(new AppError('Report not found', 404));

     report.status = status;
     if (resolutionNotes !== undefined) report.resolutionNotes = resolutionNotes;
     if (status === 'completed') report.completedAt = new Date();
     await report.save();

     const populated = await Report.findById(report._id)
       .populate('assignedTeam', 'name location state')
       .populate('assignedBy', 'name email')
       .populate('user', 'name email');

     res.json({ success: true, data: { report: populated } });
   } catch (err) {
     next(err);
   }
 };

