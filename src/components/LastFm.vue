<template>
  <div>
    <h1>LAST YEAR</h1>
    <h2>Your Last Year in Music</h2>
    <form @submit.prevent="fetchData">
      <div>
        <label for="username">Username:</label>
        <input type="text" v-model="username" id="username" required />
      </div>
      <button type="submit">Submit</button>
    </form>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="firstTrack && lastTrack">
      <h2>You left 2024 behind listening to:</h2>
      <p>{{ lastTrack.name }} by {{ lastTrack.artist['#text'] }}</p>
    </div>

    <div v-if="topArtists.length">
      <h2>Top 25 Artists of 2024</h2>
      <ol>
        <li v-for="(artist, index) in topArtists" :key="index">
          {{ artist.name }} ({{ artist.playcount }} scrobbles)
        </li>
      </ol>
    </div>

    <div v-if="topAlbums.length">
      <h2>Top 25 Albums of 2024</h2>
      <ol>
        <li v-for="(album, index) in topAlbums" :key="index">
          <div>
            <img :src="album.image" :alt="album.name" width="100" height="100" />
          </div>
          <div>
             <strong>{{ album.name }}</strong> by {{ album.artist.name }} ({{ album.playcount }} scrobbles)
          </div>
        </li>
      </ol>
    </div>

    <div v-if="topTracks.length">
      <h2>Top 25 Tracks of 2024</h2>
      <ol>
        <li v-for="(track, index) in topTracks" :key="index">
           {{ track.name }} by {{ track.artist.name }} ({{ track.playcount }} scrobbles)
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
import { getLastTrack, getTopArtistsForYear, getTopAlbumsForYear, getTopTracksForYear } from '@/lastfmService';

export default {
  data() {
    return {
      username: '',
      firstTrack: null,
      lastTrack: null,
      topArtists: [],
      topAlbums: [],
      topTracks: [],
      error: null
    };
  },
  methods: {
    async fetchData() {
      try {
        this.error = null;
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
      }
    }
  }
};
</script>

<style scoped>
.error {
  color: red;
}

ol {
  padding-left: 0;
  list-style: none;
}

ol li {
  counter-increment: item;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

ol li::before {
  content: counters(item, ".") ". ";
  font-weight: bold;
  margin-right: 10px;
}
</style>
