const listElement = document.querySelector("#list");
const divButtonSection = document.querySelector("#pagination");
const filtersSection = document.querySelector("#filterType");

const baseListUrl = "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=20";

function renderPokemons(pokemons) {
  listElement.innerHTML = pokemons
    .map(pokemon => {
      return `
            <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="card mb-4 shadow-sm text-center">
                    <div class="card-body">
                        <div>Name: ${pokemon.name}</div>
                        <button id="button-more-${pokemon.name}" class="button-more btn btn-outline-primary pokemon-color" data-url="${pokemon.url}">Show more</button>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}
function renderPagination(pagination) {
  divButtonSection.innerHTML = `
        <button class="previousPageButton btn white-background hover-pokemon-color" data-url="${pagination.previous}">Previous</button>
        <button class="nextPageButton btn white-background hover-pokemon-color" data-url="${pagination.next}">Next</button>
    `;

  if (pagination.previous == null) {
    divButtonSection.querySelector(".previousPageButton").disabled = true;
  }
}

function renderList(data) {
  renderPokemons(data.results);
  renderPagination({
    next: data.next,
    previous: data.previous
  });
}

function renderPokemonDetails(itemResult, rootElement) {
  const details = document.createElement("div");
  details.id = `pokemon-details-${itemResult.name}`;

  const htmlString = `
        <hr />
        <img class="image" src=${itemResult.image}>
        <p class="pok_type">Type: ${itemResult.type}</p>
        <div class="details">
            <span class="height">Height: ${itemResult.height},</span>
            <span class="weight">Weight: ${itemResult.weight}</span>
        </div>
        <hr />
        <button class="button-hide btn btn-outline-secondary" data-name="${itemResult.name}">Hide details</button>
    `;

  details.innerHTML = htmlString;

  rootElement.appendChild(details);
}

function mapPokemonDetails(result) {
  return {
    name: result.name,
    image: result.sprites["front_default"],
    type: result.types.map(type => type.type.name).join(", "),
    id: result.id,
    height: result.height,
    weight: result.weight
  };
}

function handleFilterChange(e) {
  if (e.target.value === "0") {
    fetchPokemons({ url: baseListUrl, onSuccess: renderList });

    divButtonSection.classList.remove("disappear");
  } else {
    const typeUrl = `https://pokeapi.co/api/v2/type/${e.target.value}`;

    fetchPokemons({
      url: typeUrl,
      onSuccess: data => {
        const pokemons = data.pokemon.map(result => result.pokemon);
        renderPokemons(pokemons);
      }
    });

    divButtonSection.classList.add("disappear");
  }
}

function toggleShowMoreButton(pokemonName) {
  const showMoreButton = listElement.querySelector(`#button-more-${pokemonName}`);
  showMoreButton.classList.toggle("disappear");
}

function handleDetailsClick(e) {
  if (!e.target.matches("button")) {
    return;
  }

  if (e.target.matches(".button-more")) {
    fetchPokemons({
      url: e.target.dataset.url,
      onSuccess: data => {
        const mappedDetails = mapPokemonDetails(data);
        renderPokemonDetails(mappedDetails, e.target.parentElement);
        toggleShowMoreButton(mappedDetails.name);
      }
    });
    return;
  }

  if (e.target.matches(".button-hide")) {
    const pokemonName = e.target.dataset.name;

    document.getElementById(`pokemon-details-${pokemonName}`).remove();
    toggleShowMoreButton(pokemonName);
  }
}

function handlePaginationClick(e) {
  const url = e.target.dataset.url;

  if (url == null) {
    return;
  }

  fetchPokemons({
    url,
    onSuccess: renderList
  });

  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

function fetchPokemons({ url, onSuccess, onError = console.error }) {
  fetch(url)
    .then(json => json.json())
    .then(data => onSuccess(data))
    .catch(error => onError(error));
}

listElement.addEventListener("click", handleDetailsClick);
divButtonSection.addEventListener("click", handlePaginationClick);
filtersSection.addEventListener("change", handleFilterChange);

fetchPokemons({ url: baseListUrl, onSuccess: renderList });