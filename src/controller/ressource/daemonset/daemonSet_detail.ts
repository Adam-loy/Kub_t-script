import * as k8s from '@kubernetes/client-node'; 
import { DaemonSetDetail, K8sError, Condition, PodInfo } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetDaemonSetDetail(DaemonSet: k8s.V1DaemonSet): DaemonSetDetail {
    const errors: K8sError[] = [];

    const daemonSet: DaemonSetDetail = {
            labelSelector: DaemonSet.spec?.selector.matchLabels || {},
            containerImages: DaemonSet.spec?.template.spec?.containers.map(container => {
                return container.image || ''
            }) || [],
            initContainerImages: [], // Not completed
            podInfo:{
                 // Not completed
            } as PodInfo,
            objectMeta: {
                name: DaemonSet.metadata?.name || '',
                namespace: DaemonSet.metadata?.namespace,
                labels: DaemonSet.metadata?.labels,
                annotations: DaemonSet.metadata?.annotations,
                creationTimestamp: DaemonSet.metadata?.creationTimestamp,
                uid: DaemonSet.metadata?.uid,
                ownerReferences: DaemonSet.metadata?.ownerReferences,
            },
            typeMeta: {
                apiVersion: DaemonSet.apiVersion || 'v1',
                kind: DaemonSet.kind || 'DaemonSet',
                scalable: false,
                restartable: false,
            },
            errors: errors,

       }

    return daemonSet as DaemonSetDetail

}