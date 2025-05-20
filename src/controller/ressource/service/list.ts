import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ServiceList, ObjectMeta, Service, Endpoint } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetServiceList(listNamespacedService: k8s.V1ServiceList): ServiceList {

    const att_totalItems = listNamespacedService.items.length || 0
    const services: Service[] = []
    const externalEndpoints: Endpoint[] = [];

    listNamespacedService.items.forEach(item => {
        
        if (item.status?.loadBalancer?.ingress) {
            item.status.loadBalancer.ingress.forEach(ingress => {
              externalEndpoints.push({
                host: ingress.hostname || ingress.ip || '',
                nodeName: undefined,
                ready: true,
                ports: (item.spec?.ports || []).map(p => ({
                  port: p.port || 0,
                  name: p.name || '',
                  protocol: p.protocol || '',
                  nodePort: p.nodePort,
                })),
              });
            });
          }
          
          // For ExternalName type services:
          if (item.spec?.type === 'ExternalName' && item.spec.externalName) {
            externalEndpoints.push({
              host: item.spec.externalName,
              nodeName: undefined,
              ready: true,
              ports: (item.spec?.ports || []).map(p => ({
                port: p.port || 0,
                name: p.name || '',
                protocol: p.protocol || '',
                nodePort: p.nodePort,
              })),
            });
          }
        services.push({
            internalEndpoint: {
                host: item.spec?.clusterIP || '',
                nodeName: item.spec?.externalName,
                ready: item.status?.loadBalancer?.ingress?.length! > 0 || false,
                ports: (item.spec?.ports || []).map(p => ({
                    port: p.port || 0,
                    name: p.name || '',
                    protocol: p.protocol || '',
                    nodePort: p.nodePort
                })) 
            },
            externalEndpoints: externalEndpoints,
            selector: item.spec?.selector || {},
            type: item.spec?.type || '',
            clusterIP: item.spec?.clusterIP || '',
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
                kind: listNamespacedService.kind || '',
                scalable: false,
                restartable: false,
            }
        })
    });



    return {
        listMeta: {
            totalItems: att_totalItems
        },
        services: services,
    } as ServiceList

}