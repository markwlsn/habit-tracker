import { RequestHandler } from 'express';
import { supabaseForUser } from '../config';
import { AnalyticsService } from '../services/analytics.service';

export const getDashboard: RequestHandler = async (req, res, next) => { try { const startDate = req.query.startDate as string | undefined, endDate = req.query.endDate as string | undefined; const range = startDate && endDate ? { startDate: new Date(`${startDate}T00:00:00.000Z`), endDate: new Date(`${endDate}T00:00:00.000Z`) } : undefined; res.json({ data: await new AnalyticsService(supabaseForUser(req.accessToken!)).getDashboardData(range) }); } catch (e) { next(e); } };
