import * as k8s from '@kubernetes/client-node'; 
import { IngressClassDetail, K8sError,  } from '../../../model/typing/root.api';
import { StringMap } from '../../../model/typing/root.shared';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetIngressClassDetail(IngressClass: k8s.V1IngressClass): IngressClassDetail {
    const errors: K8sError[] = [];

    const ingressClass: IngressClassDetail = {
        parameters: {} as StringMap ,//IngressClass.spec?.parameters
        controller: IngressClass.spec?.controller || '',
        objectMeta: {
            name: IngressClass.metadata?.name || '',
            namespace: IngressClass.metadata?.namespace,
            labels: IngressClass.metadata?.labels,
            annotations: IngressClass.metadata?.annotations,
            creationTimestamp: IngressClass.metadata?.creationTimestamp,
            uid: IngressClass.metadata?.uid,
            ownerReferences: IngressClass.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: IngressClass.apiVersion || 'v1',
            kind: IngressClass.kind || 'IngressClass',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return ingressClass as IngressClassDetail

}