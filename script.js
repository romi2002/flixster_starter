const movieGridEl = document.querySelector('.movies-grid')
const searchForm = document.querySelector('#search')
const searchInput = document.querySelector('#search-input')
const loadMoreButton = document.querySelector('#load-more-movies-btn')
const closeSearchButton = document.querySelector('#close-search-btn')
const body = document.querySelector('body')

const apiKey = "3dacf5741241655a8002cf11b96327be" //TODO Store this as a secret
const apiUrl = `https://api.themoviedb.org/3/`

const modalEl = {
    'content': document.querySelector('#modal'),
    'title': document.querySelector('#movie-modal-title'),
    'releaseDate': document.querySelector('#movie-modal-release-date'),
    'runtime': document.querySelector('#movie-modal-runtime'),
    'genres': document.querySelector('#movie-modal-genres'),
    'video' : document.querySelector("#movie-modal-video"),
    'description': document.querySelector('#movie-modal-description'),
    'close': document.querySelector('#movie-modal-close-btn')
}

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
    <h6 class="movie-title text movie-text" id=movie-title-${movie.id}>${movie.original_title}</h6>
    <h6 class="movie-votes id=movie-votes-${movie.id} text movie-text">Vote Count: ${movie.vote_count}</h6>
    </div>`
}

async function fetchMovieVideo(id){
    return fetch(apiUrl + `movie/${id}/videos?api_key=${apiKey}`).then(response => {
        if(!response.ok){
            throw new Error(`Request to TMDB failed with status ${response.status}`)
        }

        return response.json()
    })
}

function setupYoutubePlayer(id){
    console.log(id)
    modalEl.video.src = `https://www.youtube.com/embed/${id}?&loop=1`

}

function populateMovieModal(id){
    fetch(apiUrl + `movie/${id}?api_key=${apiKey}`).then(response => {
        if(!response.ok){
            throw new Error(`Request to TMDB failed with status ${response.status}`)
        }

        return response.json()
        }).then(data => {
            modalEl.title.innerHTML = data.title
            modalEl.releaseDate.innerHTML = `Release date: ${data['release_date']}`
            modalEl.runtime.innerHTML = `${data['runtime']} minutes`
            modalEl.genres.innerHTML = `${data['genres'].map(g => g.name).join(', ')}`
            modalEl.description.innerHTML = data['overview']

            fetchMovieVideo(id).then((data) => {
                //Filter for trailer videos
                console.log(data)
                const videos = data.results.filter((video) => {
                    return video.type === "Trailer"
                })

                //Show the first video
                if(videos.length) {
                    console.log(videos)
                    setupYoutubePlayer(videos[0].key)
                    modalEl.video.classList.remove('hidden')
                } else {
                    modalEl.video.classList.add('hidden')
                }
            })

            modalEl.content.classList.remove('hidden')

            console.log(data)
            console.log(data.genres)
        });
}

function resetMovieGrid(movieGridEl){
    if (movieGridEl) movieGridEl.innerHTML = ``
}

function populateMovieGrid(movies){
    movies.forEach(movie => {
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
        if(data.results.length !== 0){
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
        searchInput.value = ''
    })

    loadMoreButton.addEventListener('click', event => {
        console.log("Load more")
        currentLoadedPage += 1
        lastLoadFunc(currentLoadedPage)
    })

    modalEl.close.addEventListener('click', event => {
        modalEl.content.classList.add('hidden')
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
        //populateMovieModal(752623)
    })
}
