import { Request, Response } from 'express';

import { Config, args } from "../../config/web_config.js";
import { getUserAgent, getVersion } from "../../config/web_env.js";
import { SystemBanner, toSystemBannerSeverity } from '../../model/systembanner/systembanner.js';



export function handleGetConfig(req: Request, res: Response) {
    const config: Config = {
      serverTime: Date.now(),
      userAgent: getUserAgent(),
      version: getVersion(),    
    };
  
    res.status(200).json(config);
}

export async function handleGetSystemBanner(req: Request, res: Response): Promise<void>{
    try {
        const systemBanner: SystemBanner = {
            message : "System maintenance scheduled for tonight" ,//args.getSystemBanner(),
            severity: "INFO" //toSystemBannerSeverity(args.getSystemBannerSeverity())
        };
        res.status(200).json(systemBanner);
    } catch(err: any){
        console.log(`Error fetching Events ${err}`);
        res.status(500).send({error: err.message || 'Internal Server Error'});
    }
}
