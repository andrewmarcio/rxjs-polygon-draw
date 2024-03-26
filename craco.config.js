const path = require('path')

module.exports = {
    babel: {
        plugins: ['babel-plugin-styled-components'],
    },
    webpack: {
        alias: {
            '@components': path.resolve(__dirname, 'src/components'),
            '@observables': path.resolve(__dirname, 'src/libs/observables'),
        },
    },
}
