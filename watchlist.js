// Function to retrieve the watchlist from local storage
function getWatchlist() {
    return JSON.parse(localStorage.getItem('watchlist')) || [];
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
                        <div class="remove-btn" data-imdb-id="${filmData.imdbID}">
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

// Function to remove a movie from the watchlist
function removeFromWatchList(imdbID) {
    let watchlist = getWatchlist();
    // Use the filter method to create a new array without the specified movie ID
    watchlist = watchlist.filter(id => id !== imdbID);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    console.log(`Movie with ID ${imdbID} removed from watchlist.`);
}
//Function to render the watchlist page
async function renderWatchlistPage() {
    const watchlistContainer = document.getElementById('watchlist-welcome')
    const watchlistMovieIds = getWatchlist()
    let watchlistItemsHTML = ''
    if(watchlistMovieIds.length > 0){
        // Fetch movie details from the stored IDs
        const moviePromises = watchlistMovieIds.map(imdbID => 
            fetch(`http://www.omdbapi.com/?apikey=a1285471&i=${imdbID}`).then(res => res.json())
        );

        const movieDataList = await Promise.all(moviePromises);

        for (const movieData of movieDataList) {
            watchlistItemsHTML += renderMovieCard(movieData);
        }
    } else {
        watchlistItemsHTML = '<div class="empty-watchlist-message"><p>Your watchlist is looking empty. Add some movies!</p></div>';
    }

    watchlistContainer.innerHTML = watchlistItemsHTML;
    
    // Add event delegation for "remove" buttons on this page

    //This listens for clicks on the parent container, which is more efficient
    watchlistContainer.addEventListener("click", (e)=>{
        const clickedButton = e.target.closest('.remove-btn')
        if (clickedButton && clickedButton.dataset.imdbId){
            const imdbID = clickedButton.dataset.imdbId
            //Call the removal function
            removeFromWatchList(imdbID)
            //Re-render the page to update the list after a movie is removed
            renderWatchlistPage()
        }
    })
    }

    //Render the watchlist when the page loads
    document.addEventListener('DOMContentLoaded', renderWatchlistPage)