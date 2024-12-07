// const searchForm = document.getElementById('search-form');
// Tests go in here.
// describe('API test', function () {
//   let idToGet = 196473;
//   const test = getObjectResults(idToGet);

//   it('contains a spec with an expectation', function () {
//     expect(test).toEqual(true);
//   });
// });

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

describe('getBatchOfObjectData: fdsfdafdsfdafdsfsdf', function () {
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
