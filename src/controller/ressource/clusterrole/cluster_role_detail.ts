import * as k8s from '@kubernetes/client-node'; 
import { ClusterRoleDetail, K8sError, PolicyRule,} from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetClusterRoleDetail(ClusterRole: k8s.V1ClusterRole): ClusterRoleDetail {
    

    const errors: K8sError[] = [];

    const clusterRole: ClusterRoleDetail = {
            rules: ClusterRole.rules?.map(rule => {
                return {
                    verbs: rule.verbs || [],
                    apiGroups: rule.apiGroups || [],
                    resources: rule.resources || [],
                    resourceNames: rule.resourceNames || [],
                    nonResourceURLs: rule.nonResourceURLs || [],
                } as PolicyRule
            }) || [],
            objectMeta: {
                name: ClusterRole.metadata?.name || '',
                namespace: ClusterRole.metadata?.namespace,
                labels: ClusterRole.metadata?.labels,
                annotations: ClusterRole.metadata?.annotations,
                creationTimestamp: ClusterRole.metadata?.creationTimestamp,
                uid: ClusterRole.metadata?.uid,
                ownerReferences: ClusterRole.metadata?.ownerReferences,
            },
            typeMeta: {
                apiVersion: ClusterRole.apiVersion || 'v1',
                kind: ClusterRole.kind || 'ClusterRole',
                scalable: false,
                restartable: false,
            },
            errors: errors,

       }

    return clusterRole as ClusterRoleDetail
}