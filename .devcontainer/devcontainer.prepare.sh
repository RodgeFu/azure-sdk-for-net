cd ~/workspaces/azure-sdk-for-net/tools/VsCodeExtensions/azure-sdk-mgmt-codegen-helper
npm install
vsce package --allow-missing-repository --out output.vsix
code --install-extension output.vsix