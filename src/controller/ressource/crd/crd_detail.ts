import * as k8s from '@kubernetes/client-node'; 
import { CRDDetail, K8sError, CRDNames, CRDVersion, CRDObjectList, Condition } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetCRDDetail(CRD: k8s.V1CustomResourceDefinition): CRDDetail {
    

    const errors: K8sError[] = [];

    const cRD: CRDDetail = {
            version: CRD.metadata?.resourceVersion,
            group: CRD.spec.group,
            scope: CRD.spec.scope,
            names: {
                plural: CRD.spec.names.plural || '',
                singular: CRD.spec.names.singular,
                shortNames: CRD.spec.names.shortNames,
                kind: CRD.spec.names.kind || '',
                listKind: CRD.spec.names.listKind,
                categories: CRD.spec.names.categories
            } as CRDNames,
            versions: CRD.spec.versions.map(version => {
                return {
                    name: version.name,
                    served: version.served,
                    storage: version.storage
                } as CRDVersion
            }) || [],
            objects: {} as CRDObjectList,
            conditions: CRD.status?.conditions?.map( condition => {
                return {
                    type: condition.type || '',
                    status: condition.status || '',
                    lastProbeTime: new Date(), // we need to perform calculation here
                    lastTransitionTime: condition.lastTransitionTime || new Date(),
                    reason: condition.reason || '',
                    message: condition.message || ''
                } as Condition
            }) || [],
            subresources: CRD.metadata?.managedFields?.map( subresource => {
                return subresource.subresource || ''
            }) || [],
            objectMeta: {
                name: CRD.metadata?.name || '',
                namespace: CRD.metadata?.namespace,
                labels: CRD.metadata?.labels,
                annotations: CRD.metadata?.annotations,
                creationTimestamp: CRD.metadata?.creationTimestamp,
                uid: CRD.metadata?.uid,
                ownerReferences: CRD.metadata?.ownerReferences,
            },
            typeMeta: {
                apiVersion: CRD.apiVersion || 'v1',
                kind: CRD.kind || 'CRD',
                scalable: false,
                restartable: false,
            },
            errors: errors,

       }

    return cRD as CRDDetail

}