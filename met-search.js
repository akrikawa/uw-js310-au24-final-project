// ======================================
//                SETUP
// ======================================

// Elements.
const searchInput = document.getElementById('search');
const searchForm = document.getElementById('search-form');
const userMessages = document.getElementById('messages');
const pagerNextButton = document.getElementById('next');
const pagerPrevButton = document.getElementById('prev');
const pagerStepSelect = document.getElementById('pager-step');

// Create application state object.
const appState = new State();

// Set up initial state values.
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
  searchTerms: '',
});

// ======================================
//          CORE APP FUNCTIONS
// ======================================

// Calls the api-client running the search endpoint.
// Takes resultant objectIDs and stores them in application state.
// The objectIDs returned are just that...IDs. Only numbers. After this point,
// we only have the IDs stored in an array in state.recentSearchResults for later
// processing.
const searchAndStore = async (queryParams = 'degas') => {
  const state = appState.get();
  clearErrorMessage();
  // Clear recent search results.
  appState.update({ metObjectDataToRender: [{}] });

  // Try to get search results.
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

  // Clear any error messages if we have results.
  if (state.haveSearchResults) {
    clearErrorMessage();
  }
  // Next go run a pager result update with what we've got in state.recentSearchResults.
  await pagerResults();
};

// Takes a look at where we're at in the potential results and then seeks to get data
// from the API for each result (by MET objectID).
const pagerResults = async () => {
  clearErrorMessage();
  const state = appState.get();
  const start = state.pagerIndexStart;
  const end = state.pagerIndexEnd;
  const recentSearchResults = state.recentSearchResults;
  // When a search for a keyword isn't successful, recentSearchResults can be null, so
  // we need to account for that with total or later evaluations of total won't work well.
  const total = recentSearchResults !== null ? recentSearchResults.length : 0;
  appState.update({ loading: true });

  // Check that there are recentSearchResults to work with.
  if (total > 0 && state.haveSearchResults) {
    // Go get the data. First take only the objectIDs we need based on where we are in the
    // pager results view.
    let objectIDsToRender = recentSearchResults.slice(start, end);
    try {
      const data = await getBatchOfObjectData(objectIDsToRender);
      // Update state with what we got back.
      appState.update({
        metObjectDataToRender:
          cleanDataSet(
            data
          ) /* cleanDataSet(data) came late in the game. See comment above this function for deets. */,
        haveSearchResults: true,
        loading: false,
      });
      // We have results, now set the pager buttons (disabled or not disabled).
      setPagers();
      // Also update the document title.
      document.title = `Search results for ${state.searchTerms} | MET Art finder 4000`;
    } catch (e) {
      showErrorMessage(e);
    }
  } else {
    appState.update({ loading: false });
    appState.update({ haveSearchResults: false });
    showErrorMessage(`No MET objects found for that search term(s).`);
    // console.log(
    //   "There aren't MET ObjectIDs to search for in state.recentSearchResults."
    // );
  }
};

// Gets the data for one MET objectID.
const getSingleObjectData = async (objectID) => {
  try {
    const response = await getObjectResults(objectID);
    return response;
  } catch (e) {
    // console.log('There was an error getting one of the MET objects.', e);
    showErrorMessage(e);
  } finally {
    `Finally.`;
  }
};

// Gets the data for multiple MET objectIDs sent in as an array.
// The objectIDs are sent from within pagerResults() based on that function's
// evaluation of where we are in the full set of results in the
// state.recentSearchResults array.
const getBatchOfObjectData = async (objectIDRequests = []) => {
  const promiseQueue = objectIDRequests.map((objectID) =>
    getSingleObjectData(objectID)
  );
  // Promise.all lets us wait for all of the requests for each individual MET
  // objectID to resolve/reject before continuing.
  return await Promise.all(promiseQueue);
};

// Takes in the direction of next/prev and sets values based
// on where we are in the result set (what the view is showing).
// After setting the values, calls pagerResults() to render the plan.
const pageAndRender = (direction) => {
  const state = appState.get();
  if (state.haveSearchResults) {
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
  } else {
    return false;
  }
};

// ======================================
//          UTILITY FUNCTIONS
// ======================================

