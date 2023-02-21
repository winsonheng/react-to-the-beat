import React, {Component} from 'react';
import './StartMenu.css';

export default function StartMenu(props) {
  return (
    <div className='start-menu'>
        <h1 className='start' onClick={() => props.startClick()}>
            Start
        </h1>
        <h1 className='options'>
            Options
        </h1>
        <h1 className='credits'>
            Credits
        </h1>
    </div>
  )
}
