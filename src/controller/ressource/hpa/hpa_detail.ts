import * as k8s from '@kubernetes/client-node'; 
import { HorizontalPodAutoscalerDetail, K8sError, ScaleTargetRef } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetHorizontalPodAutoscalerDetail(HorizontalPodAutoscaler: k8s.V1HorizontalPodAutoscaler): HorizontalPodAutoscalerDetail {
    const errors: K8sError[] = [];

    const horizontalPodAutoscaler: HorizontalPodAutoscalerDetail = {
        scaleTargetRef: {
            kind: HorizontalPodAutoscaler.spec?.scaleTargetRef.kind || '',
            name: HorizontalPodAutoscaler.spec?.scaleTargetRef.name || ''
        } as ScaleTargetRef, 
        minReplicas: HorizontalPodAutoscaler.spec?.minReplicas || 0,
        maxReplicas: HorizontalPodAutoscaler.spec?.maxReplicas || 0,
        currentCPUUtilization: HorizontalPodAutoscaler.status?.currentCPUUtilizationPercentage || 0,
        currentReplicas: HorizontalPodAutoscaler.status?.currentReplicas || 0,
        desiredReplicas: HorizontalPodAutoscaler.status?.desiredReplicas || 0,
        lastScaleTime: HorizontalPodAutoscaler.status?.lastScaleTime || new Date(),
        objectMeta: {
            name: HorizontalPodAutoscaler.metadata?.name || '',
            namespace: HorizontalPodAutoscaler.metadata?.namespace,
            labels: HorizontalPodAutoscaler.metadata?.labels,
            annotations: HorizontalPodAutoscaler.metadata?.annotations,
            creationTimestamp: HorizontalPodAutoscaler.metadata?.creationTimestamp,
            uid: HorizontalPodAutoscaler.metadata?.uid,
            ownerReferences: HorizontalPodAutoscaler.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: HorizontalPodAutoscaler.apiVersion || 'v1',
            kind: HorizontalPodAutoscaler.kind || 'HorizontalPodAutoscaler',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return horizontalPodAutoscaler as HorizontalPodAutoscalerDetail

}