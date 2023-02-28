import React from 'react';
import './StartMenu.css';

export default function StartMenu(props) {
  return (
    <div className='start-menu'>
        <button className='start' onClick={() => props.startClick()}>
            Start
        </button>
        <button className='options'>
            Options
        </button>
        <button className='credits'>
            Credits
        </button>
    </div>
  )
}
