import * as k8s from '@kubernetes/client-node'; 
import { DeploymentDetail, K8sError, Label, DeploymentInfo, Condition, RollingUpdateStrategy, EventList } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetDeploymentDetail(Deployment: k8s.V1Deployment): DeploymentDetail {
    const errors: K8sError[] = [];

    const deployment: DeploymentDetail = {
            selector: Deployment.spec?.selector.matchExpressions?.map(matchExpression => {
                return {
                    key: matchExpression.key || '',
                    value: matchExpression.values || ''
                } as Label
            }) ||[],
            statusInfo: {
                replicas: Deployment.status?.replicas || 0,
                updated: Deployment.status?.updatedReplicas || 0,
                available: Deployment.status?.availableReplicas || 0,
                unavailable: Deployment.status?.unavailableReplicas || 0
            } as DeploymentInfo,
            conditions: Deployment.status?.conditions?.map(condition => {
                return {
                    type: condition.type || '',
                    status: condition.status || '',
                    lastProbeTime: condition.lastUpdateTime || new Date(),
                    lastTransitionTime: condition.lastTransitionTime || new Date(),
                    reason: condition.reason || '',
                    message: condition.message || ''
                } as Condition
            }) || [],
            strategy: Deployment.spec?.strategy?.type || '',
            minReadySeconds: Deployment.spec?.minReadySeconds || 0,
            revisionHistoryLimit: Deployment.spec?.revisionHistoryLimit || 0,
            rollingUpdateStrategy: {
                maxSurge: Number(Deployment.spec?.strategy?.rollingUpdate?.maxSurge) || 0,
                maxUnavailable: Number(Deployment.spec?.strategy?.rollingUpdate?.maxUnavailable) || 0
            } as RollingUpdateStrategy,
            events: {} as EventList, // Not Completed
            objectMeta: {
                name: Deployment.metadata?.name || '',
                namespace: Deployment.metadata?.namespace,
                labels: Deployment.metadata?.labels,
                annotations: Deployment.metadata?.annotations,
                creationTimestamp: Deployment.metadata?.creationTimestamp,
                uid: Deployment.metadata?.uid,
                ownerReferences: Deployment.metadata?.ownerReferences,
            },
            typeMeta: {
                apiVersion: Deployment.apiVersion || 'v1',
                kind: Deployment.kind || 'Deployment',
                scalable: false,
                restartable: false,
            },
            errors: errors,

       }

    return deployment as DeploymentDetail

}