import React from 'react'
import './CharacterLane.css'

export default function CharacterLane() {
  return (
    <div className='character-lane'>
      <div className='character-left-container'>
        <div className='lava-wall'></div>
        <div className='character-container'>
          <div className='character'></div>
        </div>
      </div>
      <div className='empty-space-5'></div>
      <div className='countdown-container'>
        <h1 className='countdown-text'>3</h1>
      </div>
      
    </div>
  )
}
