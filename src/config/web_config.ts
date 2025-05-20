import yargs from "yargs";
import {hideBin} from "yargs/helpers"

export interface Config {
  serverTime: number;
  userAgent: string;
  version: string;
}


const argv = yargs(hideBin(process.argv))
.options({
    "auto-generate-certificates": {
        type: "boolean",
        default: false,
        describe: "Enables automatic certificates generation used to serve Https",
    },
    "insecure-port": {
        type: "number",
        default: 8000,
        describe: "Port to listen to for incoming HTTP requests",
      },
      port: {
        type: "number",
        default: 8001,
        describe: "Secure port to listen to for incoming HTTPS requests",
      },
      "insecure-bind-address": {
        type: "string",
        default: "127.0.0.1",
        describe: "IP address for --insecure-port",
      },
      "bind-address": {
        type: "string",
        default: "0.0.0.0",
        describe: "IP address for --port",
      },
      namespace: {
        type: "string",
        default: process.env.POD_NAMESPACE || "default",
        describe: "Namespace for dashboard resources",
      },
      "default-cert-dir": {
        type: "string",
        default: "/certs",
        describe: "Directory for TLS certs",
      },
      "tls-cert-file": {
        type: "string",
        default: "",
        describe: "Path to x509 certificate file",
      },
      "tls-key-file": {
        type: "string",
        default: "",
        describe: "Path to x509 private key file",
      },
      "settings-config-map-name": {
        type: "string",
        default: "kubernetes-dashboard-settings",
        describe: "Settings ConfigMap name",
      },
      "system-banner": {
        type: "string",
        default: "",
        describe: "System banner HTML message",
      },
      "system-banner-severity": {
        type: "string",
        default: "INFO",
        choices: ["INFO", "WARNING", "ERROR"],
        describe: "Banner severity level",
      },
      "locale-config": {
        type: "string",
        default: "/locale_conf.json",
        describe: "Locale configuration file path",
      },
      kubeconfig: {
        type: "string",
        default: "",
        describe: "Kubeconfig file path",
      },
    })
    .help()
    .parseSync();


// Getter functions
function getNamespace(): string {
  return argv.namespace;
}
  
function getInsecurePort(): number {
  return argv["insecure-port"];
}
  
function getPort(): number {
  return argv.port;
}
  
function getInsecureBindAddress(): string {
  return argv["insecure-bind-address"];
}
  
function getBindAddress(): string {
  return argv["bind-address"];
}
  
function getDefaultCertDir(): string {
  return argv["default-cert-dir"];
}
  
function getCertFile(): string {
  return argv["tls-cert-file"] || (getAutoGenerateCertificates() ? "DashboardCertName" : "");
}
  
function getKeyFile(): string {
  return argv["tls-key-file"] || (getAutoGenerateCertificates() ? "DashboardKeyName" : "");
}
  
function getSettingsConfigMapName(): string {
  return argv["settings-config-map-name"];
}
  
function getSystemBanner(): string {
  return argv["system-banner"];
}
  
function getSystemBannerSeverity(): string {
  return argv["system-banner-severity"];
}
  
function getAutoGenerateCertificates(): boolean {
  return argv["auto-generate-certificates"];
}
  
function getLocaleConfig(): string {
  return argv["locale-config"];
}
  
function getInsecureAddress(): string {
  return `${getInsecureBindAddress()}:${getInsecurePort()}`;
}
  
function getAddress(): string {
  return `${getBindAddress()}:${getPort()}`;
}
  
function getKubeconfigPath(): string {
  return argv.kubeconfig;
}

export const args = {
    getNamespace,
    getInsecurePort,
    getPort,
    getInsecureBindAddress,
    getBindAddress,
    getDefaultCertDir,
    getCertFile,
    getKeyFile,
    getSettingsConfigMapName,
    getSystemBanner,
    getSystemBannerSeverity,
    getAutoGenerateCertificates,
    getLocaleConfig,
    getInsecureAddress,
    getAddress,
    getKubeconfigPath,
  };
  