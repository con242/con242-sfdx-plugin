"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeployUrls = void 0;
function getDeployUrls(projectJson, packagename) {
    const packageDirs = projectJson.getUniquePackageDirectories();
    let packageTree;
    const currentPackage = packageDirs.find((pck) => pck.package === packagename);
    if (currentPackage) {
        packageTree = {
            packagename: currentPackage.package,
            path: currentPackage.fullPath,
            managed: false,
            dependency: [],
        };
        if (currentPackage.dependencies) {
            currentPackage.dependencies.forEach((dep) => {
                var _a;
                const treeDep = {
                    packagename: dep.package,
                    path: (_a = packageDirs.find((pck) => pck.package === dep.package)) === null || _a === void 0 ? void 0 : _a.fullPath,
                };
                packageTree.dependency = [...packageTree.dependency, treeDep];
            });
        }
    }
    return packageTree;
}
exports.getDeployUrls = getDeployUrls;
//# sourceMappingURL=get-packages.js.map