import React, { useEffect, useRef } from 'react'
import './CharacterLane.css'

export default function CharacterLane(props) {

  const CHARACTER_RIGHT_CONTAINER = useRef();

  useEffect(() => {
    if (props.scoreDetails != null) {
      CHARACTER_RIGHT_CONTAINER.current.classList.add('character-right-container-active');
    } else {
      CHARACTER_RIGHT_CONTAINER.current.classList.remove('character-right-container-active');
    }
  }, [props.scoreDetails]);

  

  return (
    <div className='character-lane'>

      <div className='character-left-container'>
        <div className='lava-wall'></div>
        <div className='character-container'>
          <div className='character'></div>
        </div>
      </div>

      <div className='countdown-container'>
        <h1 className='countdown-text'>3</h1>
      </div>

      <div className='character-right-container' ref={CHARACTER_RIGHT_CONTAINER}>
        <div className='end-text-contaner'>
          <div className='end-text'>Final Grade</div>
          <div className='end-text-grade'>{props.scoreDetails == null ? 'D' : props.scoreDetails.grade}</div>
        </div>

        <div className='end-buttons-container'>
          <button className='end-replay-button' onClick={props.replayFunction}>Replay</button>
          <button className='end-return-button' onClick={props.returnFunction}>Return</button>
        </div>
      </div>
      
    </div>
  )
}
