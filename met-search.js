// @todo: track where we are in the array along with pagerStart and pagerEnd
//        When next or previous hit, this needs to come into play.

// @todo: Add something in each card to collect user input for marking favorites.
//        Write something that takes that object id, gets its data and stores that in LocalStorage.

// @todo: Try do so similar for a remove from favorites.

// @todo: Write something that can take the favorites from local storage and render them in a div.
//        Start with something viewable and already on the page. Later find a way to create a show/hide tool for it.

// window.onload = () => {
// Elements.
const searchInput = document.getElementById('search');
const searchForm = document.getElementById('search-form');
const resultsEl = document.getElementById('results');
const userMessages = document.getElementById('messages');
const pagerNextButton = document.getElementById('next');
const pagerPrevButton = document.getElementById('prev');
const pagerStepSelect = document.getElementById('pager-step');

// Application state.
const appState = new State();

// Set up initial state.
appState.update({
  recentSearchResults: [],
  pagerIndexStart: 0,
  pagerIndexEnd: 0,
  pagerStep: 5,
  currentLastItemInView: 0,
  currentFirstItemInView: 0,
  metObjectDataToRender: [],
  loadingResults: false,
  haveSearchResults: false,
});

// Calls the api-client running the search endpoint.
// Takes resultant objectIDs and stores them in application state.
const searchAndStore = async (queryParams = 'degas') => {
  clearErrorMessage();
  const state = appState.get();
  // Clear recent search results.
  appState.update({ recentSearchResults: [] });
  appState.update({ metObjectDataToRender: [{}] });
  await getSearchResults(queryParams).then((res) => {
    appState.update({
      recentSearchResults: res.objectIDs !== null ? res.objectIDs : [],
      pagerIndexStart: 0,
      pagerIndexEnd: state.pagerStep,
      currentFirstItemInView: 0,
      currentLastItemInView: state.pagerStep,
      haveSearchResults:
        res.objectIDs !==
        null /* If there are no objectIDs in the result, then we don't have anything. */,
    });
  });
  await pagerResults();
};

// Pager. Build a pager function that goes and gets the data for the next 20
// MET Object IDs. Stores the data in state.
const pagerResults = async () => {
  clearErrorMessage();
  const state = appState.get();
  const start = state.pagerIndexStart;
  const end = state.pagerIndexEnd;
  const recentSearchResults = state.recentSearchResults;
  const total = recentSearchResults !== null ? recentSearchResults.length : 0;
  appState.update({ loading: true });

  // Check that there are recentSearchResults to work with.
  if (total > 0 && state.haveSearchResults) {
    // Go get the data.
    let objectIDsToRender = recentSearchResults.slice(start, end);
    // debugger;
    try {
      const data = await getBatchOfObjectData(objectIDsToRender);
      // console.log(data);
      appState.update({
        metObjectDataToRender: cleanDataSet(data),
        loading: false,
      });
      setPagers();
    } catch (e) {
      showErrorMessage(e);
    }
  } else {
    showErrorMessage(`No MET objects found for that search term(s).`);
    appState.update({ loading: false });
    console.log(
      "There aren't MET ObjectIDs to search for in state.recentSearchResults."
    );
  }
};

const getSingleObjectData = async (objectID) => {
  console.log(objectID);
  try {
    const response = await getObjectResults(objectID);
    return response;
  } catch (e) {
    console.log('There was an error getting one of the MET objects.', e);
    showErrorMessage(e);
  } finally {
    `Finally.`;
  }
};

const getBatchOfObjectData = async (objectIDRequests = []) => {
  const promiseQueue = objectIDRequests.map((objectID) =>
    getSingleObjectData(objectID)
  );
  return await Promise.all(promiseQueue);
};

// Utilities.
const showErrorMessage = (error) => {
  userMessages.classList.remove('hidden');
  // Check to see if there's already an error message in messages.
  if (!userMessages.hasChildNodes()) {
    const errorDivEl = document.createElement('div');
    errorDivEl.classList.add('alert', 'alert-error');
    const innerPart = `<h2>Ah, snap. There was an error!</h2><p><em>"Art is human. Error is human. Art is error."</em><br>&mdash; David Bayles, Art and Fear</p>
    <ul id="error-list"><li>${error}</li></ul>`;
    errorDivEl.innerHTML = innerPart;
    userMessages.appendChild(errorDivEl);
  } else {
    const errorListEl = document.getElementById('error-list');
    const errorItem = document.createElement('li');
    errorItem.innerText = error;
    errorListEl.appendChild(errorItem);
  }
};

