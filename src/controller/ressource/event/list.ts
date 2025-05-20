import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, EventList, Event } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetEventList(listNamespacedEvent: k8s.CoreV1EventList): EventList {

    const att_totalItems = listNamespacedEvent.items.length || 0
    const events: Event[] = []

    listNamespacedEvent.items.forEach(item => {
        events.push({
            message: item.message || '',
            sourceComponent: item.source?.component || '',
            sourceHost: item.source?.host || '',
            object: '', // Fix
            objectName: item.involvedObject.name || '',
            objectKind: item.involvedObject.kind || '',
            count: item.count || 0,
            firstSeen: item.firstTimestamp || new Date() ,
            lastSeen: item.lastTimestamp || new Date(),
            reason: item.reason || '',
            type: item.type ||'',
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
                kind: listNamespacedEvent.kind || '',
                scalable: false,
                restartable: false,
            }
        })
    });

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        events: events,
    } as EventList

}