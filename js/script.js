// console.log("Lets write JavaScript")

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(totalSeconds) {
    totalSeconds = Math.floor(totalSeconds); // remove decimal part

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

    return `${minutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}`)[1])
        }
    }

    //Show all songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt=""> 
        <div class="info"> 
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Harry</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="" width="24" height="24">
        </div>
    </li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML.trim())
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            // .trim() => removes spaces
        })
    })

    return songs
}


const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    // audio.play()

    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    currentSong.src = `/${currFolder}/` + track
    currentSong.play()


    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    //decodeURI() => only give the name of the track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(div)
    let anchors = div.getElementsByTagName("a")
    let folders = []
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)

    for(let index = 0 ; index < array.length; index++){
        const e = array[index]
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                style="width: 100%; height: 100%;">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    fill="black" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //Load the playlist whenever card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}/`)  
            playMusic(songs[0])
        })
    })
        
}

async function main() {

    //Get the list of all the songs
    await getSongs("songs/ncs/")

    // console.log(songs)

    playMusic(songs[0], false)

    //Display all the albums on the page
    displayAlbums()



    //Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })

    //Listen for timeupdate event 
    currentSong.addEventListener("timeupdate", () => {

        // console.log(currentSong.currentTime,currentSong.duration);

        //currentTime => in seconds
        //duration => the total duration of the song in seconds

        //song time
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        //seekbar
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })


    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.offsetX,e.offsetY)

        // console.log(e.target,e.offsetX)

        // console.log(e.target.getBoundingClientRect().width,e.offsetX)

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100

        document.querySelector(".circle").style.left = percent + "%"

        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })


    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"
    })

    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add an event listener to previous
    previous.addEventListener("click", () => {
        // console.log("Previous clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs,index)

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        // console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs,index)

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })


    //Add an event to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e,e.target,e.target.value)
        // console.log("Setting voume to ", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100

        if(currentSong.volume>0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg","img/volume.svg")
        }
    })

    //Add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        // console.log(e.target)
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

}

main()





