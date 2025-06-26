import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { IngressList, Ingress, Endpoint } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetIngressList(listNamespacedIngress: k8s.V1IngressList): IngressList {

    const att_totalItems = listNamespacedIngress.items.length || 0

    const items: Ingress[] = []
    
    listNamespacedIngress.items.map(item => {

        const lbIngresses = item.status?.loadBalancer?.ingress || [];
        const endpoints = lbIngresses.map(ing => ({
            host: ing.hostname || ing.ip || '',
            ports: [
                ...(item.spec?.tls && item.spec.tls.length > 0
                    ? [{ port: 443, name: 'https', protocol: 'TCP' }]
                    : [{ port: 80, name: 'http', protocol: 'TCP' }]
                )
            ],
            objectMeta: {
                name: '',
                namespace: '',
                labels: '',
                annotations: '',
                creationTimestamp: '',
                uid: '',
                ownerReferences: '',
            },
            typeMeta: {
                apiVersion: '',
                kind: '',
                scalable: '',
                restartable: '',
            }
        }) as unknown as Endpoint);

        items.push({
            hosts: (item.spec?.rules || []).map(r => r.host || '').filter(Boolean) ,
            endpoints: endpoints,  //still undetermined
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
                apiVersion: item.apiVersion || 'networking.k8s.io/v1',
                kind: item.kind || 'Ingress',
                scalable: false,
                restartable: false,
            }
        })
    });

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        items: items,
    } as IngressList

}