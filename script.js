const movieGridEl = document.querySelector('.movies-grid')
const searchForm = document.querySelector('#search')
const searchInput = document.querySelector('#search-input')
const loadMoreButton = document.querySelector('#load-more-movies-btn')
const closeSearchButton = document.querySelector('#close-search-btn')
const body = document.querySelector('body')

const apiKey = "3dacf5741241655a8002cf11b96327be" //TODO Store this as a secret
const apiUrl = `https://api.themoviedb.org/3/`

let imageUrl = ``
let currentLoadedPage = 0;
let movieCards = ``

async function fetchTMBDConfig(){
    return fetch(apiUrl + `/configuration?api_key=${apiKey}`);
}

/**
 * Takes in a single movie, and creates a new movie card in the movie grid
 * @param {Movie} movie - Contains movie data
 * @returns
 */
function addMovieToMovieGrid(movie){
    //TODO actually get data from movie
    if(movie.poster_path == null) return;
    movieGridEl.innerHTML += `<div class="movie-card container column">
    <img class="movie-poster" src="${imageUrl}/w200/${movie.poster_path}" id=movie-img-${movie.id} alt="">
    <h6 class="movie-title text" id=movie-title-${movie.id}>${movie.original_title}</h6>
    <h6 class="movie-votes id=movie-votes-${movie.id} text">Vote Count: ${movie.vote_count}</h6>
    </div>`
}

function populateMovieModal(id){
    fetch(apiUrl + `movie/${id}?api_key=${apiKey}`).then(response => {
        if(!response.ok){
            throw new Error(`Request to TMDB failed with status ${response.status}`)
        }

        return response.json()
        }).then(data => {
            console.log(data)
        });
}

function resetMovieGrid(movieGridEl){
    if (movieGridEl) movieGridEl.innerHTML = ``
}

function populateMovieGrid(movies){
    movies.forEach(movie => {
        console.log(movie)
        addMovieToMovieGrid(movie)
    });

    let cards = document.querySelectorAll(".movie-poster")
    cards.forEach(card => {
        card.addEventListener('click', (event) => {
            const id = event.target.id.split('-')[2]
            console.log(id)
            populateMovieModal(id)
        })
    });
}

function populateWithPopularMovies(page){
    lastLoadFunc = populateWithPopularMovies
    currentLoadedPage = page
    fetch(apiUrl + `movie/popular?api_key=${apiKey}&language=en-US&page=${page}`).then(response => {
        if(!response.ok){
            throw new Error(`Request to TMDB failed with status ${response.status}`)
        }
        return response.json()
    }).then(data => {
        populateMovieGrid(data.results)
    })
}

function searchAndPopulateMovies(query, page){
    lastLoadFunc = (page) => {
        searchAndPopulateMovies(query, page)
    }
    currentLoadedPage = page

    //TODO sanitize query
    fetch(apiUrl + `search/movie?api_key=${apiKey}&language=en-US&page=${page}&query=${query}&include_adult=false`).then(response => {
        if(!response.ok){
            throw new Error(`Request to TMBD failed with status ${response.status}`)
        }
        return response.json()
    }).then(data => {
        console.log(data.results)
        if(data.results.length != 0){
            populateMovieGrid(data.results)
        }
        //TODO Handle empty grid!
    })
}

window.onload = function () {
    //TODO get movie data
    //populateMovieGrid([1,2,2,1,1,1,1,1,1,1,1])
    searchForm.addEventListener('submit', event => {
        event.preventDefault()
        if(searchInput.value == '') return;
        resetMovieGrid(movieGridEl)
        searchAndPopulateMovies(searchInput.value, 1)
        //event.preventDefault()
    })

    closeSearchButton.addEventListener('click', event => {
        console.log("Clearing search")
        resetMovieGrid(movieGridEl)
        populateWithPopularMovies(1)
    })

    loadMoreButton.addEventListener('click', event => {
        console.log("Load more")
        currentLoadedPage += 1
        lastLoadFunc(currentLoadedPage)
    })

    fetchTMBDConfig().then(response => {
        if(!response.ok){
            throw new Error(`Request to TMDB failed with status ${response.status}`)
        }
        return response.json()
    }).then(data => {
        imageUrl = data.images.secure_base_url
    }).then(data => {
        populateWithPopularMovies(1)
    })
}
