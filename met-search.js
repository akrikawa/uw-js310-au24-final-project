// window.onload = () => {
// Elements.
const searchInput = document.getElementById('search');
const searchForm = document.getElementById('search-form');
const resultsEl = document.getElementById('results');
const pagerNextButton = document.getElementById('next');
const pagerPrevButton = document.getElementById('prev');
// const PAGER_STEP = 5;
const pagerStepSelect = document.getElementById('pager-step');
// application state.
const appState = new State();

// Documenting what things we'll have appState hold.
/*
    recentSearchResults - the MET objectIDs from the most recent search
    pagerIndexStart
    pagerIndexEnd
    metObjectDataToRender - the MET object data for a batch of objects ready to render
    currentFirstItemInView
    loadingResults: true/false
  */

// Set up initial state.
appState.update({
  recentSearchResults: [],
  pagerIndexStart: 0,
  pagerIndexEnd: 5,
  pagerStep: 5,
  currentFirstItemInView: 0,
  metObjectDataToRender: [],
  loadingResults: false,
});

// console.log('appState line10', appState);

// Calls the api-client running the search endpoint.
// Takes resultant objectIDs and stores them in application state.
const searchAndStore = async (queryParams = 'degas') => {
  const state = appState.get();
  // Clear recent search results.
  appState.update({ recentSearchResults: [] });
  appState.update({ metObjectDataToRender: [{}] });
  await getSearchResults(queryParams).then((res) => {
    appState.update({
      recentSearchResults: res.objectIDs,
      pagerIndexStart: 0,
      pagerIndexEnd: state.pagerStep,
    });
  });
  await pagerResults();
};

// Pager. Build a pager function that goes and gets the data for the next 20
// MET Object IDs. Stores the data in state.
const pagerResults = async () => {
  const state = appState.get();
  const start = state.pagerIndexStart;
  const end = state.pagerIndexEnd;
  const recentSearchResults = state.recentSearchResults;
  const total = recentSearchResults.length;
  // const state = appState.get();
  appState.update({ loading: true });

  if (total > 0) {
    console.log('inside pager results and have searchresults > 0');
    // Go get the data.
    let objectIDsToRender = recentSearchResults.slice(start, end);
    try {
      const data = await getBatchOfObjectData(objectIDsToRender);
      // console.log(data);
      appState.update({
        metObjectDataToRender: data,
        loading: false,
      });
      setPagers();
    } catch (e) {
      console.log('error', e);
      showErrorMessage(e);
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
    console.log('There was an error getting one of the Met objects.', e);
    showErrorMessage(e);
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

// Sets the pager buttons to disabled or enabled.
const setPagers = () => {
  const state = appState.get();
  const start = state.pagerIndexStart;
  const end = state.pagerIndexEnd;
  const total = state.recentSearchResults.length;
  const pagerStep = state.pagerStep;

  // If paging forward is possible. We have a total for length,
  // so we have recentSearchResults and our starting point for the current
  // paged view + the PAGER_STEP is less than the total, then we have room
  // to advance forward.
  // Next button.
  if (total && start + pagerStep <= total) {
    pagerNextButton.removeAttribute('disabled');
  } else {
    pagerNextButton.setAttribute('disabled', true);
  }
  // Previous button.
  if (total && start - (pagerStep - 1) > 0) {
    pagerPrevButton.removeAttribute('disabled');
  } else {
    pagerPrevButton.setAttribute('disabled', true);
  }
};
// const searchResults = new SearchResults();
const resultsContainer = new ResultsContainer();
// const resultsCard = new ResultsCard();

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
  pageAndRender('next');
});

pagerStepSelect.addEventListener('change', (e) => {
  appState.update({ pagerStep: e.target.value });
});

pagerNextButton.addEventListener('click', () => {
  // console.log('next button event');
  pageAndRender('next');
});

pagerPrevButton.addEventListener('click', () => {
  // console.log('next button event');
  pageAndRender('prev');
});

const pageAndRender = (direction) => {
  const state = appState.get();
  appState.update({
    pagerIndexStart:
      direction === 'next'
        ? state.pagerIndexStart + state.pagerStep
        : state.pagerIndexStart - state.pagerStep,
    pagerIndexEnd:
      direction === 'next'
        ? state.pagerIndexEnd + state.pagerStep
        : state.pagerIndexEnd - state.pagerStep,
  });
  pagerResults();
};
