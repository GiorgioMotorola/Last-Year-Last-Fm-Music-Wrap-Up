<template>
  <div class="container">
    <div v-if="!loading && !showResults" class="pause">PAUSE&#9208;</div>
    <div class="status">
      <div v-if="loading" class="rewind">REWIND &#9198;</div>
      <div v-if="showResults && !loading" class="play">PLAY &#9654;</div>
      <div class="top-right-text">{{ formattedTime }}</div>
    </div>
    <div class="content main">
      <div class="entry-form" v-if="showForm">
        <div class="title">LAST YEAR</div>
        <div class="second-title">YOUR LAST YEAR IN MUSIC ON <span style="color: #DC1B22;">LAST.FM</span></div>
        <div class="form" @submit.prevent="fetchData">
          <label for="username"></label>
          <input type="text" v-model="username" id="username" required placeholder="enter a last.fm username" @keyup.enter="fetchData" />
          <button class="submit" type="submit">&#9198;</button>
        </div>
      </div>

      <div v-if="loading">
        <div class="loading-screen">HANG ON TIGHT. WE ARE DIGGING FOR FIRE.</div>
      </div>

      <div v-if="showResults && !loading">
        <div v-if="error" class="error">{{ error }}</div>

        <!-- <div class="early-track" v-if="earliestJanuaryTrack">
          One of the first songs you started your year with was:
          <div class="early-track-entry">{{ earliestJanuaryTrack.name }} by {{ earliestJanuaryTrack.artist['#text'] }}</div>
        </div> -->

        <div class="top-tracks" v-if="topTracks.length">
          TOP 25 TRACKS OF 2024 FOR {{ this.username }}
          <div class="track-list">
            <li v-for="(track, index) in topTracks" :key="index">
              {{ track.name }} <span style="color: grey;">by</span> <span style="font-weight: 600; color: aliceblue;">{{ track.artist.name }}</span> (<span style="color:#DC1B22;">{{ track.playcount }} plays</span>)
            </li>
          </div>
        </div>

        <!-- <div class="late-track" v-if="firstTrack && lastTrack">
          You left 2024 behind listening to:
          <div class="early-track-entry">{{ lastTrack.name }} by {{ lastTrack.artist['#text'] }}</div>
        </div> -->

        <div class="top-artists" v-if="topArtists.length">
          Top 25 Artists of 2024 FOR {{ this.username }}
          <div class="artist-list">
            <li v-for="(artist, index) in topArtists" :key="index">
              <span style="font-weight: 600; color: aliceblue;">{{ artist.name }}</span> (<span style="color:#DC1B22;">{{ artist.playcount }} plays</span>)
            </li>
          </div>
        </div>

        <div class="top-albums" v-if="topAlbums.length">
          Top 25 Albums of 2024 FOR {{ this.username }}
          <div class="album-list">
            <li v-for="(album, index) in topAlbums" :key="index">
              <div>
                {{ album.name }} <span style="color: grey;">by</span> <span style="font-weight: 600; color: aliceblue;">{{ album.artist.name }}</span> (<span style="color:#DC1B22;">{{ album.playcount }} plays</span>)
              </div>
            </li>
          </div>
        </div>

        <div class="album-container">
  <div class="album-item" v-for="(album, index) in topAlbums" :key="index">
    <div class="album-image">
      <img :src="album.image" :alt="album.name" width="200" height="200" />
    </div>
  </div>
</div>



      </div>
    </div>
    <div class="fuzzy-overlay"></div>
  </div>
</template>



<script>
import { getTopArtistsForYear, getTopAlbumsForYear, getTopTracksForYear, getLastTrack } from '@/lastfmService';

