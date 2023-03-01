import React from 'react'
import { formatNumberWithCommas } from '../util/StringFormatter';
import './SongItem.css'

export default function SongItem(props) {

  return (
    <div className='songitem' onClick={() => props.hideSonglist(props.songData)}>
      <div className='difficulty-container'>
        <div className='difficulty'>{props.songData.difficulty}</div>
      </div>
      <div className='song-info-container'>
          <div className='song-name'>{props.songData.name}</div>
          <div className='song-artist'>{props.songData.artist}</div>
      </div>
      <div className='songitem-right'>
        <div className='bpm-container'>
            <div className='bpm-text'>BPM</div>
            <div className='bpm'>{props.songData.bpm}</div>
        </div>
        <div className='highscore-container'>
            <div className='highscore-text'>HI</div>
            <div className='highscore'>{formatNumberWithCommas(props.songData.score)}</div>
        </div>
        <div className='grade-container'>
          <div className='grade'>{props.songData.grade}</div>
        </div>
      </div>
    </div>
  )
}
