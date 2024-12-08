// The search results component area.
class SearchResults extends Observer {
  buildMarkup(state) {
    return `<p>I will put data here when you write the code to do it.</p>`;
  }

  render(state, selector = 'app') {
    const markup = this.buildMarkup(state);
    const parent = document.getElementById(selector);
    parent.innerHTML = markup;
  }

  update(state) {
    this.render(state, 'search-results');
  }
}

class ResultsContainer extends Observer {
  buildMarkup(state) {
    // console.log('state here', state);
    console.log(
      'Inside ResultsContainer and buildMarkup has been called: ',
      state.metObjectDataToRender
    );
    // state.metObjectDataToRender.map((object) => {
    //   console.log(object.title);
    // });
    // return `<p>results container here.</p>`;
    // ${state.users.map(user => `<li>${user.name}</li>`).join("\n")}

    if (state.loading) {
      return 'loading data....';
    } else {
      return `<ul class="current-result-set-container">${state.metObjectDataToRender
        .map(
          (metObject) =>
            `<li class="result" id=${metObject.objectID}>
              <div class="card">
              <strong>${metObject.title}</strong><br>${metObject.objectID}<br>
              ${metObject.artistDisplayName}<br/>
            <img src=${
              metObject.isPublicDomain
                ? metObject.primaryImageSmall
                : `https://placehold.co/300x400?text=Image%20not%20available%20from%20API&font=Lato`
            } alt=${metObject.title} />
           </div>
          </li>`
        )
        .join('\n')}
    </ul>`;
    }
  }
  render(state, selector = 'current-result-set') {
    const markup = this.buildMarkup(state);
    const parent = document.getElementById(selector);
    parent.innerHTML = markup;
  }

  update(state) {
    this.render(state, 'results-container');
  }
}

// A single result art Object.

// const getsingleResultCardUI = (item) => {
//   return `<div>${item.title}</div>`;

// buildMarkup(state) {
//   return `<li>
//     <div class="card">
//       <strong>${objectID.title}</strong><br>${objectID.objectID}<br>
//       ${objectID.artistDisplayName}<br/>
//       <img src=${objectID.primaryImageSmall} alt=${objectID.title} />
//     </div>
//     </li>`;
// }

// render(state, selector = 'results-container') {
//   const markup = this.buildMarkup(state);
//   const parent = document.getElementById(selector);
//   parent.innerHTML = markup;
// }

// update(state) {
//   this.render(state, '.result');
// }
// };

// The active area of the art Object.
