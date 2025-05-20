import { Request, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import {ScrapData} from './../controller/map-view.controller.js'

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)
// Note: if we gone to work with aws i think all of this need to be changed 

// Create a Kubernetes API client
const k8sApi = kubeclient.makeApiClient(k8s.CoreV1Api);

import express from 'express';

export const testing_router = express.Router();

async function handleGetNamespaces(req: Request, res: Response): Promise<void> {
        try {
            const namespaceList: k8s.V1NamespaceList = await k8sApi.listNamespace(); 

            // Retreiving the names of all namespaces
            const namesspaces: string[] = namespaceList.items.map((namespace) => {
                return namespace.metadata?.name || '';
            });
            res.status(200).json(namesspaces);
        } catch(err: any) {
            //console.log(`Error retreving namespaces ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'})
        }

    }
async function handleGetScrap(req: Request, res: Response): Promise<void> {
        try {

            res.status(200).json(await ScrapData(req.params.namespace));
        } catch(err: any) {
            //console.log(`Error retreving namespaces ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'})
        }

    }

testing_router.get("/v1/namespace",handleGetNamespaces);

testing_router.get("/v1/scrape/:namespace",handleGetScrap);
