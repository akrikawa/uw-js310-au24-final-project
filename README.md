# MET Art Finder 4000
The MET Art Finder 4000 allows a user to conduct a search for items in the MET Art Museum's collection via the Metropolicatn Museum of Art Collection API. Item images and metadata are displayed to the user upon successful search.

[Installation](#installation) | [Entry + initial calls](#entry-point-and-initial-calls) | [API calls](#api-calls) | [File structure](#file-structure) | [Approach and challenges](#approach-and-challenges) | [Roadmap](#roadmap)

## Installation
Download the repo open `met-search.html` in your browser. 
* There aren't any dependencies that need to be installed. 
* The API endpoints are [free to use](https://www.metmuseum.org/about-the-met/policies-and-documents/open-access).
* There is no API key needed. [The Metropolitan Museum of Art Collection API documentation](https://metmuseum.github.io/)

## Under the hood
### Entry point and initial calls
The main entry point is `met-search.js`. Initial DOM elements are provided in `met-search.html`. `met-search.js` kicks things off by adding event listeners for:
* Search form's submit button
* Next and Previous buttons
* Select list for number items to show at a time

#### Submitting the form
These steps assume a scenario where all goes well and there are no errors.
* `searchAndStore(queryParams)` gets called on form submit via a listener. 
  * After initial clearing and set up, sends the queryParams value to an API call. 
  * If successful, the API returns an array of MET objectIDs.
  * State gets updated with these MET objectIDs in `state.recentSearchResults`
  * At this point, we have the MET objectIDs that relate to the search term(s), but that's it. We need more info to be able to render anything.
  * `pagerResults()` gets called at end of `searchAndStore(queryParams)` to help us get more data and render

* `pagerResults()` is a utility that asseses conditions and decides what to do (was search successful?, where are we in the set of results?, what MET objectIDs do we need to retrieve full data for?)
  * If all is good, then the function reaches out to `getBatchOfObjectData(objectIDsToRender)` sending it an array of MET objectIDs representing what we want to render next.
  * If successful, it sets state accordingly; notable is setting `state.metObjectDataToRender` with an array of object literals with all the data available from the API for each MET objectID
  * Since we have an observer set up on the `#results-container` div, when state is updated, the results will render. Rendering happens in the ResultsContainer class in `met-search-results.js`
* `getBatchOfObjectData(objectIDRequests)` takes in an array of objectIDRequests and makes an API call for each using `getSingleObjectData(objectID)`.
  * All of the child requests are stored `promiseQueue` and that queue is passed into a `Promise.all()` request. This is so the app waits for all of the promises to complete before moving on to rendering.

#### Next, Previous, Select for number of items to view
These have event listeners on them. 
* The previous and next button listeners reach out to `pageAndRender(direction)` sending in which direction we're paging in.
  * `pageAndRender(direction)` figures out where we are in the full set and also in the current view what is the first and last shown. Then it calls `pagerResults()`.
* The select element listener assess the difference between new value and `state.pagerStep` (the previous value as we haven't update state yet) and then sets state values. Then it calls `pagerResults()`.

### API calls
API fetch calls are in `api-client.js`. There's one main fetch `request(path)` that can be called for different endpoints. This consolidates response and error handling.
* `getSearchResults(queryParameters)` - calls the request for the given queryParameters (like the search term(s) entered in the search input field)
* `getObjectResults(objectID)` - calls the request for MET object data for the given objectID

No API is needed for this API and it's currently free to use.

### File structure
* api-client.js - _fetch calls to the MET Museum API._
* met-search-results.js - _listens and renders components_
* met-search.css - _styles_
* met-search.js - _main entry point and central file to the app_
* met-search.spec.js - _tests_
* met-state.js - _classes for state (Subject, State, Observer)_
* img/ - _images for the project_
  * met-art-finder-4000-logo.svg
  * met-art-finder-4000-spinner.svg
* lib/ - _testing library taken wholesale as-is (no install needed)_
  *  jasmine-3.5.0/ 
    

## Approach and challengess
### Aproach
I wanted to creat an app that reaches out to an API and renders results in a grid. The user could then act in some way on those results. For the Metropolicatn Museum of Art Collection API, I thought having the user be able to save favorites would be great.

Reaching out to the /search/ endpoint was straightforward. When I realized what comes back is an array if objectIDs only, I knew I would need to store that somewhere. I could have done this with localStorage, but wanted to explore a vanilla JS way of managing state (and also not use global variables to do it).

This is where I ended up finding the Observer pattern and decided to implement it using the [base code](https://gist.github.com/efuller/6ca1739e5f4ea25b740d0fb0a7c91fa7#file-observer-js
) I found via [an article I read](https://webdevstudios.com/2019/02/19/observable-pattern-in-javascript/) as a model to follow.

### Challenges
Along the way I was able to readily get objectID results from the /object/ endpoint, but sending in multiple requests in one call didn't seem possible via the API. So, I built the queue-ed approach. It didn't work well at first. The app would proceed before all of the individual calls to the /object/ endpoint were complete. I would console.log the results and see that there were Promises returned, some with data and some not yet with data.

I troubleshooted by stepping through all my async / await usages. And once those were legit and cleaned up, I realized in `getBatchOfObjectData(objectIDRequests)` at that time, I wasn't getting everything resolved before the program would continue. This got sorted via a ton of console.log work and ultimately figuring out how to write tests for this. 

So, +1 for testing. I have much more to learn there. I remembered Promise.all being a "thing" but went back to our class slides and did some research. Once I landed on the Promise.all approach things started moving along nicely.

I would say I spent 80% of my time on the plumbing for this (the API calls, queue-ing my requests with Promise.all, and the pager functions) and 20% on the rendering side (HTML and decided what to include in each card, CSS too).

Last, I wrote all of the CSS. I also quickly created the logo and animated SVG spinner.

## Roadmap
What I'd like to do next:
* One of my tests doesn't pass. I want to fix the test or fix the app so that I can test for when the API returns bad info.
* Add a feature allowing a user to select items as favorites, then persis that data in localStorage.
* Provide a way for a user to see their favorites, reading in the data from localStorage.
* Continue improving the UI a bit.
* Condense the card data and provide a way to open a modal with a larger image and all the MET ID Object data we want to see.
* Indicators for favorites and something from the MET API data called isHighlight.
* Explore other ways to reach the API (like by department).
* Handle issues with the discrepancies between the objectIDs returned by the /search/ endpoint and the /object/ endpoint.