import React from 'react'
import './SongList.css'
import songListData from '../assets/data/songlist.json'
import SongItem from './SongItem';


export default function SongList() {

  function getSonglistItems() {
    console.log(songListData);
    var items = <SongItem></SongItem>;
    for (const song of songListData) {
      console.log(song);
      items += <SongItem songData={song}></SongItem>;
    }
    return items;
  }

  return (
    <div className='songlist-container'>
      <h1 className='choose-track-text'>Choose Your Track</h1>
      <div className='songlist'>
        {songListData.map((item, index) => (
          <SongItem songData={item}></SongItem>
        ))}
      </div>
    </div>
  )
}