// Shows an error message above the search results if there's something
// to show. If there's already an error message showing, the else statement
// handles appending a child <li> to the current list of errors. Based on the
// results from this MET API and the current state of this app, this can be
// a litany of errors.
const showErrorMessage = (error) => {
  // Check to see if there's already an error message in messages.
  if (!userMessages.hasChildNodes()) {
    // There's nothing in the #messages div right now. So, build out some
    // markup to insert into it.
    const errorDivEl = document.createElement('div');
    errorDivEl.classList.add('alert', 'alert-error');
    errorDivEl.setAttribute('role', 'alert');
    // Build the guts of it and provide the <li> for the error.
    const innerPart = `<h2>Ah, snap. There was an error!</h2><p><em>"Art is human. Error is human. Art is error."</em><br>&mdash; David Bayles, Art and Fear</p>
    <ul id="error-list"><li>${error}</li></ul>`;
    errorDivEl.innerHTML = innerPart;
    userMessages.appendChild(errorDivEl);
  } else {
    const errorListEl = document.getElementById('error-list');
    // We already have errors so let's just add to the existing <ul> by
    // creating another <li> and appending it.
    const errorItem = document.createElement('li');
    errorItem.innerText = error;
    errorListEl.appendChild(errorItem);
  }
  // Show the userMessages div.
  userMessages.classList.remove('hidden');
};

// Utility to clear the error message by clearing the content in
// userMessages (aka #messages) and then adding the .hidden class.
const clearErrorMessage = () => {
  if (!userMessages.hasChildNodes()) {
    return;
  } else {
    userMessages.innerHTML = '';
    userMessages.classList.add('hidden');
  }
};

// Send the ojbectIDsToRender data through a screener. When there's an issue getting
// the data from the /object/ endpoint in the API, the result is undefined. This is somewhat of a
// band-aid so that the other items in the pagerResults() can render and the app continues to function.
// Ideally, earlier on, we could vet the recentSearchResults array one-by-one and remove the
// MET objectIDs that aren't returning valid results from the /object/ endpoint.
const cleanDataSet = (objectIDsToRender) => {
  // console.log('before', objectIDsToRender);
  objectIDsToRender.forEach((dataSet, i) => {
    if (dataSet === undefined) {
      console.log('yes');
      // Build a dummy set to space in render. Give it an objectID of 0
      objectIDsToRender[i] = {
        objectID: '000000',
        title: `This item wasn't retrieved from the MET API.`,
      };
    }
  });
  return objectIDsToRender;
};

// Sets the pager buttons to disabled or enabled.
const setPagers = () => {
  const state = appState.get();
  const start = state.pagerIndexStart;
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
  // Pager step select.
  if (
    pagerPrevButton.getAttribute('disabled') === true &&
    pagerNextButton.getAttribute('disabled') === true
  ) {
    pagerStepSelect.setAttribute('disabled', true);
  } else {
    pagerStepSelect.removeAttribute('disabled');
  }
};

// ======================================
//          FORM VALIDATION
// ======================================
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

// ======================================
//          OBSERVER SETUP
// ======================================
const resultsContainer = new ResultsContainer();
const searchCounter = new SearchCounter();

// Subscribe to observer.
appState.subscribe(resultsContainer);
appState.subscribe(searchCounter);

// Set initial states.
resultsContainer.render(appState.get(), 'results-container');
searchCounter.render(appState.get(), 'counter');

// ======================================
//         EVENT LISTENER SETUP
// ======================================
// Set up listener for the form submit.
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrorMessage();
  // Validate the input.
  const searchInputHasData = validateFormField(searchInput);
  // If valid, remove error messages and clear recentSearchResults.
  if (searchInputHasData) {
    searchElError = document.getElementById('error');
    searchElError.innerText = '';
    const state = appState.get();
    appState.update({
      ...state,
      searchTerms: searchInput.value,
      recentSearchResults: [
        1,
      ] /* Sets dummy item so result count returns something. This temporarily suppresses the error message for appearing momentarily. */,
    });
    // Run the initial searchAndStore() using the value from the form's search input.
    searchAndStore(searchInput.value);
    // Effectively, click 'next' after results are stored to kick off the setting of where
    // we're at in the result set and also to fetch and render the recentSearchResults MET objectIDs.
    pageAndRender('next');
  }
});

pagerStepSelect.addEventListener('change', (e) => {
  state = appState.get();
  // Figure out the difference between what pager step was and what it's being
  // changed to. This could be a positive or negative integer.
  const currentDiffInPagerStep = parseInt(e.target.value) - state.pagerStep;
  appState.update({
    pagerIndexEnd: state.pagerIndexEnd + currentDiffInPagerStep,
    currentLastItemInView: state.currentLastItemInView + currentDiffInPagerStep,
    pagerStep: parseInt(e.target.value),
  });
  // Refresh the results with these new values in state.
  pagerResults();
});

pagerNextButton.addEventListener('click', () => {
  pageAndRender('next');
});

pagerPrevButton.addEventListener('click', () => {
  pageAndRender('prev');
});
