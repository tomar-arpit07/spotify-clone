console.log("Let's Start Java Script");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`./${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img id="songsvg" class="invert" src="images/song.svg" alt="song svg">
        <div class="songinfo">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Bittu</div>
        </div>
        <div class="songplay">
            <div>Play Now</div>
            <img class="invert" src="images/play.svg" alt="play svg">
        </div>
        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML);
        })
    })
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}`+ "/" + track;
    if(!pause){
        currentSong.play();
        play.src = "images/pause.svg";
    }
    document.querySelector(".songname").innerHTML = decodeURI(track);
    document.querySelector(".timestamp").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`./songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice("-2")[0]
            let a = await fetch(`./songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML +
                `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg class="invert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                            <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="Playlist image">
                    <h3>${response.title}</h3>
                    <p>${response.description}</p>
                 </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })

}

async function main() {
    await getSongs("/songs/cs");
    playMusic(songs[0],true);

    await displayAlbums();

    play.addEventListener("click",e =>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "images/pause.svg";
        }
        else{
            currentSong.pause();
            play.src = "images/play.svg";
        }
    })

    currentSong.addEventListener("timeupdate", e =>{
        document.querySelector(".timestamp").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = ((currentSong.currentTime)/(currentSong.duration)) * 100 + "%";

        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime =  ((currentSong.duration) * percent) / 100;
        })
    })

    previous.addEventListener("click",e=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index-1) >= 0) {
            playMusic(songs[index-1]);
        }
    })

    next.addEventListener("click",e=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index+1) < songs.length) {
            playMusic(songs[index+1]);
        } 
    })

    let input = document.querySelector(".volume").getElementsByTagName("input")[0];
    input.addEventListener("change", e=>{
        currentSong.volume = parseInt(e.target.value)/100;
    })

    let mute = document.querySelector(".volume").getElementsByTagName("img")[0];
    mute.addEventListener("click",e=>{
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg","mute.svg");
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg","volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
        }
    })

    document.querySelector(".hamh1").getElementsByTagName("img")[0].addEventListener("click", ()=>{
        document.querySelector(".box1").style.left = "0"
    })

    document.querySelector(".plusimg").addEventListener("click", ()=>{
        document.querySelector(".box1").style.left = "-100%"
    })
    
}
main();
