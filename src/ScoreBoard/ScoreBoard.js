import React from 'react'
import './ScoreBoard.css'

export default function ScoreBoard(props) {
  return (
    <div className='scoreboard'>
      <div className='loading-container'>
        <div className={'loading-text' + (props.isLoading ? '-active' : '')}>Loading assets ... </div>
      </div>
    </div>
  )
}
