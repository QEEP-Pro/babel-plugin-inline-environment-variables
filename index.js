var dotEnv = require('dotenv');
var process = require('process');

module.exports = function (data) {
    const t = data.types;

    return {
        visitor: {
            ImportDeclaration: function (path) {
                if (path.node.source.value === '@env') {
                    const config = Object.assign({}, dotEnv.config({path: './.env', silent: true}), process.env);

                    path.node.specifiers.forEach(function (specifier, idx) {
                        if (specifier.type === 'ImportDefaultSpecifier') {
                            throw path.get('specifiers')[idx].buildCodeFrameError('Import dotenv as default is not supported.')
                        }
                        const importedId = specifier.imported.name
                        const localId = specifier.local.name;
                        if (!(config.hasOwnProperty(importedId))) {
                            throw path.get('specifiers')[idx].buildCodeFrameError('Try to import dotenv variable "' + importedId + '" which is not defined in any ' + configFile + ' files and environment variables.')
                        }

                        const binding = path.scope.getBinding(localId);
                        binding.referencePaths.forEach(function (refPath) {
                            refPath.replaceWith(t.valueToNode(config[importedId]))
                        });
                    });

                    path.remove();
                }
            }
        }
    }
}
