import * as k8s from '@kubernetes/client-node'; 
import { ClusterRoleBindingDetail, K8sError, Subject,} from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetClusterRoleBindingDetail(ClusterRoleBinding: k8s.V1ClusterRoleBinding): ClusterRoleBindingDetail {
    

    const errors: K8sError[] = [];

    const clusterRoleBinding: ClusterRoleBindingDetail = {
            subjects: ClusterRoleBinding.subjects?.map(subject => {
                return {
                    kind: subject.kind,
                    apiGroup: subject.apiGroup || '',
                    name: subject.name ,
                    namespace: subject.namespace || ''
                } as Subject
            }) || [],
            roleRef:{
                kind: ClusterRoleBinding.kind ||'ClusterRoleBinding', 
                name: ClusterRoleBinding.metadata?.name || '',
                apiGroup: '' , // not yet 
            },
            objectMeta: {
                name: ClusterRoleBinding.metadata?.name || '',
                namespace: ClusterRoleBinding.metadata?.namespace,
                labels: ClusterRoleBinding.metadata?.labels,
                annotations: ClusterRoleBinding.metadata?.annotations,
                creationTimestamp: ClusterRoleBinding.metadata?.creationTimestamp,
                uid: ClusterRoleBinding.metadata?.uid,
                ownerReferences: ClusterRoleBinding.metadata?.ownerReferences,
            },
            typeMeta: {
                apiVersion: ClusterRoleBinding.apiVersion || 'v1',
                kind: ClusterRoleBinding.kind || 'ClusterRoleBinding',
                scalable: false,
                restartable: false,
            },
            errors: errors,

       }

    return clusterRoleBinding as ClusterRoleBindingDetail

}