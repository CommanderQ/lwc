
/* eslint-env node */

const path = require('path');
const uglify = require('rollup-plugin-uglify');
const replace = require('rollup-plugin-replace');
const babel = require('rollup-plugin-babel');
const { minify } = require('uglify-es');

const { version } = require('./package.json');
const { generateTargetName } = require('./rollup.config.util');
const { compatBrowsersPreset } = require('../../scripts/babel-config-util');

const entry = path.resolve(__dirname, 'src/main.js');
const outputDir = path.resolve(__dirname, 'dist/umd');

const banner = (`/**\n * Copyright (C) 2017 salesforce.com, inc.\n */`);
const footer = `/** version: ${version} */`;

function rollupConfig(config){
    const { format, target, prod } = config;
    const isCompat = target === 'es5';

    let plugins = [
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        prod && uglify({}, code => minify(code)),
        isCompat && babel({
            presets: [ compatBrowsersPreset ],
            plugins: [ "external-helpers" ],
            babelrc: false,
        }),
    ].filter((plugin) => plugin);

    const targetName = generateTargetName(config);

    // sourceMap issue: https://github.com/mjeanroy/rollup-plugin-license/issues/6
    return {
        input: entry,
        output: {
            file: path.join(outputDir + `/${target}`,  targetName),
            name: "WireService",
            format,
            banner,
            footer,
        },
        plugins,
    }
}

module.exports = [
    // PROD
    rollupConfig({ format: 'umd', prod: true, target: 'es5' }),
    rollupConfig({ format: 'umd', prod: true, target: 'es2017' }),

    // PRODDEBUG mode
    rollupConfig({ format: 'umd', proddebug: true, target: 'es2017' }),
    rollupConfig({ format: 'umd', proddebug: true, target: 'es5' })
]
