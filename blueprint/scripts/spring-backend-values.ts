import * as path from 'path';
import * as fs from 'fs';
import { parse, stringify} from 'yaml';

interface Env extends Object {
    name: string;
    value: string;
}

const { BACKEND_HOSTNAME, FRONTEND_HOSTNAME } = process.env;

const outputs = require('../../outputs.json');
const values_filename = path.join(__dirname, '../../charts/spring-backend/values.yaml');

const yaml = fs.readFileSync(values_filename, 'utf8');
const obj = parse(yaml);

obj.image.repository = outputs.SpringBackendPipelineStack.ECRRepoURI;
obj.ingress.annotations['alb.ingress.kubernetes.io/certificate-arn'] = outputs.PrerequisitesStack.CertificateArn;
obj.ingress.annotations['external-dns.alpha.kubernetes.io/hostname'] = BACKEND_HOSTNAME;
obj.ingress.host = BACKEND_HOSTNAME;
obj.env.find((e: Env) => e.name === 'SPRING_DATASOURCE_URL').value = outputs.RDSStack.SpringDatasourceUrl;
obj.env.find((e: Env) => e.name === 'SPRING_DATASOURCE_USERNAME').value = outputs.RDSStack.RDSSecretName;
obj.env.find((e: Env) => e.name === 'APP_CORS_ALLOWEDORIGINS').value = `https://${FRONTEND_HOSTNAME}`;

const yaml_string = stringify(obj);
console.log(yaml_string);
fs.writeFileSync(values_filename, yaml_string);
