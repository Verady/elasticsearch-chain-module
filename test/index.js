const Lib = require('../index');
const lib = new Lib({
  host: 'localhost:9200',
  indexName: 'bch_tx_1',
  dataType: 'bch_tx'
});

describe('elastic query lib', function () {
  it('should get address history', function () {
    const address = '1Lwbd1gf6VjCCVDr6VJiH7RVY1ZDzVReN';
    const fromDate = '2009-01-01 00:00:00';
    const toDate = '2019-01-01 00:00:00';
    return lib.getAddressHistory(address, fromDate, toDate);
  });

  it('should get balance history', function () {

  });

  it('should get inter wallet transfers', function () {

  });
});
