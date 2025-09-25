const searchBtn = document.getElementById("search-btn");
const searchField = document.getElementById("search-field");
const searchResult = document.getElementById("welcome");


// Function to retrieve the watchlist from local storage
function getWatchlist() {
    return JSON.parse(localStorage.getItem('watchlist')) || [];
}

// Function to add or remove a movie from the watchlist
function addToWatchList(imdbID) {
    let watchlist = getWatchlist();
    if (!watchlist.includes(imdbID)) {
        watchlist.unshift(imdbID);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        console.log(`Movie with ID ${imdbID} added to watchlist.`);
    }
    else {
        // This handles removing a movie if it's already in the list
        watchlist = watchlist.filter(id => id !== imdbID);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        console.log(`Movie with ID ${imdbID} removed from watchlist.`);
    }
}

// Function to render a single movie card
function renderMovieCard(filmData){
    // Determine the text and icon for the watchlist button based on whether the movie is already in the watchlist
    const watchlist = getWatchlist();
    const isInWatchlist = watchlist.includes(filmData.imdbID);
    const buttonText = isInWatchlist ? 'Remove' : 'Watchlist';
    const iconClass = isInWatchlist ? 'fa-circle-minus' : 'fa-circle-plus';

    return `
        <div class="movie-card">
            <div class="poster">
                <img src="${filmData.Poster}" alt="${filmData.Title} Poster">
            </div>
            <div class="movie-info">
                <div class="header">
                    <div class="title">
                        <h2>${filmData.Title}</h2>
                        <i class="fa-solid fa-star"></i>
                        <p>${filmData.imdbRating}</p>
                    </div>
                     <div class="genre">
                        <p>${filmData.Runtime}</p>
                        <p>${filmData.Genre}</p>
                        <div class="watchlist-btn" data-imdb-id="${filmData.imdbID}">
                            <i class="fa-solid ${iconClass}"></i>
                            <p>${buttonText}</p>
                        </div>
                    </div>
                </div>
                <div class="description">
                    <p>${filmData.Plot}</p>
                </div>
            </div>
        </div>
    `;
}


// Event listener for the Search button
searchBtn.addEventListener("click", async(e) => {
    e.preventDefault();
    const response = await fetch(`http://www.omdbapi.com/?apikey=a1285471&s=${searchField.value}`);
    const data = await response.json();
    
    if (data.Response === "True") {
        let movieList = '';
        const movieListPlaceHolder = data.Search.map(info => info.imdbID);

        // Fetch details for each movie in parallel to improve performance
        const moviePromises = movieListPlaceHolder.map(imdbID => 
            fetch(`http://www.omdbapi.com/?apikey=a1285471&i=${imdbID}`).then(res => res.json())
        );

        const movieDataList = await Promise.all(moviePromises);

        for (const movieData of movieDataList) {
            movieList += renderMovieCard(movieData);
        }
        searchResult.innerHTML = movieList;
    } else {
        searchResult.innerHTML = `<p class="empty-watchlist-message">${data.Error}</p>`;
    }
});

// Event listener on the search results container for event delegation
searchResult.addEventListener("click", (e) => {
    const clickedWatchlist = e.target.closest(".watchlist-btn");
    if (clickedWatchlist && clickedWatchlist.dataset.imdbId) {
        const imdbID = clickedWatchlist.dataset.imdbId;
        addToWatchList(imdbID);
        // Re-render the cards to update the button state
        // This is a simple but effective way to refresh the view
        searchBtn.click(); 
    }
});
