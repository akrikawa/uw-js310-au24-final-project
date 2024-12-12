// ========================================
// VIEW / COMPONENTS USING OBSERVER PATTERN
// ========================================

// The search counter component. This renders and updates the message above
// the search results indicating where in the set of results the current view is
// displaying.
class SearchCounter extends Observer {
  // Builds the markup for the component, taking in the state, which provides
  // access to the state's data (variables).
  buildMarkup(state) {
    // If we have data to render and we're not currently loadint then create
    // markup with information.
    if (state.metObjectDataToRender.length > 0 && !state.loading) {
      let total = state.recentSearchResults.length;
      return `<p>Viewing <strong>${
        state.currentFirstItemInView + 1
      }</strong> through <strong>${
        state.currentLastItemInView
      }</strong> of <strong>${total}</strong> results found for <strong>${
        state.searchTerms
      }</strong>.</p>`;
      // If we don't have data or state is loading, return empty string.
    } else {
      return ``;
    }
  }

  // Takes the state and selector passed in and uses innerHTML on the selector's parent to inject
  // the markup that's created with buildMarkup().
  render(state, selector = 'search-results') {
    const markup = this.buildMarkup(state);
    const parent = document.getElementById(selector);
    parent.innerHTML = markup;
  }

  // When state updates, this gets called because SearchCounter is subscribed
  // to observe state. This passes the selector for the component we want
  // to update into the render() function. In this case 'counter'.
  update(state) {
    this.render(state, 'counter');
  }
}

// The search results component area. This sets up the container, a <ul> and then iterates
// through the result set of state.metObjectDataToRender to build each result. These are
// <li>s that are visually represented as cards.
class ResultsContainer extends Observer {
  buildMarkup(state) {
    // If state is loading, show the spinner.
    if (state.loading) {
      return `<div class="loading-results"><img src="./img/met-art-finder-4000-spinner.svg" alt="loading results..."></div>`;
    } else if (state.haveSearchResults) {
      // We have search results. Work on displaying the results.
      return `<h2 class="fade-in">Search results for ${
        state.searchTerms
      }</h2><ul class="current-result-set-container">${state.metObjectDataToRender
        .map(
          (metObject) =>
            `<li class="result fade-in" id=${metObject.objectID}>
              <div class="card">
                <img src=${
                  metObject.isPublicDomain
                    ? metObject.primaryImageSmall
                    : `https://placehold.co/300x400?text=Image%20not%20available%20from%20API&font=Lato`
                } alt=${metObject.title} />
                <div class="card-body">
                  <h3>${metObject.title}</h3>
                  <p>by ${metObject.artistDisplayName}</p>
                  <hr>
                  <div class="object-meta-data">
                    <h4>About this piece</h4>
                    <dl>
                      ${
                        metObject.objectID
                          ? `<dt>ID</dt><dd>${metObject.objectID}</dd>`
                          : ``
                      }
                      ${
                        metObject.department
                          ? `<dt>Department</dt><dd>${metObject.department}</dd>`
                          : ``
                      }
                      ${
                        metObject.medium
                          ? `<dt>Medium</dt><dd>${metObject.medium}</dd>`
                          : ``
                      }
                      ${
                        metObject.period
                          ? `<dt>Period</dt><dd>${metObject.period}</dd>`
                          : ``
                      }
                      ${
                        metObject.rightsAndReproduction
                          ? `<dt>Rights</dt><dd>${metObject.rightsAndReproduction}</dd>`
                          : ``
                      }
                      ${
                        metObject.isPublicDomain
                          ? `<dt>Public</dt><dd>${
                              metObject.isPublicDomain ? 'In public domain' : ''
                            }</dd>`
                          : ``
                      }
                    </dl>
                  </div> <!-- /.object-meta-data -->
                  <a href="${
                    metObject.objectURL
                  }" class="btn">View on MET website</a>
                </div> <!-- /.card-body -->
             </div> <!-- /.card -->
          </li>`
        )
        .join('\n')}
    </ul>`;
    } else {
      // We aren't loading and we don't have anything to show, so likely the search term didn't
      // turn anything up or we're at the beginning and a search hasn't happened yet.
      return `<div class="no-results"><p>Use the search above to see results</p></div>`;
    }
  }

  // Takes the state and selector passed in and uses innerHTML on the selector's parent to inject
  // the markup that's created with buildMarkup().
  render(state, selector = 'search-results') {
    const markup = this.buildMarkup(state);
    const parent = document.getElementById(selector);
    parent.innerHTML = markup;
  }

  // When state updates, this gets called because ResultsContainer is subscribed
  // to observe state. This passes the selector for the component we want
  // to update into the render() function. In this case 'results-container'.
  update(state) {
    this.render(state, 'results-container');
  }
}
