import React, {useState} from 'react';
import './GameLayout.css';
import RhythmLane from '../Rhythm Lane/RhythmLane';
import ScoreBoard from '../ScoreBoard/ScoreBoard';
import StartMenu from './StartMenu';
import SongList from '../Song Selection/SongList';
import CharacterLane from '../Character Lane/CharacterLane';


function GameLayout() {
    const GameState = {
        MainMenu: 0,
        SelectSong: 1,
        SongBegin: 21,
        SongEnd: 22,
        Options: 5,
        Credits: 6,
    }

    function getGameAreaComponent(state) {
        switch (gameState) {
            case GameState.MainMenu:
                return <StartMenu startClick={startClick}></StartMenu>;
            case GameState.SelectSong:
                return <SongList songClick={songClick}></SongList>;
            case GameState.SongBegin:
                return <CharacterLane></CharacterLane>
        }
    }

    const [gameState, setGameState] = useState(GameState.MainMenu);

    /**
     * Called when Start button is clicked.
     */
    function startClick() {
        console.log("button clicked");
        setGameState(prevState => {
            return GameState.SelectSong;
        })
    }

    /**
     * Called when a song is selected
     */
    function songClick(songData) {
        console.log("Song clicked: ", songData);
        setGameState(prevState => {
            return GameState.SongBegin;
        })
    }

    const gameAreaComponent = getGameAreaComponent(gameState);

    return (
        <div className='landing'>
            <RhythmLane></RhythmLane>
            
            <div className='game-area'>
                <div className='game-area-container'>
                    {gameAreaComponent}
                </div>
                <div className='scrolling-image'>
                </div>
            </div>
            <RhythmLane></RhythmLane>
            <ScoreBoard></ScoreBoard>
        </div>
    );
}

export default GameLayout;