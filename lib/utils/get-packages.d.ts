import { SfdxProjectJson } from '@salesforce/core';
import { PackageTree } from '../interfaces/package-interfaces';
export declare function getDeployUrls(projectJson: SfdxProjectJson, packagename: string): PackageTree;