export default {
  data() {
    return {
      username: '',
      firstTrack: null,
      lastTrack: null,
      earliestJanuaryTrack: null,
      topArtists: [],
      topAlbums: [],
      topTracks: [],
      error: null,
      loading: false,
      showForm: true,
      showResults: false,
      interval: null,
      time: 0
    };
  },
  computed: {
    formattedTime() {
      const date = new Date(this.time * 1000);
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  },
  methods: {
    startCountdown() {
      this.time = 3600; 
      this.interval = setInterval(() => {
        if (this.time > 0) {
          this.time -= 1 / 1; 
        } else {
          clearInterval(this.interval);
        }
      }, 1000 / 60); 
    },
    startCountup() {
      this.time = 0; 
      this.interval = setInterval(() => {
        this.time += 1 / 60; 
      }, 1000 / 60); 
    },
    stopTimer() {
      if (this.interval) {
        clearInterval(this.interval);
      }
    },
    async fetchData() {
      try {
        this.error = null;
        this.loading = true;
        this.showForm = false;
        this.stopTimer();
        this.startCountdown();

        const year = 2024;

        const tracks = await getLastTrack(this.username, year);
        const artists = await getTopArtistsForYear(this.username);
        const albums = await getTopAlbumsForYear(this.username);
        const alltracks = await getTopTracksForYear(this.username);

        if (tracks.length > 0) {
          const chronologicalTracks = tracks.reverse();
          this.firstTrack = chronologicalTracks[0];
          this.lastTrack = chronologicalTracks[chronologicalTracks.length - 1];
        } else {
          this.firstTrack = null;
          this.lastTrack = null;
          this.error = 'No info found. Please check the username spelling and try again.';
        }

        if (artists.length > 0) {
          this.topArtists = artists;
        } else {
          this.topArtists = [];
          if (!this.error) {
            this.error = 'No info found. Please check the username spelling and try again.';
          }
        }

        if (albums.length > 0) {
          this.topAlbums = albums.map(album => ({
            name: album.name,
            artist: album.artist,
            image: album.image,
            playcount: album.playcount
          }));
        } else {
          this.topAlbums = [];
          if (!this.error) {
            this.error = 'No info found. Please check the username spelling and try again.';
          }
        }

        if (alltracks.length > 0) {
          this.topTracks = alltracks.map(track => ({
            name: track.name,
            artist: track.artist,
            playcount: track.playcount
          }));
        } else {
          this.topTracks = [];
          if (!this.error) {
            this.error = 'No info found. Please check the username spelling and try again.';
          }
        }
      } catch (e) {
        console.error('Error fetching data:', e);
        this.error = 'An error occurred while fetching data. Please try again.';
      } finally {
        setTimeout(() => {
          this.loading = false;
          this.showResults = true;
          this.stopTimer();
          this.startCountup();
        }, 5000);
      }
    }
  },
  beforeDestroy() {
    this.stopTimer();
  }
};
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.container {
  position: relative;
  overflow: hidden;
  background-color: #232F9D;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.content {
  z-index: 10;
  position: relative;
  width: 100%;
  height: 100%;
}

.title {
  color: rgb(208, 212, 216);
  background-color: transparent;
  font-size: 96px;
  margin-top: 10%;
}

.second-title {
  color: rgb(208, 212, 216);
  font-size: 20px;
  margin-bottom: 5%;
}

.error {
  color: red;
}

.top-artists {
  font-size: 60px;
  color: rgb(255, 255, 255);
  margin-top: 3%;
  text-transform: uppercase;
  text-align: end;
}

.artist-list {
  padding-left: 0;
  list-style: none;
  color: rgb(208, 212, 216);
  font-size: 50px;
  margin-top: 3%;
  padding: 1%;
  text-transform: uppercase;
  text-align: end;
}

.artist-list li {
  counter-increment: item;
  margin-bottom: 10px;
}

.artist-list li::before {
  content: counters(item, ".") ". ";
  font-weight: bold;
  margin-right: 10px;
}


.top-albums {
  font-size: 60px;
  color: rgb(255, 255, 255);
  margin-top: 3%;
  text-transform: uppercase;
}

.album-list {
  padding-left: 0;
  list-style: none;
  color: rgb(208, 212, 216);
  text-transform: uppercase;
  font-size: 45px;
  margin-top: 3%;
  padding: 1%;
}

.album-list li {
  counter-increment: item;
  display: flex;
  align-items: center;
  color: rgb(208, 212, 216);
  text-transform: uppercase;
  margin-bottom: 10px;
}

.album-list li::before {
  content: counters(item, ".") ". ";
  font-weight: bold;
  margin-right: 10px;
  text-transform: uppercase;
}

.album-image {
  display: flex;
}

.top-tracks {
  font-size: 60px;
  color: rgb(255, 255, 255);
  margin-top: 3%;
  text-transform: uppercase;
}

.track-list {
  padding-left: 1;
  list-style: none;
  color: rgb(208, 212, 216);
  font-size: 50px;
  margin-top: 3%;
  padding: 1%;
}

.track-list li {
  counter-increment: item;
  margin-bottom: 10px;
}

.track-list li::before {
  content: counters(item, ".") ". ";
  font-weight: bold;
  margin-right: 10px;
}

.late-track {
  color: rgb(208, 212, 216);
}

.entry-form {
  margin: auto;
  width: 50%;
  /* padding: 10px; */
  vertical-align: center;
  text-align: center;
  justify-content: center;
  height: 95vh;
  z-index: 20;
}

.loading-screen {
  text-align: center;
  z-index: 20;
  height: 100vh;
  padding-top: 10%;
  font-size: 85px;
  color: rgb(208, 212, 216);
  animation: blink 2s infinite;
}

.fuzzy-overlay {
  position: absolute;
  inset: -200%;
  background-image: url("../assets/noise.png");
  opacity: 12%;
  z-index: 5;
  animation: shift .5s linear infinite both;
}

.pause {
  font-size: 60px;
  color: rgb(208, 212, 216);
  padding: .5%;
  animation: blink 2s infinite;
}

.rewind {
  font-size: 60px;
  color: rgb(208, 212, 216);
  padding: .5%;
  animation: blink .00001s infinite;
}

.play {
  font-size: 60px;
  color: rgb(208, 212, 216);
  padding: .5%;
}

.top-right-text {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 60px;
  color: rgb(208, 212, 216);
  z-index: 20;
}

.album-container {
  display: grid;
  grid-template-columns: repeat(5, .5fr); 
  gap: 20px; 
  justify-items: center;
  padding: 20px;
}

.album-item {
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: rgba(0, 0, 0, 0.801) 0px 5px 30px;
}

.album-image img {
  width: 100%;
  height: auto;
}



@keyframes blink {
  50% {
    opacity: 0;
  }
}


input[type="text"] {

  width: 30%;
  color: rgb(36, 35, 42);
  font-size: 16px;
  line-height: 20px;
  min-height: 28px;
  border-radius: 4px;
  padding: 8px 16px;
  border: 2px solid transparent;
  box-shadow: rgb(0 0 0 / 12%) 0px 1px 3px, rgb(0 0 0 / 24%) 0px 1px 2px;
  background: rgb(251, 251, 251);
  transition: all 0.1s ease 0s;
  :focus{
    border: 2px solid rgb(132, 135, 160);
  }              
}

.submit {
  display:none;
}


@keyframes shift {
  0% {
    transform: translateX(10%) translateY(10%);
  }

  100% {
    transform: translateX(-10%) translateY(-10%);
  }
}

@media screen and (max-width: 600px) {

  .title {
  font-size: 50px;
  margin-top: 75%;
}

.second-title {
  font-size: 15px;
  margin-top: 7%;
  margin-bottom: 25%;
}

input[type="text"] {

width: 100%;
font-size: 20px;     
}

.pause {
  font-size: 40px;
}

.top-right-text {
  top: 10px;
  right: 20px;
  font-size: 40px;
  color: rgb(208, 212, 216);
  z-index: 20;
}

.rewind {
  font-size: 40px;
  color: rgb(208, 212, 216);
  padding: .5%;
  animation: blink .00001s infinite;
}


.play {
  font-size: 40px;
  color: rgb(208, 212, 216);
  padding: .5%;
}

.loading-screen {
  height: 100vh;
  padding-top: 60%;
  font-size: 40px;
}

.top-tracks {
  font-size: 25px;
}

.track-list {
  font-size: 15px;
}

.top-artists {
  font-size: 25px;
}

.artist-list {
  font-size: 15px;
}

.top-albums {
  font-size: 25px;
}

.album-list {
  font-size: 15px;
}



}

</style>
