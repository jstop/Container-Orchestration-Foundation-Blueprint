import * as path from 'path';
import * as fs from 'fs';
import { parse, stringify} from 'yaml';

const { GIT_REMOTE_URL, GIT_CURRENT_BRANCH } = process.env;

const outputs = require('../../outputs.json');
const values_filename = path.join(__dirname, '../../charts/apps/values.yaml');

const yaml = fs.readFileSync(values_filename, 'utf8');
const obj = parse(yaml);

obj.spec.source.repoURL = GIT_REMOTE_URL;
obj.spec.source.targetRevision = GIT_CURRENT_BRANCH;
obj['backend-repo-url'] = outputs.SpringBackendPipelineStack.ECRRepoURI;
obj['frontend-repo-url'] = outputs.SpringFrontendPipelineStack.ECRRepoURI;

const yaml_string = stringify(obj);
console.log(yaml_string);
fs.writeFileSync(values_filename, yaml_string);
