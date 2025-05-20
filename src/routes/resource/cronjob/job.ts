import * as k8s from '@kubernetes/client-node';

export async function triggerCronJob(
    client: k8s.KubeConfig,
    namespace: string,
    name: string
): Promise<Error | null>{

    const batchV1Api = client.makeApiClient(k8s.BatchV1Api);
    try {
    const CronJob_req:k8s.BatchV1ApiReadNamespacedCronJobRequest = {namespace: namespace, name:name}

    // Fetch Cronjob Detail
    const CronJob = batchV1Api.readNamespacedCronJob(CronJob_req);

    // Prepare annotations
    const annotations: { [key: string]: string} = {
        'cronjob.kubernetes.io/instantiate': 'manual',
    };

    const Fetched_CronJob = await CronJob

    // Prepare labels
    const labels: { [key: string]: string} = {};
    if (Fetched_CronJob.spec?.jobTemplate.metadata?.labels) {
        Object.entries(Fetched_CronJob.spec?.jobTemplate.metadata?.labels).forEach(([key, value]) => {
            labels[key] = value;
        });
    }

    // Generating new job name (limit to 52 characters)
    const randomString = Math.random().toString(36).substring(2,5); // Generate a 3-character random string
    let newJobName: string;
    if (Fetched_CronJob.metadata?.name && Fetched_CronJob.metadata.name.length < 42) {
        newJobName = `${Fetched_CronJob.metadata.name}-manual-${randomString}`;
    } else {
        newJobName = `${Fetched_CronJob.metadata?.name?.substring(0,41)}-manual-${randomString}`
    }

    // Create the Job Object
    const JobToCreate: k8s.V1Job = {
        metadata: {
            name: newJobName,
            namespace,
            annotations,
            labels,
            ownerReferences: [
                {
                    apiVersion: 'v1',
                    kind: 'CronJob',
                    name: Fetched_CronJob.metadata!.name!,
                    uid: Fetched_CronJob.metadata!.uid!,
                    controller: true,
                    blockOwnerDeletion: true,
                },
            ],
        },
        spec: Fetched_CronJob.spec?.jobTemplate.spec,
    };

        // Create the Job in the namespace
        const JobCreation_req: k8s.BatchV1ApiCreateNamespacedJobRequest = {namespace: namespace, body: JobToCreate }
        
        await batchV1Api.createNamespacedJob(JobCreation_req);

        //console.log(`Job ${newJobName} created successfully.`);

        return null;

    } catch (error) {
        console.error('Error triggering CronJob:', error);
        return error as Error;
    }
}   