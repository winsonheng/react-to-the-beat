import { CLIENT_BASE_URL } from "../constants/config";

function getSongAssets(songData, callback) {
  Promise.all([
    // Get beatmap data
    fetch(CLIENT_BASE_URL + '/assets/beatmaps/' + songData.beatmap)
      .then(function (response) {
        return response.text();
      })
      .then(function (result) {
        songData.beatmapAssets = textToBeatJSON(result);
      }),

    // Get audio file
    fetch(CLIENT_BASE_URL + '/assets/audio/' + songData.audioSrc)
      .then(function (response) {
        return response.blob();
      }).then(function (result) {
        songData.audioBlob = result;
      })

  ]).then(value => {
    callback(songData);
  });
}

function textToBeatJSON(text) {
  let json = {top: [], bottom: [], beatCount: 0};

  let lines = text.split('\n');
  json.beatCount = lines.length;
  
  for (let i = 0; i < lines.length; ++i) {
    let tokens = lines[i].split(',');
    if (tokens[0] == 0) {
      // Each beat is pushed as [beatNum, beatOffset]
      // beatOffset: Number of crotchets from start of song (after initOffset)
      json.top.push([i, tokens[1]]);
    } else {
      json.bottom.push([i, tokens[1]]);
    }
  }

  return json;
}

export default getSongAssets;