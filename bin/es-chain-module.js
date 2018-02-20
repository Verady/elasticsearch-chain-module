#!/usr/bin/env node

'use strict';

const program = require('commander');
const bunyan = require('bunyan');
const RotatingLogStream = require('bunyan-rotating-file-stream');
const ESQuery = require('../lib/query');
const fs = require('fs');
const path = require('path');
const esCM = require('../index');
const options = require('./config');
const npid = require('npid');
const boscar = require('boscar');


program.version(`
  es-chain-module  ${esCM.version.software}
`);

program.description(`
  Copyright (c) 2018 Verady, LLC
  Licensed under the GNU Affero General Public License Version 3
`);

program.option('--config <file>', 'path to a es-chain-module configuration');
program.option('--outputDir <file>', 'path to output config file & logs');
program.parse(process.argv);

let argv;

if (program.outputDir && !program.config) {
  argv = { config: path.join(program.outputDir, 'config') };
}

const config = require('rc')('es-chain-module', options(program.outputDir), argv);

// also need to set esHost, esIndex, esDataType

let controller, query, logger;

async function _init() {
  // Initialize logging
  logger = bunyan.createLogger({
    name: `es-chain-module`,
    streams: [
      {
        stream: new RotatingLogStream({
          path: config.LogFilePath,
          totalFiles: parseInt(config.LogFileMaxBackCopies),
          rotateExisting: true,
          gzip: false
        })
      },
      { stream: process.stdout }
    ],
    level: parseInt(config.VerboseLoggingEnabled) ? 'debug' : 'info'
  });

  // Shutdown children cleanly on exit
  process.on('exit', killChildrenAndExit);
  process.on('SIGTERM', killChildrenAndExit);
  process.on('SIGINT', killChildrenAndExit);
  process.on('uncaughtException', (err) => {
    logger.error(err.message);
    logger.debug(err.stack);
    process.exit(1);
  });

  query = new ESQuery({
    host: config.ElasticSearchHost,
    indexName: config.ElasticSearchIndex,
    dataType: config.ElasticSearchDataType,
  });

  startupAndRegister();
}

function killChildrenAndExit() {
  logger.info('exiting, killing child services, cleaning up');
  npid.remove(config.DaemonPidFilePath);
  process.removeListener('exit', killChildrenAndExit);

  if (controller) {
    controller.server.close();
  }

  process.exit(0);
}

function startupAndRegister() {
  controller = new boscar.Server({
    //setup method here for
    AUDIT_SELECTION: function(selection, callback) {
        async.map(selection, (query, done) => {
          // Query contains { address, to, from }
          query.getAddressHistory(query, done);
        }, callback);
      }
  });

  // Start listening on a domain socket
  controller.listen(config.ControlSock);

  // Create a BOSCAR client to connect to the Veranet daemon
  const client = new boscar.Client();

  // Connect to the controller
  client.connect(config.VeraNetSock);

  // When connected, register our module and disconnect from the controller
  client.on('ready', () => {
    client.invoke('REGISTER_MODULE', [config.Chain, `unix://${config.ControlSock}`], (err) => {
      if (err){
        logger.error(err);
      }
    });
  });
}

_init();
