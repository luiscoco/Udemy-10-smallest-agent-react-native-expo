const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
module.exports=defineConfig([expo,{ignores:['backend/**','dist/**','verification/**','src/lesson/**']}]);
