import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { HorizontalPodAutoscalerList, ObjectMeta, HorizontalPodAutoscaler } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetHorizontalPodAutoscalerList(listNamespacedHorizontalPodAutoscaler: k8s.V1HorizontalPodAutoscalerList): HorizontalPodAutoscalerList {

    const att_totalItems = listNamespacedHorizontalPodAutoscaler.items.length || 0
    
    const hpa: HorizontalPodAutoscaler[] = []
    listNamespacedHorizontalPodAutoscaler.items.forEach(item => {
        hpa.push({
            scaleTargetRef: {
                kind: item.spec?.scaleTargetRef.kind || '',
                name: item.spec?.scaleTargetRef.name || ''
            },
            minReplicas: item.spec?.minReplicas || 0,
            maxReplicas: item.spec?.maxReplicas || 0,
            currentCPUUtilization: item.status?.currentCPUUtilizationPercentage || 0,
            targetCPUUtilization: item.spec?.targetCPUUtilizationPercentage || 0,
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
                apiVersion: item.apiVersion || 'autoscaling/v2',
                kind: item.apiVersion || 'HorizontalPodAutoscaler',
                scalable: false,
                restartable: false,
            }
        })
    });

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        horizontalpodautoscalers: hpa,
    } as HorizontalPodAutoscalerList

}