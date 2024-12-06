window.onload = () => {
  // Elements.
  const searchInput = document.getElementById('search');
  const searchForm = document.getElementById('search-form');
  const resultsEl = document.getElementById('results');

  // application state.
  const appState = new State();
  const searchResults = new SearchResults();

  // Documenting what things we'll have appState hold.
  /*
    recentSearchResults - the MET objectIDs from the most recent search
    renderedIndexStart
    renderedIndexEnd
    metObjectDataToRender - the MET object data for a batch of objects ready to render
  */

  // Subscribe to observer.
  appState.subscribe(searchResults);

  // Set initial states.
  searchResults.render(appState.get(), 'search-results');

  // Calls the api-client running the search endpoint.
  // Takes resultant objectIDs and stores them in application state.
  const searchAndStore = async (queryParams = 'sunflower') => {
    await getSearchResults(queryParams).then((res) => {
      appState.update({
        recentSearchResults: res.objectIDs,
        renderedIndexStart: 0,
        renderedIndexEnd: 5,
      });
    });
    appState.update({ metObjectDataToRender: true });
  };

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('value', searchInput.value);
    searchAndStore(searchInput.value);
  });

  const pagerResults = (direction) => {
    let start = appState.get().renderedIndexStart;
    let end = appState.get().renderedIndexEnd;
    let total = appState.get().recentSearchResults.length;
  };

  const getBatchOfObjects = async () => {
    // Get the data for this stuff.
    let start = appState.get().renderedIndexStart;
    let end = appState.get().renderedIndexEnd;
    let objectIDsToRender = appState
      .get()
      .recentSearchResults.slice(start, end);
    // console.log('objectIDsToRender', objectIDsToRender);

    // Iterate through these getting their data. And for now,
    // just render something so we know it's working. Later maybe I store this all.
    let output = [];
    const getem = async () => {
      objectIDsToRender.forEach((objectID) =>
        output.push(getSingleObject(objectID))
      );
      await appState.update('objectIDsToRender', output);
    };
    await getem();
  };

  const getSingleObject = async (objectID) => {
    return await getObjectResults(objectID);
    // return returnObject.isPublicDomain ? returnObject : false;
  };
  // const renderSet = (objectResults) => {};

  // Utilities.
  const showErrorMessage = (e) => {
    resultsEl.innerHTML = `<div class="alert alert-danger"><h3>An error occurred</h3><p>${e}<p></div>`;
  };

  // renderSingleObjectUI('10431');
};
