const cl = console.log

const movie = document.getElementById('movie')
const movieName = document.getElementById('movieName')
const movieImg = document.getElementById('movieImg')
const movieGenre = document.getElementById('movieGenre')
const addMovieBtn = document.getElementById('addMovieBtn')
const movieRating = document.getElementById('movieRating')
const movieDescription = document.getElementById('movieDescription')
const updateBtn = document.getElementById('updateBtn')
const addBtn = document.getElementById('addBtn')
const formClose =document.querySelectorAll('.formClose')
const spinner = document.getElementById('spinner')
const backDrop = document.getElementById('backDrop')
const movieForm = document.getElementById('movieForm')

const BASE_URL ='https://xhrcurd-default-rtdb.asia-southeast1.firebasedatabase.app/'
const MOVIE_URL=`${BASE_URL}/movies.json`

//spinner
function handleSpinner(flag){
    if(flag){
        spinner.classList.remove('d-none')
    }else{
        spinner.classList.add('d-none')
    }
}

//SnackBar
function snackBar(msg,icon){
    Swal.fire({
        title:msg,
        icon:icon,
        timer:3000
    })
}



//Local State
let state={
    moviesArr:[],
    editId:null
}

//Rating
function setRating(rating) {
  if (rating > 7) {
    return "badge-success";
  } else if (rating > 5) {
    return "badge-warning";
  } else {
    return "badge-danger";
  }
}

function makeApiCall(url,methodName,body){
    return fetch(url,{
        method:methodName,
        body:body?JSON.stringify(body):null,
        headers:{
            "content-type":"application/json",
            "auth":"JWT Token"
        }
    })
    .then(res=>{
        if(!res.ok){
            throw new Error("API Error")
        }
        return res.json()
    })
}

//Read

function fetchMovie(){
    handleSpinner(true)
    makeApiCall(MOVIE_URL,"GET")
    .then(data=>{
        for(const key in data){
            data[key].id = key;
            state.moviesArr.unshift(data[key])
        }
        renderMovie(state.moviesArr);
    })
    .catch(err=>{
        snackBar('something went wrong while fetching the data','error')
    })
    .finally(()=>{
        handleSpinner(false)
    })
}
fetchMovie()

function renderMovie(arr){
    let result =``;
    arr.forEach(movie=>{
        result +=`
            <div class="col-md-4 mb-3" id="${movie.id}">
                <div class="card movieCard">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h4 class="m-0">${movie.movieName}</h4>
                            </div>
                            <div class="col-2">
                                <h5 class="m-0"><span class="badge ${setRating(movie.movieRating)}">${movie.movieRating}</span></h5>
                            </div>
                        </div>
                    </div>
                    <div class="card-body py-0">
                        <figure class="m-0">
                            <img src="${movie.movieImg}" title="${movie.movieName}"  alt="${movie.movieName}">
                            <figcaption>
                                <h5>${movie.movieName}</h5>
                                <p>${movie.movieDescription}</p>
                            </figcaption>
                        </figure>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button onClick="onEditmovie(this)" class="btn btn-sm net-sec-btn" type="button">Edit</button>
                        <button onClick="onDeletemovie(this)" class="btn btn-sm net-pri-btn" type="button">Remove</button>
                    </div>
                </div>
            </div>`
    })
    const movieContainer = document.getElementById('movieContainer')
    movieContainer.innerHTML=result;

}

//create

function oncreateMovieCard(eve){
    eve.preventDefault()

    let movieObj={
        movieName:movieName.value,
        movieImg:movieImg.value,
        movieRating:movieRating.value,
        movieGenre:movieGenre.value,
        movieDescription:movieDescription.value
    }
    handleSpinner(true)
    makeApiCall(MOVIE_URL,"POST",movieObj)
    .then(data=>{
        movieObj.id = data.name;
        state.moviesArr.unshift(movieObj);
        let col = document.createElement('div')
        col.className='col-md-4 mb-3'
        col.id = movieObj.id
        col.innerHTML=`
            <div class="card movieCard">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h4 class="m-0">${movieObj.movieName}</h4>
                            </div>
                            <div class="col-2">
                                <h5 class="m-0"><span class="badge ${setRating(movieObj.movieRating)}">${movieObj.movieRating}</span></h5>
                            </div>
                        </div>
                    </div>
                    <div class="card-body py-0">
                        <figure class="m-0">
                            <img src="${movieObj.movieImg}" title="${movieObj.movieName}"  alt="${movieObj.movieName}">
                            <figcaption>
                                <h5>${movieObj.movieName}</h5>
                                <p>${movieObj.movieDescription}</p>
                            </figcaption>
                        </figure>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button onClick="onEditmovie(this)" class="btn btn-sm net-sec-btn" type="button">Edit</button>
                        <button onClick="onDeletemovie(this)" class="btn btn-sm net-pri-btn" type="button">Remove</button>
                    </div>
                </div>`
        const movieContainer = document.getElementById('movieContainer')
        movieContainer.prepend(col)
        onToggleMovie()
        snackBar(`The new movie ${movieObj.movieName} is added successfully`,'success')
    })
    .catch(err=>{
        snackBar('Something went wrong while creating the data','error')
    })
    .finally(()=>{
        handleSpinner(false)
    })
}

