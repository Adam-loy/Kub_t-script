import * as k8s from '@kubernetes/client-node'; 
import { NodeAllocatedResources, NodeDetail, K8sError, LabelSelector, NodeInfo, NodeAddress, NodeTaint, Metric, Condition, PodList, EventList } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetNodeDetail(Node: k8s.V1Node): NodeDetail {

    const errors: K8sError[] = [];

    const node: NodeDetail = {
        phase: Node.status?.phase || '',
        podCIDR: Node.spec?.podCIDR || '',
        providerID: Node.spec?.providerID || '',
        unschedulable: Node.spec?.unschedulable || false,
        allocatedResources: {
            // Not Implemented
        } as NodeAllocatedResources,
        nodeInfo: {
            machineID: Node.status?.nodeInfo?.machineID || '',
            systemUUID: Node.status?.nodeInfo?.systemUUID || '',
            bootID: Node.status?.nodeInfo?.bootID || '',
            kernelVersion: Node.status?.nodeInfo?.kernelVersion || '',
            osImage: Node.status?.nodeInfo?.osImage || '',
            containerRuntimeVersion: Node.status?.nodeInfo?.containerRuntimeVersion || '',
            kubeletVersion: Node.status?.nodeInfo?.kubeletVersion || '',
            kubeProxyVersion: Node.status?.nodeInfo?.kubeProxyVersion || '',
            operatingSystem: Node.status?.nodeInfo?.operatingSystem || '',
            architecture: Node.status?.nodeInfo?.architecture || '',
        } as NodeInfo,
        containerImages: [], // Not Implemented
        initContainerImages: [], // Not Implemented
        addresses: Node.status?.addresses?.map( address => {
            return address || {} as  NodeAddress
        }) || [],
        taints: Node.spec?.taints?.map( taint =>  {
            return {
                key: taint.key || '',
                value: taint.value || '',
                effect: taint.value || '',
                timeAdded: taint.timeAdded || 0
            } as NodeTaint
        }) || [],
        metrics: []  as Metric[], // Not Implemented
        conditions: Node.status?.conditions as Condition[], 
        podList: {} as PodList, // Not Implemented
        eventList: {} as EventList, // Not Implemented
        objectMeta: {
            name: Node.metadata?.name || '',
            namespace: Node.metadata?.namespace,
            labels: Node.metadata?.labels,
            annotations: Node.metadata?.annotations,
            creationTimestamp: Node.metadata?.creationTimestamp,
            uid: Node.metadata?.uid,
            ownerReferences: Node.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: Node.apiVersion || 'v1',
            kind: Node.kind || 'Node',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return node as NodeDetail

} 