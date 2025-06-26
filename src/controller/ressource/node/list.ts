import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, NodeList, Node } from '../../../model/typing/root.api';

export function GetNodeList(Nodes: k8s.NodeStatus[]): NodeList {

    const att_totalItems = Nodes.length || 0
    const nodes: Node[] = [];
    Nodes.map(item => {

        const readyCondition = item.Node.status?.conditions?.find(cond => cond.type === "Ready");

        nodes.push({
            ready: readyCondition?.status === 'True' ? 'True' : 'False',
            metrics: {
                cpuCapacity: Number(item.CPU.Capacity),
                cpuLimitTotal: Number(item.CPU.LimitTotal),
                cpuRequestTotal: Number(item.CPU.RequestTotal),
                memoryCapacity: Number(item.Memory.Capacity),
                memoryRequestTotal: Number(item.Memory.RequestTotal),
                memoryTotalRequest: Number(item.Memory.LimitTotal),
            },
            objectMeta: {
                name: item.Node.metadata?.name || '',
                namespace: item.Node.metadata?.namespace,
                labels: item.Node.metadata?.labels,
                annotations: item.Node.metadata?.annotations,
                creationTimestamp: item.Node.metadata?.creationTimestamp,
                uid: item.Node.metadata?.uid,
                ownerReferences: item.Node.metadata?.ownerReferences,
            },
            typeMeta: {
                apiVersion: item.Node.apiVersion || 'v1',
                kind: item.Node.kind ||'Node',
                scalable: false,
                restartable: false,
            }
        })
    });

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        nodes: nodes,
    } as NodeList

}