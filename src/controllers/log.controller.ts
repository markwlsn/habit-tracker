import { RequestHandler } from 'express';
import { supabaseForUser } from '../config';
import { LogService } from '../services/log.service';

const getService = (req: Parameters<RequestHandler>[0]) => new LogService(supabaseForUser(req.accessToken!));
export const createLog: RequestHandler = async (req, res, next) => { try { const date = req.body.completionDate ? new Date(`${req.body.completionDate}T00:00:00.000Z`) : new Date(); res.status(201).json({ data: await getService(req).createLog(req.userId!, req.body.habitId, date) }); } catch (e) { next(e); } };
export const getLogs: RequestHandler = async (req, res, next) => { try { const startDate = req.query.startDate as string | undefined, endDate = req.query.endDate as string | undefined; const range = startDate && endDate ? { startDate: new Date(`${startDate}T00:00:00.000Z`), endDate: new Date(`${endDate}T00:00:00.000Z`) } : undefined; res.json({ data: await getService(req).getLogsByHabit(req.params.habitId, range) }); } catch (e) { next(e); } };
export const deleteLog: RequestHandler = async (req, res, next) => { try { await getService(req).deleteLog(req.params.id); res.status(204).send(); } catch (e) { next(e); } };
