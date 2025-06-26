import * as k8s from '@kubernetes/client-node'; 
import { Condition, EventList, NamespaceDetail, K8sError, ResourceQuotaDetailList, LimitRange } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetNamespaceDetail(Namespace: k8s.V1Namespace): NamespaceDetail {

    const errors: K8sError[] = [];

    const namespace: NamespaceDetail = {
        phase: Namespace.status?.phase || '',
        resourceQuotaList: {} as ResourceQuotaDetailList, // Not Implemented
        resourceLimits: [] as LimitRange[], // Not Implemented
        eventList: {
            // Not Implemented
        } as EventList ,
        objectMeta: {
            name: Namespace.metadata?.name || '',
            namespace: Namespace.metadata?.namespace,
            labels: Namespace.metadata?.labels,
            annotations: Namespace.metadata?.annotations,
            creationTimestamp: Namespace.metadata?.creationTimestamp,
            uid: Namespace.metadata?.uid,
            ownerReferences: Namespace.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: Namespace.apiVersion || 'v1',
            kind: Namespace.kind || 'Namespace',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return namespace as NamespaceDetail

} 