const clearErrorMessage = () => {
  if (userMessages.textContent === '') {
    return;
  } else {
    userMessages.textContent === '';
    userMessages.classList.add('hidden');
  }
};

// Send the ojbectIDsToRender data through a screener. When there's an issue getting
// the data from the /object/ endpoint in the API, the result is undefined. This is somewhat of a
// band-aid so that the other items in the pagerResults() can render and the app continues to function.
const cleanDataSet = (objectIDsToRender) => {
  console.log('before', objectIDsToRender);
  objectIDsToRender.forEach((dataSet, i) => {
    if (dataSet === undefined) {
      console.log('yes');
      // Build a dummy set to space in render.
      objectIDsToRender[i] = {
        objectID: 000000,
        title: `This item wasn't retrieved from the MET API.`,
      };
    }
  });
  console.log('after', objectIDsToRender);
  return objectIDsToRender;
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
  if (total && start + pagerStep < total) {
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

const resultsContainer = new ResultsContainer();
const searchCounter = new SearchCounter();

// Subscribe to observer.
appState.subscribe(resultsContainer);
appState.subscribe(searchCounter);

// Set initial states.
resultsContainer.render(appState.get(), 'results-container');
searchCounter.render(appState.get(), 'counter');

const validateFormField = (searchInput) => {
  if (searchInput.value.trim().length === 0) {
    // The search field is empty. Set class(es) for custom validation.
    searchInput.classList.add('invalid');
    // Set message beneath field.
    searchElError = document.getElementById('error');
    searchElError.innerText = 'Please enter a search term.';
    return false;
  } else {
    searchInput.classList.remove('invalid');
    return true;
  }
};

// Set up listeners.
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchInputHasData = validateFormField(searchInput);
  if (searchInputHasData) {
    clearErrorMessage();
    searchElError = document.getElementById('error');
    searchElError.innerText = '';
    // console.log('value', searchInput.value);
    const state = appState.get();
    appState.update({
      ...state,
      recentSearchResults: [],
    });
    searchAndStore(searchInput.value);
    pageAndRender('next');
  }
});

pagerStepSelect.addEventListener('change', (e) => {
  state = appState.get();
  const currentDiffInPagerStep = parseInt(e.target.value) - state.pagerStep;
  appState.update({
    pagerIndexEnd: state.pagerIndexEnd + currentDiffInPagerStep,
    currentLastItemInView: state.currentLastItemInView + currentDiffInPagerStep,
    pagerStep: parseInt(e.target.value),
  });
  console.log('start', state.pagerIndexStart);
  console.log('end', state.pagerIndexEnd);
  console.log('pagerStep', state.pagerStep);
  console.log('current view start', state.currentFirstItemInView);
  console.log('current view end', state.currentLastItemInView);
  pagerResults();
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
  if (direction === 'next') {
    appState.update({
      pagerIndexStart: state.pagerIndexStart + state.pagerStep,
      pagerIndexEnd: state.pagerIndexEnd + state.pagerStep,
      currentFirstItemInView: state.currentFirstItemInView + state.pagerStep,
      currentLastItemInView:
        state.currentLastItemInView + state.pagerStep <=
        state.recentSearchResults.length
          ? state.currentLastItemInView + state.pagerStep
          : state.recentSearchResults.length,
    });
  } else {
    appState.update({
      pagerIndexStart: state.pagerIndexStart - state.pagerStep,
      pagerIndexEnd: state.pagerIndexEnd - state.pagerStep,
      currentFirstItemInView:
        state.currentFirstItemInView - state.pagerStep >= 0
          ? state.currentFirstItemInView - state.pagerStep
          : 0,
      currentLastItemInView: state.currentLastItemInView - state.pagerStep,
    });
  }
  pagerResults();
};
