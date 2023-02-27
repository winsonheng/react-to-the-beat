import React, {useState, useRef} from 'react';
import './GameLayout.css';
import RhythmLane from '../Rhythm Lane/RhythmLane';
import ScoreBoard from '../ScoreBoard/ScoreBoard';
import StartMenu from './StartMenu';
import SongList from '../Song Selection/SongList';
import CharacterLane from '../Character Lane/CharacterLane';
import readBeatmap from '../util/SongAssetsReader';


function GameLayout() {
    const GameState = {
        MainMenu: 0,
        SelectSong: 1,
        SongLoading: 20,
        SongBegin: 21,
        SongEnd: 22,
        Options: 5,
        Credits: 6,
    }

    function getGameAreaComponent(state) {
        switch (state.gameState) {
            case GameState.MainMenu:
                return <StartMenu startClick={startClick}></StartMenu>;
            case GameState.SelectSong:
                return <SongList songClick={songClick}></SongList>;
            case GameState.SongLoading:
                return <CharacterLane></CharacterLane>;
            case GameState.SongBegin:
                return <CharacterLane></CharacterLane>;
        }
    }

    const [state, setState] = useState({
        gameState: GameState.MainMenu,
        songToPlay: null
    });

    const [scoreboardFunctions, setScoreboardFunctions] = useState({
        startProgressBar: null,
        updateScoreboard: null
    });

    /**
     * Called when Start button is clicked.
     */
    function startClick() {
        console.log("button clicked");
        setState(prevState => {
            return {
                ...prevState, 
                gameState: GameState.SelectSong
            };
        })
    }

    /**
     * Called when a song is selected from SongList.
     * Loads the required data (beatmap and audio) from assets.
     * Updates the state to SongLoading to await loading of assets.
     * @param {Object} songData - Contains song info directly extracted from songlist.json.
     */
    function songClick(songData) {
        readBeatmap(songData, songDataLoaded);

        setState(prevState => {
            return {
                ...prevState, 
                gameState: GameState.SongLoading, 
                songToPlay: songData
            };
        });
    }

    function setFunctionFromScoreboard(startProgressBar, updateScoreboard) {
        setScoreboardFunctions(prevState => {
            return {
                startProgressBar: startProgressBar,
                updateScoreboard: updateScoreboard
            };
        })
    }

    /**
     * Called when the required song data (beatmap and audio) have been loaded.
     * Updates the state to SongBegin which starts the game.
     * @param {Object} songData - Same as previous songData but contains song assets including the beatmap and audio. 
     */
    function songDataLoaded(songData) {
        setState(prevState => {
            console.log("Ready to start song...");
            return {
                ...prevState, 
                gameState: GameState.SongBegin, 
                songToPlay: songData
            };
        });
    }

    function songEnd() {
        console.log('We\'re back!');
    }

    const gameAreaComponent = getGameAreaComponent(state);

    return (
        <div className='landing'>
            <RhythmLane active={state.gameState == GameState.SongBegin} songData={state.songToPlay} lane='top' 
                scoreboardFunctions={scoreboardFunctions} onSongEnd={songEnd}></RhythmLane>
            
            <div className='game-area'>
                <div className='game-area-container'>
                    {gameAreaComponent}
                </div>
                <div className='scrolling-image'>
                </div>
            </div>
            
            <RhythmLane active={state.gameState == GameState.SongBegin} songData={state.songToPlay} lane='bottom' 
                scoreboardFunctions={scoreboardFunctions} onSongEnd={songEnd}></RhythmLane>

            <ScoreBoard isLoading={state.gameState == GameState.SongLoading} isActive={state.gameState == GameState.SongBegin} 
                songData={state.songToPlay} setUpdateFunction={setFunctionFromScoreboard}></ScoreBoard>
        </div>
    );
}

export default GameLayout;