import React, { useRef } from 'react'
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

  const chooseTrackText = useRef();
  const songlist = useRef();

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
        {songListData.map((item, index) => (
          <SongItem songData={item} key={index} songClick={props.songClick} hideSonglist={hideSonglist}></SongItem>
        ))}
      </div>
    </div>
  )
}
