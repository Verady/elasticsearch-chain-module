const es = require('elasticsearch');

class QueryLib {
  constructor (config) {
    this.config = config;
    this.client = new es.Client({
      host: config.host,
      log: config.logLevel || 'error' //set to trace for full debug
    });
  }

  getAddressHistory (address, fromDate, toDate, size, from) {
    const query = {
      index: this.config.indexName,
      body: {
        from,
        size,
        sort: [
          {'doc.blockTimestamp': {order: 'asc'}}
        ],
        query: {
          bool: {
            must: [
              {
                term: {
                  'doc.inputs.address': address
                }
              },
              {
                term: {
                  'doc.outputs.address': address
                }
              }
            ]
          }
        }
      }
    };
    return this.client.search(query);
  }
}

module.exports = QueryLib;
