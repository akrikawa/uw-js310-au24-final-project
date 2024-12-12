// ========================================
//        API DOCUMENTATION
// ========================================
// Documentation for API: https://metmuseum.github.io/

// Objects: https://collectionapi.metmuseum.org/public/collection/v1/objects can add params like dept id */
// One object: https://collectionapi.metmuseum.org/public/collection/v1/objects/[objectID] */
// Departments: https://collectionapi.metmuseum.org/public/collection/v1/departments */
// Search: https://collectionapi.metmuseum.org/public/collection/v1/search */

// ========================================
//                 SET UP
// ========================================

// Constants.
const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/';

// ========================================
//            CORE FETCH REQUEST
// ========================================

// Fetch request with repsonse and error captures. We use this more than once.
const request = async (path) => {
  let url = BASE_URL + path;
  try {
    const response = await fetch(url);
    const data = await response.json();
    // Check to see if the response is ok.
    if (response.ok) {
      // Fetch promise resolved and we can continue grabbing data from the response.
      // console.log(data);
      return data;
    } else {
      // Fetch promise resolved, but there is a failed HTTP status (aka not 'ok').
      // Explicitly setting an error for 404 error. These are commone with this API. Object IDs are provided
      // at the search endpoint, but when seeking the objects endpoint for an objectID, the results vary. Often
      // it returns a 404.
      if (response.status === 404) {
        throw new Error(
          `There was a ${response.status} error of ${response.statusText} when trying to get ${response.url}.`
        );
      } else {
        throw new Error(response.status);
      }
    }
  } catch (e) {
    console.log('Error getting data from the API.', e);
    // Send this error to the DOM.
    showErrorMessage(e);
  } finally {
    // Logging that the fetch request completed regardless of outcome.
    console.log('Finished attempting to retrieve data.');
  }
};

// ========================================
//    CALLS TO THE CORE FETCH REQUEST
// ========================================

// Calls the API via the common fetch request to get the search results for a query (in the case of current app, it's a keyword).
const getSearchResults = (queryParams) => {
  const path = `search?hasImages=true&isPublicDomain=true&q=${queryParams}`;
  return request(path);
};

// Calls the API via the common fetch request to get MET Object data response by MET objectID.
const getObjectResults = (objectID) => {
  const path = `objects/${objectID}`;
  return request(path);
};
