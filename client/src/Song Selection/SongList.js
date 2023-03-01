import React, { useEffect, useRef, useState } from 'react'
import './SongList.css'
import songListData from '../assets/data/songlist.json'
import SongItem from './SongItem';


export default function SongList(props) {

  /**
  function getSonglistItems() {
    console.log(songListData);
    var items = <SongItem></SongItem>;
    for (const song of songListData) {
      console.log(song);
      items += <SongItem songData={song}></SongItem>;
    }
    return items;
  }
  */

  const [isSongDataLoaded, setIsSongDataLoaded] = useState(false);

  const chooseTrackText = useRef();
  const songlist = useRef();
  const SONG_DATA = useRef([]);

  useEffect(() => {
    populateSongList();
  }, [props.playerHighscores])

  function populateSongList() {
    console.log('Populating Song List ...', props.playerHighscores);
    for (const playerSong of props.playerHighscores.highscores) {
      for (const jsonSong of songListData) {
        if (playerSong.songName == jsonSong.name) {
          jsonSong.score = playerSong.score;
          jsonSong.grade = playerSong.grade;
          SONG_DATA.current.push(jsonSong);
          break;
        }
      }
    }

    console.log('Songs are:', SONG_DATA.current);

    setIsSongDataLoaded(prevState => {
      return true;
    });
  }

  function hideSonglist(songData) {
    console.log('hide', songData);
    const chooseTrackTextElement = chooseTrackText.current;
    const songlistElement = songlist.current;

    chooseTrackTextElement.classList.add('hide-left');
    songlistElement.classList.add('hide-right');

    chooseTrackTextElement.addEventListener('animationend', (e) => {
      //chooseTrackTextElement.classList.remove('hide-left');
    });
    songlistElement.addEventListener('animationend', (e) => {
      props.songClick(songData);
    });
  }

  return (
    <div className='songlist-container'>
      <h1 className='choose-track-text' ref={chooseTrackText}>Choose Your Track</h1>
      <div className='songlist' ref={songlist}>
        {SONG_DATA.current.map((item, index) => (
          <SongItem songData={item} key={index} songClick={props.songClick} hideSonglist={hideSonglist}></SongItem>
        ))}
      </div>
    </div>
  )
}
