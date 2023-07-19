import * as path from 'path';
import * as fs from 'fs';
import { parse, stringify} from 'yaml';

const { BACKEND_HOSTNAME, FRONTEND_HOSTNAME } = process.env;

const outputs = require('../../outputs.json');
const values_filename = path.join(__dirname, '../../charts/spring-frontend/values.yaml');

const yaml = fs.readFileSync(values_filename, 'utf8');
const obj = parse(yaml);

obj.image.repository = outputs.SpringFrontendPipelineStack.ECRRepoURI;
obj.ingress.annotations['alb.ingress.kubernetes.io/certificate-arn'] = outputs.PrerequisitesStack.CertificateArn;
obj.ingress.annotations['external-dns.alpha.kubernetes.io/hostname'] = FRONTEND_HOSTNAME;
obj.ingress.host = FRONTEND_HOSTNAME;
obj.env.react_app_api_base_url = `https://${BACKEND_HOSTNAME}/api`;

const yaml_string = stringify(obj);
console.log(yaml_string);
fs.writeFileSync(values_filename, yaml_string);
