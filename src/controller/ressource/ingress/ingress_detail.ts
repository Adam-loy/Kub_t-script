import * as k8s from '@kubernetes/client-node'; 
import { IngressDetail, K8sError, Endpoint, IngressSpec, IngressBackendService,IngressBackend, ResourceRef, IngressSpecRule, IngressSpecTLS } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetIngressDetail(Ingress: k8s.V1Ingress): IngressDetail {
    const errors: K8sError[] = [];

    const ingress: IngressDetail = {
        endpoints: [
            {
                // Not Completed
            } as Endpoint
        ]as Endpoint[],
        spec: {
            ingressClassName: Ingress.spec?.ingressClassName,
            defaultBackend: {
                service: Ingress.spec?.defaultBackend?.service as IngressBackendService,
                resource: Ingress.spec?.defaultBackend?.resource as ResourceRef
            } as IngressBackend,
            rules: Ingress.spec?.rules as IngressSpecRule[],
            tls: Ingress.spec?.tls as IngressSpecTLS[]
        } as IngressSpec,
        objectMeta: {
            name: Ingress.metadata?.name || '',
            namespace: Ingress.metadata?.namespace,
            labels: Ingress.metadata?.labels,
            annotations: Ingress.metadata?.annotations,
            creationTimestamp: Ingress.metadata?.creationTimestamp,
            uid: Ingress.metadata?.uid,
            ownerReferences: Ingress.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: Ingress.apiVersion || 'v1',
            kind: Ingress.kind || 'Ingress',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return ingress as IngressDetail

}