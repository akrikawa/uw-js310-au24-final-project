// The search counter component.
class SearchCounter extends Observer {
  buildMarkup(state) {
    if (state.metObjectDataToRender.length > 0 && !state.loading) {
      let total = state.recentSearchResults.length;
      return `<p>Viewing ${state.currentFirstItemInView + 1} through ${
        state.currentLastItemInView
      } of <strong>${total}</strong> results found. </p>`;
    } else {
      return ``;
    }
  }

  render(state, selector = 'search-results') {
    const markup = this.buildMarkup(state);
    const parent = document.getElementById(selector);
    parent.innerHTML = markup;
  }

  update(state) {
    this.render(state, 'counter');
  }
}

// The search results component area.
class ResultsContainer extends Observer {
  buildMarkup(state) {
    // console.log(
    //   'Inside ResultsContainer and buildMarkup has been called: ',
    //   state.metObjectDataToRender
    // );
    if (state.loading) {
      return `<div class="loading-results"><img src="./img/met-art-finder-4000-spinner.svg"></div>`;
    } else if (state.haveSearchResults) {
      return `<ul class="current-result-set-container">${state.metObjectDataToRender
        .map(
          (metObject) =>
            `<li class="result" id=${metObject.objectID}>
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
      return `<div class="no-results"><p>Use the search above to see results</p></div>`;
    }
  }
  render(state, selector = 'search-results') {
    const markup = this.buildMarkup(state);
    const parent = document.getElementById(selector);
    parent.innerHTML = markup;
  }

  update(state) {
    this.render(state, 'results-container');
  }
}