//Delete

function onDeletemovie(ele){
    let deleteId = ele.closest('.col-md-4').id

    Swal.fire({
        title: "Are you sure?",
        text: `You want to delete employee ID ${deleteId}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel"
    })
        .then(function (result) {
            if (result.isConfirmed) {
                handleSpinner(true)
                let DELETE_URL =`${BASE_URL}/movies/${deleteId}.json`
                makeApiCall(DELETE_URL,"DELETE")
                .then(data=>{
                    let getIndex = state.moviesArr.findIndex(t => t.id === deleteId)
                    state.moviesArr.splice(getIndex, 1)
                    ele.closest('.col-md-4').remove()
                    snackBar(`This id ${deleteId} is deleted successfully`,'success')
                })
            }
        })
        .catch(err=>{
            snackBar('something went wrong while deleting the data','error')
        })
        .finally(()=>{
            handleSpinner(false)
        })
}

//Edit

function onEditmovie(ele){
    let editId = ele.closest('.col-md-4').id
    state.editId = editId

    let EDIT_URL = `${BASE_URL}/movies/${editId}.json`
    handleSpinner(true)
    makeApiCall(EDIT_URL,"GET")

    .then(data=>{
        const addMovie = document.getElementById('addMovie')
        onToggleMovie()

        movieName.value = data.movieName
       movieGenre.value = data.movieGenre
        movieRating.value = data.movieRating
        movieDescription.value = data.movieDescription
        movieImg.value = data.movieImg

        addMovie.innerHTML ='Update Movie'

        addBtn.classList.add('d-none')
        updateBtn.classList.remove('d-none')

    })
    .catch(err=>{
        snackBar('something went wrong while patching the data','error')
    })
    .finally(()=>{
        handleSpinner(false)
    })
}

//Update

function updateMovie(){
    let updateId = state.editId

    state.editId = null

    let updateObj={
        movieName:movieName.value,
        movieGenre:movieGenre.value,
        movieImg:movieImg.value,
        movieDescription:movieDescription.value,
        movieRating:movieRating.value,
        id:updateId
    }
    handleSpinner(true)
    let UPDATE_URL =`${BASE_URL}/movies/${updateId}.json`

    makeApiCall(UPDATE_URL,"PATCH",updateObj)
    .then(data=>{
        let getIndex = state.moviesArr.findIndex(t => t.id === updateId)
        state.moviesArr[getIndex]=updateObj

        let form = document.getElementById(updateId)
        form.innerHTML =`
            <div class="card movieCard">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h4 class="m-0">${updateObj.movieName}</h4>
                            </div>
                            <div class="col-2">
                                <h5 class="m-0"><span class="badge ${setRating(updateObj.movieRating)}">${updateObj.movieRating}</span></h5>
                            </div>
                        </div>
                    </div>
                    <div class="card-body py-0">
                        <figure class="m-0">
                            <img src="${updateObj.movieImg}" title="${updateObj.movieName}"  alt="${updateObj.movieName}">
                            <figcaption>
                                <h5>${updateObj.movieName}</h5>
                                <p>${updateObj.movieDescription}</p>
                            </figcaption>
                        </figure>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button onClick="onEditmovie(this)" class="btn btn-sm net-sec-btn" type="button">Edit</button>
                        <button onClick="onDeletemovie(this)" class="btn btn-sm net-pri-btn" type="button">Remove</button>
                    </div>
                </div>`
        onToggleMovie()
        snackBar(`The movie ${updateObj.movieName} is updated successfully`,'success')
    })
    .catch(err=>{
        snackBar('Something went wrong while updating the data','error')
    })
    .finally(()=>{
        handleSpinner()
    })

}

//Toggle
function onToggleMovie(){
    const addMovie = document.getElementById('addMovie')
    backDrop.classList.toggle('active')
    movie.classList.toggle('active')
    addBtn.classList.remove('d-none')
    updateBtn.classList.add('d-none')
    movieForm.reset()
    addMovie.innerHTML = "Add Movie"
}
formClose.forEach(ele=>{
    ele.addEventListener('click',onToggleMovie)
})
addMovieBtn.addEventListener("click",onToggleMovie)
movieForm.addEventListener('submit',oncreateMovieCard)
updateBtn.addEventListener('click',updateMovie)