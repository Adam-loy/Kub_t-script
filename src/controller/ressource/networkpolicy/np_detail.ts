import * as k8s from '@kubernetes/client-node'; 
import { EventList, NetworkPolicyDetail, K8sError, LabelSelector } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetNetworkPolicyDetail(NetworkPolicy: k8s.V1NetworkPolicy): NetworkPolicyDetail {

    const errors: K8sError[] = [];

    const networkPolicy: NetworkPolicyDetail = {
        podSelector: {
            matchLabels: NetworkPolicy.spec?.podSelector.matchLabels
        } as LabelSelector,
        ingress: NetworkPolicy.spec?.ingress, 
        egress: NetworkPolicy.spec?.egress,
        policyTypes: NetworkPolicy.spec?.policyTypes,
        objectMeta: {
            name: NetworkPolicy.metadata?.name || '',
            namespace: NetworkPolicy.metadata?.namespace,
            labels: NetworkPolicy.metadata?.labels,
            annotations: NetworkPolicy.metadata?.annotations,
            creationTimestamp: NetworkPolicy.metadata?.creationTimestamp,
            uid: NetworkPolicy.metadata?.uid,
            ownerReferences: NetworkPolicy.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: NetworkPolicy.apiVersion || 'v1',
            kind: NetworkPolicy.kind || 'NetworkPolicy',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return networkPolicy as NetworkPolicyDetail

} 