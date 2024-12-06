<template>
  <div class="main">
    <div class="entry-form" v-if="showForm">
      <div class="title">LAST YEAR</div>
      <div class="second-title">Your Last Year in Music</div>
      <form @submit.prevent="fetchData">
        <div>
          <label for="username">Username:</label>
          <input type="text" v-model="username" id="username" required />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>

    <div v-if="loading">
      <div class="loading-screen">Hang tight. We are digging for fire. </div>
    </div>

    <div v-if="showResults && !loading">
      <div v-if="error" class="error">{{ error }}</div>

      <div class="early-track" v-if="earliestJanuaryTrack">
        One of the first songs you started your year with was: 
        <div class="early-track-entry">{{ earliestJanuaryTrack.name }} by {{ earliestJanuaryTrack.artist['#text'] }}</div>
      </div>

      <div class="late-track" v-if="firstTrack && lastTrack">
        You left 2024 behind listening to:
        <div class="early-track-entry">{{ lastTrack.name }} by {{ lastTrack.artist['#text'] }}</div>
      </div>

      <div class="top-artists" v-if="topArtists.length">
        Top 25 Artists of 2024
        <div class="artist-list">
          <li v-for="(artist, index) in topArtists" :key="index">
            {{ artist.name }} ({{ artist.playcount }} scrobbles)
          </li>
        </div>
      </div>

      <div class="top-albums" v-if="topAlbums.length">
        Top 25 Albums of 2024
        <div class="album-list">
          <li v-for="(album, index) in topAlbums" :key="index">
            <div>
              <img :src="album.image" :alt="album.name" width="100" height="100" />
            </div>
            <div>
              <strong>{{ album.name }}</strong> by {{ album.artist.name }} ({{ album.playcount }} scrobbles)
            </div>
          </li>
        </div>
      </div>

      <div class="top-tracks" v-if="topTracks.length">
        Top 25 Tracks of 2024
        <div class="track-list">
          <li v-for="(track, index) in topTracks" :key="index">
            {{ track.name }} by {{ track.artist.name }} ({{ track.playcount }} scrobbles)
          </li>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { getEarliestJanuaryTrack, getTopArtistsForYear, getTopAlbumsForYear, getTopTracksForYear, getLastTrack } from '@/lastfmService';

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
      showResults: false
    };
  },
  methods: {
    async fetchData() {
      try {
        this.error = null;
        this.loading = true;
        this.showForm = false;

        const year = 2024;

        const earliestJanuaryTrack = await getEarliestJanuaryTrack(this.username);
        this.earliestJanuaryTrack = earliestJanuaryTrack;

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
        }, 5000);
      }
    }
  }
};
</script>

<style scoped>

.title {
  color: aliceblue;
  background-color: transparent
}

.error {
  color: red;
}

.artist-list {
  padding-left: 0;
  list-style: none;
}

.artist-list li {
  counter-increment: item;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.artist-list li::before {
  content: counters(item, ".") ". ";
  font-weight: bold;
  margin-right: 10px;
}

.album-list {
  padding-left: 0;
  list-style: none;
}

.album-list li {
  counter-increment: item;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.album-list li::before {
  content: counters(item, ".") ". ";
  font-weight: bold;
  margin-right: 10px;
}

.track-list {
  padding-left: 0;
  list-style: none;
}

.track-list li {
  counter-increment: item;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.track-list li::before {
  content: counters(item, ".") ". ";
  font-weight: bold;
  margin-right: 10px;
}

/* .main {
  display: flex;
  justify-content: center; 
  align-items: center; 
  height: 100vh; 
} */

.entry-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  width: 50%;
  padding: 10px;
  vertical-align: center;
  text-align: center;
  background-color: rgb(185, 175, 175);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  display: flex;
  justify-content: center; 
  align-items: center; 
  height: 100vh; 
}
</style>
