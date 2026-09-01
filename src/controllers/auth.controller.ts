import { RequestHandler } from 'express';
import { AuthService } from '../services/auth.service';

const auth = new AuthService();
export const register: RequestHandler = async (req, res, next) => { try { res.status(201).json({ data: await auth.register(req.body) }); } catch (e) { next(e); } };
export const login: RequestHandler = async (req, res, next) => { try { res.json({ data: await auth.login(req.body.email, req.body.password) }); } catch (e) { next(e); } };
export const logout: RequestHandler = async (req, res, next) => { try { await auth.logout(req.accessToken!); res.status(204).send(); } catch (e) { next(e); } };
