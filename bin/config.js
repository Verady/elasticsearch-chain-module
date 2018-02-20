'use strict';

const ini = require('ini');
const { existsSync, writeFileSync } = require('fs');
const mkdirp = require('mkdirp');
const { tmpdir, homedir } = require('os');
const { join } = require('path');

const DEFAULT_CONFIGDIR = join(homedir(), '.config/es-chain-module');

module.exports = function(configdir) {

  configdir = configdir || DEFAULT_CONFIGDIR;

  const options = {

    //Elastic Search
    Chain: 'BTC',
    ElasticSearchHost: '127.0.0.1',
    ElasticSearchIndex: 'btc_tx_1',
    ElasticSearchDataType: 'btc_tx',

    // Debugging/Developer
    VerboseLoggingEnabled: '1',
    LogFilePath: join(configdir, 'es-chain-module.log'),
    LogFileMaxBackCopies: '3',

    ControlSock: join(configdir, 'es-chain-module.sock'),
    VeraNetSock: '',
  };

  if (!existsSync(join(configdir, 'config'))) {
    mkdirp.sync(configdir);
    writeFileSync(join(configdir, 'config'), ini.stringify(options));
  }

  return options;
};
