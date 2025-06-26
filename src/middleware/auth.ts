import * as k8s from '@kubernetes/client-node';
import fetch from 'node-fetch'
import https from 'node:https';


const kubclient = new k8s.KubeConfig();
kubclient.loadFromDefault()

const currentUser = kubclient.getCurrentUser();
const currentCluster = kubclient.getCurrentCluster();

const agent = new https.Agent({ // globalAgent ??
    // if caData, certData, and keyData are undefined, read the values from the
    // files specified in caFile, cerFile, and keyFile and that's not very practicle
    ca: Buffer.from(currentCluster?.caData ?? '', 'base64').toString('utf8'),
    cert: Buffer.from(currentUser?.certData ?? '', 'base64').toString('utf8'),
    keepAlive: true,
    key: Buffer.from(currentUser?.keyData ?? '', 'base64').toString('utf8'),
});

const opts = {
    headers: {},
    agent: agent,
};

kubclient.applyToHTTPSOptions(opts);

const url = `${kubclient?.getCurrentCluster()?.server}/api/v1/namespace/default/pods`

try {
    const response = await fetch(url, opts);
    const body = await response.text();

    console.log(`statusCode: ${response.status}`);
    console.log(`body: ${body}`);
} catch (err) {
    console.error(`error: ${err}`);
}