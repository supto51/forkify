// https://forkify-api.herokuapp.com/v2
import "core-js/stable";
import "regenerator-runtime/runtime";
import * as model from "./model.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import bookmarkView from "./views/bookmarkView.js";
import PaginationView from "./views/paginationView.js";
import paginationView from "./views/paginationView.js";
import AddRecipeVIew from "./views/addRecipeView.js";
import addRecipeView from "./views/addRecipeView.js";

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async () => {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinier();

    //01) Update results view to mark selected search result
    resultsView.update(model.getSearchResultPage());

    //1) Loading recipe
    await model.loadRecipe(id);

    //2) Rendering recipe
    recipeView.render(model.state.recipe);

    bookmarkView.update(model.state.bookmarks);
  } catch {
    recipeView.renderError();
  }
};

const controlSearchResults = async () => {
  try {
    resultsView.renderSpinier();
    const query = searchView.getQuery();
    if (!query) return;
    await model.loadSearchResults(query);
    searchView.clearInput();

    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultPage());

    PaginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = (goToPage) => {
  resultsView.render(model.getSearchResultPage(goToPage));

  PaginationView.render(model.state.search);
};

const controlServings = (newServings) => {
  model.updateServings(newServings);

  recipeView.update(model.state.recipe);
};

const controlAddBookmark = () => {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  recipeView.update(model.state.recipe);

  bookmarkView.render(model.state.bookmarks);
};

const controlBookmarks = () => {
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async (newRecipe) => {
  try {
    addRecipeView.renderSpinier();

    await model.uploadRecipe(newRecipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarkView.render(model.state.bookmarks);

    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, 2500);
  } catch (err) {
    console.error(`${err}🔥`);
    addRecipeView.renderError(err.message);
  }
};

const init = () => {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
