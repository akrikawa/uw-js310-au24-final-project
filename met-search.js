// window.onload = () => {
// Elements.
const searchInput = document.getElementById('search');
const searchForm = document.getElementById('search-form');
const resultsEl = document.getElementById('results');
const pagerNextButton = document.getElementById('next');
const pagerPrevButton = document.getElementById('prev');
const PAGER_STEP = 5;
// application state.
const appState = new State();

// Documenting what things we'll have appState hold.
/*
    recentSearchResults - the MET objectIDs from the most recent search
    pagerIndexStart
    pagerIndexEnd
    metObjectDataToRender - the MET object data for a batch of objects ready to render
  */

// Set up initial state.
appState.update({
  recentSearchResults: [],
  pagerIndexStart: 0,
  pagerIndexEnd: PAGER_STEP,
  metObjectDataToRender: [],
  loadingResults: false,
});

console.log('appState line10', appState);

const clearSearchResults = () => {
  const state = appState.get();
  let current = [...state.metObjectDataToRender];
  current = [];
  debugger;
  appState.update({
    // ...state,
    metObjectDataToRender: current,
  });
};

// Calls the api-client running the search endpoint.
// Takes resultant objectIDs and stores them in application state.
const searchAndStore = async (queryParams = 'sunflower') => {
  const state = appState.get();
  // const recentSearchResults = [...state.recentSearchResults];
  await getSearchResults(queryParams).then((res) => {
    appState.update({
      ...state,
      recentSearchResults: res.objectIDs,
      pagerIndexStart: 0,
      pagerIndexEnd: PAGER_STEP,
    });
  });
  pagerResults();
  // return data;
  // Test this.
  // appState.update({ metObjectDataToRender: true });
};

// Pager. Build a pager function that goes and gets the data for the next 20
// MET Object IDs. Stores the data in state.
const pagerResults = async () => {
  const start = appState.get().pagerIndexStart;
  const end = appState.get().pagerIndexEnd;
  const recentSearchResults = appState.get().recentSearchResults;
  const total = recentSearchResults.length;
  // const state = appState.get();
  appState.update({ loading: true });

  if (total > 0) {
    console.log('inside pager results and have searchresults > 0');
    // Go get the data.
    let objectIDsToRender = recentSearchResults.slice(start, end);
    try {
      const data = await getBatchOfObjectData(objectIDsToRender);
      console.log(data);
      appState.update({
        metObjectDataToRender: data,
        loading: false,
      });
    } catch (e) {
      console.log('error', e);
    }
  } else {
    console.log(
      "There aren't metObjectIDs to search for in state.recentSearchResults."
    );
  }
};

const getSingleObjectData = async (objectID) => {
  try {
    const response = await getObjectResults(objectID);
    // console.log(response);
    return response;
  } catch (e) {
    console.log('There was an error.', e);
  }
  // return returnObject.isPublicDomain ? returnObject : false;
};

const getBatchOfObjectData = async (objectIDRequests = []) => {
  // console.log(typeof getSingleObjectData(objectIDRequests[0]));
  const promiseQueue = objectIDRequests.map((objectID) =>
    getSingleObjectData(objectID)
  );
  return await Promise.all(promiseQueue);
};

// Utilities.
const showErrorMessage = (e) => {
  resultsEl.innerHTML = `<div class="alert alert-danger"><h3>An error occurred</h3><p>${e}<p></div>`;
};

// const searchResults = new SearchResults();
const resultsContainer = new ResultsContainer();

// Subscribe to observer.
// appState.subscribe(searchResults);
appState.subscribe(resultsContainer);

// Set initial states.
resultsContainer.render(appState.get(), 'results-container');
// searchResults.render(appState.get(), 'search-results');

// Set up listeners.
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('value', searchInput.value);
  const state = appState.get();
  appState.update({ ...state, recentSearchResults: [] });
  searchAndStore(searchInput.value);
  pagerResults();
});

pagerNextButton.addEventListener('click', (e) => {
  console.log('next button event');
  const state = appState.get();
  appState.update({
    ...state,
    pagerIndexStart: state.pagerIndexStart + PAGER_STEP,
    pagerIndexEnd: state.pagerIndexEnd + PAGER_STEP,
  });
  pagerResults();
});
