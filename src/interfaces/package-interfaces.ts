export interface PackageTree {
  packagename?: string;
  path?: string;
  managed?: boolean;
  dependency?: PackageTree[];
}

export interface Status {
  hasError?: boolean;
  message?: string;
}
