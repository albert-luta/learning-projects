import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";

/** Global state of the app
 *  - Search object
 *  - Current recipe object
 *  - Shopping List object
 *  - Liked recipes
 */
const state = {};
window.state = state;

const controlSearch = async () => {
	const query = searchView.getInput();

	if (query) {
		state.search = new Search(query);

		searchView.clearInput();
		searchView.clearResults();
		renderLoader(elements.searchRes);

		try {
			await state.search.getResults();

			clearLoader();
			searchView.renderResults(state.search.result);
		} catch (erro) {
			console.log(error);
			clearLoader();
		}
	}
};

elements.searchForm.addEventListener("submit", e => {
	e.preventDefault();

	controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
	const btn = e.target.closest(".btn-inline");

	if (btn) {
		const goToPage = parseInt(btn.dataset.goto);
		searchView.clearResults();
		searchView.renderResults(state.search.result, goToPage);
	}
});

const controlRecipe = async () => {
	const id = window.location.hash.replace("#", "");

	if (id) {
		recipeView.clearRecipe();
		renderLoader(elements.recipe);

		if (state.search) searchView.highlightSelected(id);

		state.recipe = new Recipe(id);

		try {
			await state.recipe.getRecipe();
			state.recipe.parseIngredients();

			state.recipe.calcTime();
			state.recipe.calcServings();

			clearLoader();
			recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
		} catch (error) {
			console.log(error);
		}
	}
};

["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));

const controlList = () => {
	if (!state.list) state.list = new List();

	state.recipe.ingredients.forEach(el => {
		const item = state.list.addItem(el.count, el.unit, el.ingredient);

		listView.renderItem(item);
	});
};

elements.shopping.addEventListener("click", e => {
	const id = e.target.closest(".shopping__item").dataset.itemid;

	if (e.target.matches("shopping__delete, .shopping__delete *")) {
		state.list.deleteItem(id);
		listView.deleteItem(id);
	} else if (e.target.matches(".shopping__count-value")) {
		const val = parseFloat(e.target.value);

		state.list.updateCount(id, val);
	}
});

if (!state.likes) state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = () => {
	if (!state.likes) state.likes = new Likes();
	const currentId = state.recipe.id;

	if (!state.likes.isLiked(currentId)) {
		const newLike = state.likes.addLike(currentId, state.recipe.title, state.recipe.author, state.recipe.img);

		likesView.toggleLikeBtn(true);
		likesView.renderLike(newLike);
	} else {
		state.likes.deleteLike(currentId);
		likesView.toggleLikeBtn(false);
		likesView.deleteLike(currentId);
	}
	likesView.toggleLikeMenu(state.likes.getNumLikes());
};

elements.recipe.addEventListener("click", e => {
	if (e.target.matches(".btn-decrease, .btn-decrease *")) {
		if (state.recipe.servings > 1) {
			state.recipe.updateServings("dec");
			recipeView.updateServingsIngredients(state.recipe);
		}
	} else if (e.target.matches(".btn-increase, .btn-increase *")) {
		state.recipe.updateServings("inc");
		recipeView.updateServingsIngredients(state.recipe);
	} else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
		controlList();
	} else if (e.target.matches(".recipe__love, .recipe__love *")) {
		controlLike();
	}
});

window.l = new List();
