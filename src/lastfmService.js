import { API_KEY, API_URL } from '../config'; 
import VcrOsdMono from '/VCR_OSD_MONO_1.001.ttf';

const fontFace = new FontFace('VCR OSD Mono', `url(${VcrOsdMono})`);
document.fonts.add(fontFace);


export const getLastTrack = async (username, year) => {
  const fromTimestamp = new Date(`${year}-01-01T00:00:00Z`).getTime() / 1000;
  const toTimestamp = new Date(`${year}-12-31T23:59:59Z`).getTime() / 1000;

  const url = `${API_URL}?method=user.getRecentTracks&user=apoc&from=1704067200&to=1735689599&api_key=${API_KEY}&format=json&limit=200`;
  console.log('Fetching data from:', url);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.recenttracks.track;
  } catch (error) {
    console.error('Error fetching tracks:', error);
    throw error;
  }
};

// top artists
export const getTopArtistsForYear = async (username) => {
  const url = `${API_URL}?method=user.getTopArtists&user=${username}&period=12month&api_key=${API_KEY}&format=json&limit=25`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.topartists.artist;
  } catch (error) {
    console.error('Error fetching top artists:', error);
    throw error;
  }
};

// top albums
export const getTopAlbumsForYear = async (username) => {
  const url = `${API_URL}?method=user.getTopAlbums&user=${username}&period=12month&api_key=${API_KEY}&format=json&limit=25`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.topalbums.album.map(album => ({
      name: album.name,
      artist: album.artist,
      playcount: album.playcount,
      image: album.image.find(img => img.size === 'large')['#text']
    }));
  } catch (error) {
    console.error('Error fetching top albums:', error);
    throw error;
  }
};

//  top tracks
export const getTopTracksForYear = async (username) => {
  const url = `${API_URL}?method=user.getTopTracks&user=${username}&period=12month&api_key=${API_KEY}&format=json&limit=25`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.toptracks.track.map(track => ({
      name: track.name,
      artist: track.artist,
      playcount: track.playcount
    }));
  } catch (error) {
    console.error('Error fetching top tracks:', error);
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
  