// apiversion : 'v1'
// kind: Endpoints
import * as k8s from '@kubernetes/client-node'; 
import { Port, EndpointList, Endpoint } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetEndpointList(listNamespacedEndpoint: k8s.V1EndpointsList): EndpointList {

    const att_totalItems = listNamespacedEndpoint.items.length || 0
    const Endpoints: Endpoint[] = []

    listNamespacedEndpoint.items.forEach(item => {
        let ready = false;
        if (item.subsets && item.subsets.length > 0) {
            ready = item.subsets.some(subset =>
                subset.addresses && subset.addresses.length > 0
            );
        }
        const ports = item.subsets
            ? item.subsets.flatMap(subset =>
                subset.ports ? subset.ports.map(port => {
                    return {
                        name: port.name,
                        port: port.port,
                        protocol: port.protocol,
                        nodePort: 0 // Not implemented 
                    }as Port 
                }
            ) : []
            )
            : [];
        Endpoints.push({
            host: item.metadata?.name || '',
            nodeName: item.subsets?.[0]?.addresses?.[0]?.nodeName || '',
            ip: item.subsets?.[0]?.addresses?.[0]?.ip || '',
            ports: ports,
            ready: ready,
            objectMeta: {
                name: item.metadata?.name || '',
                namespace: item.metadata?.namespace,
                labels: item.metadata?.labels,
                annotations: item.metadata?.annotations,
                creationTimestamp: item.metadata?.creationTimestamp,
                uid: item.metadata?.uid,
                ownerReferences: item.metadata?.ownerReferences,
            },
            typeMeta: {
                apiVersion: item.apiVersion || 'Endpoints.k8s.io/v1',
                kind: item.kind || 'EndpointList',
                scalable: false,
                restartable: false,
            }
        })
    });

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        endpoints: Endpoints
    } as EndpointList

}
