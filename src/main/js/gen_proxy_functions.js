const fs = require('fs');
const path = require('path');

const moduleName = 'utils';
const proxifyFunctionName = 'proxifyFunctionDeveloperMode';
const excludedFiles = ['google_cast.js'];
const proxifyFunctionRegex = new RegExp(`(?<func_name1>.+?)\s*=\s*(?<module_name>.+?)\.proxifyFunctionDeveloperMode\s*\((?<func_name2>.+)\)\s*;`, 'g');
const proxifyFunctionReplacement = (module_name, func_name) => `${func_name} = ${module_name}.${proxifyFunctionName}(${func_name});`
const exportedFunctionRegex = /export function (?<func_name>.+?)\s*\(/g;
const jsFileDirectory = process.argv[2];

const jsFiles = getFiles(jsFileDirectory);

function getFiles(dir) {
  let files = [];

  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  });

  return files;
}

const filesFiltered = jsFiles.filter(file => {
    for (const excludedFile in excludedFiles) {
        if (file.endsWith(excludedFiles[excludedFile])) {
            return false;
        }
    }

    return true;
}).filter(a => a.endsWith('tab_tv_channels.js') || a.endsWith('tab_developer.js') || a.endsWith('utils.js'));

console.log(jsFiles, "length: " + jsFiles.length);
console.log(filesFiltered, "length: " + filesFiltered.length);

function getExportedFunctionsFromFileContent(fileContent, proxifyFunctionName) {
    return [...fileContent.matchAll(exportedFunctionRegex)].map(match => {
        console.log('FUNC_NAME: ' + match.groups.func_name);
        if (match.groups.func_name !== proxifyFunctionName) { // Exclude proxy function (should not proxify itself!)
            return match.groups;
        } else {
            return null;
        }
    });
}

function getFileContentStrippedFromProxyStatements(fileContent) {
    return fileContent.replaceAll(proxifyFunctionRegex, '');
}

filesFiltered.forEach(file => {
    const fileContent = fs.readFileSync(file, { encoding: 'utf8', flag: 'r'});
    const updatedFileContent = getFileContentStrippedFromProxyStatements(fileContent);

    console.log('============================================================');
    // console.log(fileContent.length + ", " + updatedFileContent.length + "\n\n", updatedFileContent);
    console.log('============================================================');

    const proxyStatements = getExportedFunctionsFromFileContent(fileContent, proxifyFunctionName)
                                .filter(func => func != null)
                                .map(group => proxifyFunctionReplacement(moduleName, group.func_name));

    console.log('****************');
    console.log(proxyStatements);
    console.log('****************');
});
