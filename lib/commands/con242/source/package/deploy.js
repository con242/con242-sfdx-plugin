"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const os = require("os");
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const listr2_1 = require("listr2");
const Table = require("cli-table");
const source_deploy_retrieve_1 = require("@salesforce/source-deploy-retrieve");
const get_packages_1 = require("../../../../utils/get-packages");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core_1.Messages.loadMessages("con242-sfdx-plugin", "deploy");
class Org extends command_1.SfdxCommand {
    async run() {
        this.ux.log("Note: Managed Packages are not considered when deploying the dependencies...");
        // map flags to variables
        const packagename = (this.flags.packagename || "");
        const includedependencies = (this.flags.includedependencies ||
            "");
        // get packages
        const projectJson = await this.project.retrieveSfdxProjectJson();
        const packageDependencyTree = (0, get_packages_1.getDeployUrls)(projectJson, packagename);
        if (packageDependencyTree) {
            const tasks = new listr2_1.Listr([]);
            if (includedependencies) {
                packageDependencyTree.dependency.forEach((dep) => {
                    if (dep.path) {
                        tasks.add({
                            title: `Deploy Dependency: ${dep.packagename}`,
                            task: async () => {
                                await this.deployPackageTreeNode(dep);
                            },
                        });
                    }
                });
            }
            tasks.add({
                title: `Deploy Package: ${packagename}`,
                task: async () => {
                    await this.deployPackageTreeNode(packageDependencyTree);
                },
            });
            await tasks.run();
            // deploy dependencies
        }
        else {
            throw new core_1.SfdxError(messages.getMessage("errorNoPckResults", [packagename]));
        }
        const outputString = "All done.";
        this.ux.log(outputString);
        // Return an object to be displayed with --json
        return { orgId: this.org.getOrgId(), outputString };
    }
    async deployPackageTreeNode(treeNode) {
        const path = treeNode.path;
        const deploy = await source_deploy_retrieve_1.ComponentSet.fromSource(path).deploy({
            usernameOrConnection: this.org.getConnection().getUsername(),
        });
        this.ux.startSpinner(`deploying ${treeNode.packagename}`);
        // Attach a listener to check the deploy status on each poll
        deploy.onUpdate((response) => {
            const { status } = response;
            this.ux.setSpinnerStatus(status);
        });
        // Wait for polling to finish and get the DeployResult object
        const res = await deploy.pollStatus();
        if (!res.response.success) {
            console.log(this.print(res.response.details.componentFailures));
            this.ux.stopSpinner(`Deployment of ${treeNode.packagename} failed.`);
            throw new core_1.SfdxError(messages.getMessage("errorDeployFailed", [
                "Deployment failed. Check errors.",
            ]));
        }
        else {
            this.ux.stopSpinner(`Deployment of ${treeNode.packagename} done.`);
        }
    }
    print(input) {
        var table = new Table({
            head: ["Component Name", "Error Message"],
        });
        let result = [];
        if (Array.isArray(input)) {
            result = input.map((a) => {
                const res = {
                    Name: a.fullName,
                    Type: a.componentType,
                    Status: a.problemType,
                    Message: a.problem,
                };
                return res;
            });
        }
        else {
            const res = {
                Name: input.fullName,
                Type: input.componentType,
                Status: input.problemType,
                Message: input.problem,
            };
            result = [...result, res];
        }
        result.forEach((r) => {
            let obj = {};
            obj[r.Name] = r.Message;
            table.push(obj);
        });
        return table.toString();
    }
}
exports.default = Org;
Org.description = messages.getMessage("commandDescription");
Org.examples = messages.getMessage("examples").split(os.EOL);
Org.args = [{ name: "file" }];
Org.flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    packagename: command_1.flags.string({
        char: "p",
        description: messages.getMessage("packageFlagDescription"),
    }),
    includedependencies: command_1.flags.boolean({
        char: "i",
        required: false,
        description: messages.getMessage("depFlagDescription"),
    }),
};
// Comment this out if your command does not require an org username
Org.requiresUsername = true;
// Comment this out if your command does not support a hub org username
// protected static supportsDevhubUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
Org.requiresProject = true;
//# sourceMappingURL=deploy.js.map