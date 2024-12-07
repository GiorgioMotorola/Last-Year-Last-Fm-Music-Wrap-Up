import axios from 'axios';
import { API_KEY, API_URL } from '../config'; 
import VcrOsdMono from '/VCR_OSD_MONO_1.001.ttf';

console.log('Axios version:', axios.VERSION);

// Example usage in JavaScript if needed
const fontFace = new FontFace('VCR OSD Mono', `url(${VcrOsdMono})`);
document.fonts.add(fontFace);
// tracks
// add

export const getLastTrack = async (username, year) => {
    const fromTimestamp = new Date(`${year}-01-01T00:00:00Z`).getTime() / 1000;
    const toTimestamp = new Date(`${year}-12-31T23:59:59Z`).getTime() / 1000;
  
    try {
      const response = await axios.get(API_URL, {
        params: {
          method: 'user.getRecentTracks',
          user: username,
          from: fromTimestamp,
          to: toTimestamp,
          api_key: API_KEY,
          format: 'json',
          limit: 200
        }
      });
  
      const tracks = response.data.recenttracks.track;
      return tracks;
    } catch (error) {
      console.error('Error fetching tracks:', error.response ? error.response.data : error.message);
      throw error;
    }
  };
  
    // artists

  export const getTopArtistsForYear = async (username) => {
    try {
      const response = await axios.get(API_URL, {
        params: {
          method: 'user.getTopArtists',
          user: username,
          period: '12month',
          api_key: API_KEY,
          format: 'json',
          limit: 25
        }
      });
  
      const artists = response.data.topartists.artist;
      return artists;
    } catch (error) {
      console.error('Error fetching top artists:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

// albums
export const getTopAlbumsForYear = async (username) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        method: 'user.getTopAlbums',
        user: username,
        period: '12month',
        api_key: API_KEY,
        format: 'json',
        limit: 25
      }
    });

    const albums = response.data.topalbums.album.map(album => ({
      name: album.name,
      artist: album.artist,
      playcount: album.playcount,
      image: album.image.find(img => img.size === 'large')['#text']
    }));

    return albums;
  } catch (error) {
    console.error('Error fetching top albums:', error.response ? error.response.data : error.message);
    throw error;
  }
};

//all tracks

export const getTopTracksForYear = async (username) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        method: 'user.getTopTracks',
        user: username, 
        period: '12month',
        api_key: API_KEY,
        format: 'json',
        limit: 25
      }
    });

    const allTracks = response.data.toptracks.track.map(track => ({
      name: track.name, 
      artist: track.artist, 
      playcount: track.playcount
    }));

    return allTracks;
  } catch (error) {
    console.error('Error fetching top tracks:', error.response ? error.response.data : error.message);
    throw error;
  }
};
  
// export const getEarliestJanuaryTrack = async (username) => {
//   const fromTimestamp = new Date('2024-01-01T00:00:00Z').getTime() / 1000;
//   const toTimestamp = new Date('2024-01-31T23:59:59Z').getTime() / 1000;

//   try {
//     const response = await axios.get(API_URL, {
//       params: {
//         method: 'user.getRecentTracks',
//         user: username,
//         from: fromTimestamp,
//         to: toTimestamp,
//         api_key: API_KEY,
//         format: 'json',
//         limit: 200
//       }
//     });

//     const tracks = response.data.recenttracks.track;

//     if (tracks.length > 0) {
//       const earliestTrack = tracks.reduce((earliest, current) => {
//         return new Date(current.date.uts * 1000) < new Date(earliest.date.uts * 1000) ? current : earliest;
//       }, tracks[0]);
//       return earliestTrack;
//     } else {
//       return null;
//     }
//   } catch (error) {
//     console.error('Error fetching tracks:', error.response ? error.response.data : error.message);
//     throw error;
//   }
// };
  