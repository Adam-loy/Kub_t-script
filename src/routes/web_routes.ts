import express from 'express';
import { handleGetConfig , handleGetSystemBanner } from './web_handler/handler.js';


export const web_router = express.Router();


web_router.get('/config', handleGetConfig)
web_router.get('/systembanner', handleGetSystemBanner)