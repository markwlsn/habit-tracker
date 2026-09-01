import { RequestHandler } from 'express';
import { supabaseForUser } from '../config';
import { HabitService } from '../services/habit.service';
import { LogService } from '../services/log.service';
import { StreakService } from '../services/streak.service';

function service(req: Parameters<RequestHandler>[0]): HabitService { return new HabitService(supabaseForUser(req.accessToken!)); }
export const createHabit: RequestHandler = async (req, res, next) => { try { res.status(201).json({ data: await service(req).createHabit(req.userId!, req.body) }); } catch (e) { next(e); } };
export const getHabits: RequestHandler = async (req, res, next) => { try { res.json({ data: await service(req).getUserHabits() }); } catch (e) { next(e); } };
export const getHabit: RequestHandler = async (req, res, next) => { try { res.json({ data: await service(req).getHabitById(req.params.id) }); } catch (e) { next(e); } };
export const updateHabit: RequestHandler = async (req, res, next) => { try { res.json({ data: await service(req).updateHabit(req.params.id, req.body) }); } catch (e) { next(e); } };
export const deleteHabit: RequestHandler = async (req, res, next) => { try { await service(req).deleteHabit(req.params.id); res.status(204).send(); } catch (e) { next(e); } };
export const getStreak: RequestHandler = async (req, res, next) => { try { const db = supabaseForUser(req.accessToken!); const habit = await new HabitService(db).getHabitById(req.params.id); const logs = await new LogService(db).getLogsByHabit(habit.id); res.json({ data: new StreakService().getStreakForHabit(habit, logs) }); } catch (e) { next(e); } };
