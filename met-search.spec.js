describe('API call: for single MET object', function () {
  beforeEach(async function () {
    let idToGet = 196473;
    value = await getObjectResults(idToGet);
  });

  it('returns an Object', function () {
    let whatType = typeof value;
    // expect(objectID).toEqual(196473);
    expect(whatType).toEqual('object');
  });

  it('getObjectResults - Returns objectID matching that passed in', function () {
    let objectID = value.objectID;
    expect(objectID).toEqual(196473);
  });
});

// Handle errors with API.
describe('API call: handle an error from MET API call', function () {
  beforeEach(async function () {
    let idBadToGet = 699803;

    const userMessages = document.getElementById('messages');
    value = await cleanDataSet([idBadToGet]);
  });
  // console.log(value);
  it('handles failure for an item an Object', function () {
    let whatType = typeof value;
    expect(objectID).toEqual('0');
    // expect(whatType).toEqual('object');
  });
  // it('getObjectResults - Returns objectID matching that passed in', function () {
  //   let objectID = value.objectID;
  //   expect(objectID).toEqual(196473);
  // });
});

describe('getSingleObjectData: which calls API call - for single MET object', function () {
  beforeEach(async function () {
    let idToGet = 196473;
    value = await getSingleObjectData(idToGet);
  });

  it('returns an Object', function () {
    let whatType = typeof value;
    // expect(objectID).toEqual(196473);
    expect(whatType).toEqual('object');
  });

  it('getObjectResults - Returns objectID matching that passed in', function () {
    let objectID = value.objectID;
    expect(objectID).toEqual(196473);
  });
});

describe('getBatchOfObjectData: get a batch of Met Objects and check results', function () {
  beforeEach(async function () {
    let idsToGet = [436135, 436155, 438817, 436121, 436144, 436162];
    returnvalue = await getBatchOfObjectData(idsToGet);
    console.log(returnvalue);
  });

  it('check what type comes back, should be ...hmmm', function () {
    let whatType = typeof returnvalue;
    console.log('this is waht comes back', returnvalue);
    expect(whatType).toEqual('object');
  });

  it('figure out how to access returned item', function () {
    let objectID = returnvalue[0].objectID;
    expect(objectID).toEqual(436135);
  });
});
