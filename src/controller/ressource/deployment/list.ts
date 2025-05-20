import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, DeploymentList, Status, Deployment } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)



export function GetDeploymentList(listNamespacedDeployment: k8s.V1DeploymentList): DeploymentList {

    const att_totalItems = listNamespacedDeployment.items.length || 0

    const status: Status = {running: 0, failed: 0, pending: 0, succeeded: 0}
    const deployments: Deployment[] = [];
    
    listNamespacedDeployment.items.forEach(item => {
        // Extracting pod number with fallback to 0 
        const desired = item.status?.replicas || 0;
        const running = item.status?.availableReplicas || 0;
        const pending = Math.max(desired - running, 0);
        const failed = item.status?.unavailableReplicas || 0;
        const succeeded = item.status?.readyReplicas || 0 ;

        deployments.push({
            containerImages: item.spec?.template.spec?.containers.map(c => c.image || '') || [],
            initContainerImages: item.spec?.template.spec?.containers.map(c => c.image || '') || [],
            pods: {
                current: running,
                desired: desired,
                running: running,
                pending: pending,
                failed: failed,
                succeeded: succeeded,
                warnings: [] // fill it later
            },
            objectMeta: {
                name: item.metadata?.name || '',
                namespace: item.metadata?.namespace,
                labels: item.metadata?.labels,
                annotations: item.metadata?.annotations,
                creationTimestamp: item.metadata?.creationTimestamp,
                uid: item.metadata?.uid,
                ownerReferences: item.metadata?.ownerReferences,
            },
            typeMeta: {
                kind: listNamespacedDeployment.kind || '',
                scalable: false,
                restartable: false,
            }
        })
        
        status.running += running
        status.failed += failed
        status.pending += pending
        status.succeeded += succeeded
    })

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        deployments: deployments,
        status: status
    } as DeploymentList

}