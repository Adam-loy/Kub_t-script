import * as k8s from '@kubernetes/client-node'; 
import { PodDetail, Metric, Status, Container, PodInfo,
     Condition, ResourceOwner, LocalObjectReference, EventList,
     EnvVar, PersistentVolumeClaimList, PodSecurityContext, K8sError, Resource, 
     EnvVarSource,
     ConfigMapKeyRef,
     SecretKeyRef,
     VolumeMounts,
     ContainerSecurityContext,
     Probe,
     ProbeHttpGet,
     ProbeTcpSocket,
     ProbeExec,
     ResourceRequirements,
     PersistentVolumeClaim,
     Sysctl,
     ObjectMeta,
     TypeMeta} from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetPodDetail(Pod: k8s.V1Pod): PodDetail {
    
    const initContainers: Container[] = Pod.spec?.initContainers?.map( container => {
        return {
            name: container.name || '',
            image: container.image || '',
            env: container.env?.map( envVar => {
                return  {
                    name: envVar.name,
                    value: envVar.value,
                    valueFrom: {
                        configMapKeyRef:  {
                            name: envVar.valueFrom?.configMapKeyRef?.name || '',
                            key: envVar.valueFrom?.configMapKeyRef?.key || '',
                        } as ConfigMapKeyRef,
                        secretKeyRef: {
                            name: envVar.valueFrom?.secretKeyRef?.name || '',
                            key: envVar.valueFrom?.secretKeyRef?.key || ''
                        }as SecretKeyRef,

                    } as EnvVarSource,

                } as EnvVar
            }) || [],
            commands: container.command || [],
            args: container.args || [],
            volumeMounts: container.volumeMounts?.map( volumeMount => {
                return {
                    name: volumeMount.name || '',
                    readOnly: volumeMount.readOnly || false,
                    mountPath: volumeMount.mountPath || '',
                    subPath: volumeMount.subPath || '',
                    volume: {} // resource not found more research if you want
                } as VolumeMounts
            }) || [],
            securityContext: {},
            status: {},
            livenessProbe: {
                httpGet: {
                    path: container.livenessProbe?.httpGet?.path ,
                    port: container.livenessProbe?.httpGet?.port,
                    host: container.livenessProbe?.httpGet?.host,
                    scheme: container.livenessProbe?.httpGet?.scheme,
                    httpHeaders: container.livenessProbe?.httpGet?.httpHeaders
                } as ProbeHttpGet,
                tcpSocket: {
                    port: container.livenessProbe?.tcpSocket?.port,
                    host: container.livenessProbe?.tcpSocket?.host
                } as ProbeTcpSocket,
                exec: {
                    command: container.livenessProbe?.exec?.command
                } as ProbeExec,
                initialDelaySeconds: container.livenessProbe?.initialDelaySeconds,
                timeoutSeconds: container.livenessProbe?.timeoutSeconds,
                periodSeconds: container.livenessProbe?.periodSeconds,
                successThreshold: container.livenessProbe?.successThreshold,
                failureThreshold: container.livenessProbe?.failureThreshold,
                terminationGracePeriodSeconds: container.livenessProbe?.terminationGracePeriodSeconds,
            } as Probe,
            readinessProbe: {
                httpGet: {
                    path: container.readinessProbe?.httpGet?.path ,
                    port: container.readinessProbe?.httpGet?.port,
                    host: container.readinessProbe?.httpGet?.host,
                    scheme: container.readinessProbe?.httpGet?.scheme,
                    httpHeaders: container.readinessProbe?.httpGet?.httpHeaders
                } as ProbeHttpGet,
                tcpSocket: {
                    port: container.readinessProbe?.tcpSocket?.port,
                    host: container.readinessProbe?.tcpSocket?.host
                } as ProbeTcpSocket,
                exec: {
                    command: container.readinessProbe?.exec?.command
                } as ProbeExec,
                initialDelaySeconds: container.readinessProbe?.initialDelaySeconds,
                timeoutSeconds: container.readinessProbe?.timeoutSeconds,
                periodSeconds: container.readinessProbe?.periodSeconds,
                successThreshold: container.readinessProbe?.successThreshold,
                failureThreshold: container.readinessProbe?.failureThreshold,
                terminationGracePeriodSeconds: container.readinessProbe?.terminationGracePeriodSeconds,
            } as Probe,
            startupProbe: {
                httpGet: {
                    path: container.startupProbe?.httpGet?.path ,
                    port: container.startupProbe?.httpGet?.port,
                    host: container.startupProbe?.httpGet?.host,
                    scheme: container.startupProbe?.httpGet?.scheme,
                    httpHeaders: container.startupProbe?.httpGet?.httpHeaders
                } as ProbeHttpGet,
                tcpSocket: {
                    port: container.startupProbe?.tcpSocket?.port,
                    host: container.startupProbe?.tcpSocket?.host
                } as ProbeTcpSocket,
                exec: {
                    command: container.startupProbe?.exec?.command
                } as ProbeExec,
                initialDelaySeconds: container.startupProbe?.initialDelaySeconds,
                timeoutSeconds: container.startupProbe?.timeoutSeconds,
                periodSeconds: container.startupProbe?.periodSeconds,
                successThreshold: container.startupProbe?.successThreshold,
                failureThreshold: container.startupProbe?.failureThreshold,
                terminationGracePeriodSeconds: container.startupProbe?.terminationGracePeriodSeconds,
            } as Probe,
            resources: {
                limits: container.resources?.limits,
                requests: container.resources?.requests
            } as ResourceRequirements

        } as Container 
    }) || []

    const containers: Container[] = Pod.spec?.containers.map( container => {
        return {
            name: container.name || '',
            image: container.image || '',
            env: container.env?.map( envVar => {
                return  {
                    name: envVar.name,
                    value: envVar.value,
                    valueFrom: {
                        configMapKeyRef:  {
                            name: envVar.valueFrom?.configMapKeyRef?.name || '',
                            key: envVar.valueFrom?.configMapKeyRef?.key || '',
                        } as ConfigMapKeyRef,
                        secretKeyRef: {
                            name: envVar.valueFrom?.secretKeyRef?.name || '',
                            key: envVar.valueFrom?.secretKeyRef?.key || ''
                        }as SecretKeyRef,

                    } as EnvVarSource,

                } as EnvVar
            }) || [],
            commands: container.command || [],
            args: container.args || [],
            volumeMounts: container.volumeMounts?.map( volumeMount => {
                return {
                    name: volumeMount.name || '',
                    readOnly: volumeMount.readOnly || false,
                    mountPath: volumeMount.mountPath || '',
                    subPath: volumeMount.subPath || '',
                    volume: {} // resource not found more research if you want
                } as VolumeMounts
            }) || [],
            securityContext: {},
            status: {},
            livenessProbe: {
                httpGet: {
                    path: container.livenessProbe?.httpGet?.path ,
                    port: container.livenessProbe?.httpGet?.port,
                    host: container.livenessProbe?.httpGet?.host,
                    scheme: container.livenessProbe?.httpGet?.scheme,
                    httpHeaders: container.livenessProbe?.httpGet?.httpHeaders
                } as ProbeHttpGet,
                tcpSocket: {
                    port: container.livenessProbe?.tcpSocket?.port,
                    host: container.livenessProbe?.tcpSocket?.host
                } as ProbeTcpSocket,
                exec: {
                    command: container.livenessProbe?.exec?.command
                } as ProbeExec,
                initialDelaySeconds: container.livenessProbe?.initialDelaySeconds,
                timeoutSeconds: container.livenessProbe?.timeoutSeconds,
                periodSeconds: container.livenessProbe?.periodSeconds,
                successThreshold: container.livenessProbe?.successThreshold,
                failureThreshold: container.livenessProbe?.failureThreshold,
                terminationGracePeriodSeconds: container.livenessProbe?.terminationGracePeriodSeconds,
            } as Probe,
            readinessProbe: {
                httpGet: {
                    path: container.readinessProbe?.httpGet?.path ,
                    port: container.readinessProbe?.httpGet?.port,
                    host: container.readinessProbe?.httpGet?.host,
                    scheme: container.readinessProbe?.httpGet?.scheme,
                    httpHeaders: container.readinessProbe?.httpGet?.httpHeaders
                } as ProbeHttpGet,
                tcpSocket: {
                    port: container.readinessProbe?.tcpSocket?.port,
                    host: container.readinessProbe?.tcpSocket?.host
                } as ProbeTcpSocket,
                exec: {
                    command: container.readinessProbe?.exec?.command
                } as ProbeExec,
                initialDelaySeconds: container.readinessProbe?.initialDelaySeconds,
                timeoutSeconds: container.readinessProbe?.timeoutSeconds,
                periodSeconds: container.readinessProbe?.periodSeconds,
                successThreshold: container.readinessProbe?.successThreshold,
                failureThreshold: container.readinessProbe?.failureThreshold,
                terminationGracePeriodSeconds: container.readinessProbe?.terminationGracePeriodSeconds,
            } as Probe,
            startupProbe: {
                httpGet: {
                    path: container.startupProbe?.httpGet?.path ,
                    port: container.startupProbe?.httpGet?.port,
                    host: container.startupProbe?.httpGet?.host,
                    scheme: container.startupProbe?.httpGet?.scheme,
                    httpHeaders: container.startupProbe?.httpGet?.httpHeaders
                } as ProbeHttpGet,
                tcpSocket: {
                    port: container.startupProbe?.tcpSocket?.port,
                    host: container.startupProbe?.tcpSocket?.host
                } as ProbeTcpSocket,
                exec: {
                    command: container.startupProbe?.exec?.command
                } as ProbeExec,
                initialDelaySeconds: container.startupProbe?.initialDelaySeconds,
                timeoutSeconds: container.startupProbe?.timeoutSeconds,
                periodSeconds: container.startupProbe?.periodSeconds,
                successThreshold: container.startupProbe?.successThreshold,
                failureThreshold: container.startupProbe?.failureThreshold,
                terminationGracePeriodSeconds: container.startupProbe?.terminationGracePeriodSeconds,
            } as Probe,
            resources: {
                limits: container.resources?.limits,
                requests: container.resources?.requests
            } as ResourceRequirements

        } as Container 
    }) || []
     
        

    const metrics: Metric[] = [];
    const conditions: Condition[] = Pod.status?.conditions?.map(condition => {
        return {
            type: condition.type || '',
            status: condition.status || '',
            lastProbeTime: condition.lastProbeTime || new Date(),
            lastTransitionTime: condition.lastTransitionTime || new Date(),
            reason: condition.reason || '',
            message: condition.message || '',

        } as Condition
    }) || []

    const ResourceOwner: Resource = {
        objectMeta: {
            name: Pod.metadata?.name || '',
            namespace: Pod.metadata?.namespace,
            labels: Pod.metadata?.labels,
            annotations: Pod.metadata?.annotations,
            creationTimestamp: Pod.metadata?.creationTimestamp,
            uid: Pod.metadata?.uid,
            ownerReferences: Pod.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: Pod.apiVersion || 'v1',
            kind: Pod.kind || 'Pod',
            scalable: false,
            restartable: false,
        },
    }
    const imagePullSecrets: LocalObjectReference[] = Pod.metadata?.ownerReferences?.map( reference => { return { name: reference.name || ''} as LocalObjectReference } ) || [];
    const eventList: EventList = {} as EventList;
    const persistentvolumeclaim: PersistentVolumeClaimList = {
        items: Pod.spec?.volumes?.map(item => { 
        return  {
            status: item.csi?.volumeAttributes?.['status'],
            volume: item.csi?.volumeAttributes?.['volume']
        } as PersistentVolumeClaim 
    }) || {}
    } as PersistentVolumeClaimList;
    const securityContext: PodSecurityContext = {
        fsGroup: Pod.spec?.securityContext?.fsGroup,
        fsGroupChangePolicy: Pod.spec?.securityContext?.fsGroupChangePolicy,
        supplementalGroups: Pod.spec?.securityContext?.supplementalGroups,
        sysctls: Pod.spec?.securityContext?.sysctls?.map(sysctl => {
            return {
                name: sysctl.name,
                value: sysctl.value
            } as Sysctl
        }) 
    };
    const errors: K8sError[] = [];

    const pod: PodDetail = {
            initContainers:  initContainers,
            containers: containers,
            podPhase: Pod.status?.phase || '',
            podIP: Pod.status?.podIP || '',
            nodeName: Pod.spec?.nodeName || '',
            restartCount: 0,
            qosClass: Pod.status?.qosClass || '',
            metrics: metrics,
            conditions: conditions,
            controller: ResourceOwner,
            imagePullSecrets: imagePullSecrets,
            eventList: eventList,
            persistentVolumeClaimList: persistentvolumeclaim,
            securityContext: securityContext,
            serviceAccountName: Pod.spec?.serviceAccount || '',
            objectMeta: {
                name: Pod.metadata?.name || '',
                namespace: Pod.metadata?.namespace,
                labels: Pod.metadata?.labels,
                annotations: Pod.metadata?.annotations,
                creationTimestamp: Pod.metadata?.creationTimestamp,
                uid: Pod.metadata?.uid,
                ownerReferences: Pod.metadata?.ownerReferences,
            } as ObjectMeta,
            typeMeta: {
                apiVersion: Pod.apiVersion || 'v1',
                kind: Pod.kind || 'Pod',
                scalable: false,
                restartable: false,
            } as TypeMeta,
            errors: errors,
       }

    return pod as PodDetail

}