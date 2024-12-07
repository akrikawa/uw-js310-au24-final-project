// Objects: https://collectionapi.metmuseum.org/public/collection/v1/objects can add params like dept id */
/* One object: https://collectionapi.metmuseum.org/public/collection/v1/objects/[objectID] */

/* Departments: https://collectionapi.metmuseum.org/public/collection/v1/departments */
/* Search: https://collectionapi.metmuseum.org/public/collection/v1/search */
// Constants.
const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/';
const OBJECT_STUB = 'objects/';
const DEPT_STUB = 'departments/';
const SEARCH = 'search';

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
      // Fetch promise resolved but there a failed HTTP status (aka not 'ok').
      throw new Error(response.status);
    }
  } catch (e) {
    console.log('Error getting data from the API.', e);
    // Send this error to the DOM.
    // showErrorMessage(e);
  } finally {
    console.log('Finished attempting to retrieve data.');
  }
};

const getSearchResults = (queryParams) => {
  const path = `search?hasImages=true&q=${queryParams}`;
  return request(path);
};

const getObjectResults = (objectID) => {
  const path = `objects/${objectID}`;
  return request(path);
};
