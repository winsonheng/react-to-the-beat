import React, { useState, useRef, useEffect } from 'react';
import './GameLayout.css';
import RhythmLane from '../Rhythm Lane/RhythmLane';
import ScoreBoard from '../ScoreBoard/ScoreBoard';
import StartMenu from './StartMenu';
import SongList from '../Song Selection/SongList';
import CharacterLane from '../Character Lane/CharacterLane';
import readBeatmap from '../util/SongAssetsReader';

const PROXY = 'http://localhost:8000';


function GameLayout() {
  const GameState = {
    SiteLoading: -1,
    MainMenu: 0,
    SelectSong: 1,
    SongLoading: 20,
    SongBegin: 21,
    SongEnd: 22,
    Options: 5,
    Credits: 6,
  }

  const [state, setState] = useState({
    gameState: GameState.SiteLoading,
    songToPlay: null
  });

  const [scoreboardFunctions, setScoreboardFunctions] = useState({
    startProgressBar: null,
    updateScoreboard: null
  });

  const COOKIE = useRef();

  useEffect(() => {
    obtainCookie();
  }, []);

  function getGameAreaComponent(state) {
    switch (state.gameState) {
      case GameState.SiteLoading:
        return <></>;
      case GameState.MainMenu:
        return <StartMenu startClick={startClick}></StartMenu>;
      case GameState.SelectSong:
        return <SongList songClick={songClick} playerHighscores={state.playerHighscores}></SongList>;
      case GameState.SongLoading:
        return <CharacterLane></CharacterLane>;
      case GameState.SongBegin:
        return <CharacterLane></CharacterLane>;
      case GameState.SongEnd:
        return <CharacterLane scoreDetails={state.scoreData} replayFunction={songReplay} returnFunction={initialiseGame}></CharacterLane>;
    }
  }

  function obtainCookie() {
    fetch(PROXY + '/').then(
      response => response.json()
    ).then(
      data => {
        console.log('Obtained Cookie: ', data);
        COOKIE.current = data;
      }
    ).then(
      () => {
        obtainPlayerHighscores();
      }
    );
  }

  function obtainPlayerHighscores() {
    fetch(PROXY + '/players/', { credentials: 'include' }).then(
      response => response.json()
    ).then(
      data => {
        console.log('Obtained Player Highscores: ', data);
        if (data.message === 'Cannot find player') {
          console.log('No player data found');
          data = null;
        }
        setState(prevState => {
          return {
            gameState: GameState.MainMenu,
            songToPlay: null,
            playerHighscores: data
          }
        });
      }
    );
  }

  function updatePlayerHighscore(name, score) {
    console.log('Updating database: ', name, score);
    fetch(PROXY + '/players/', { method: 'PATCH', credentials: 'include', 
      body: JSON.stringify({ songName: name, score: score }) }).then(
        response => response.json()
      ).then(
        data => {
          console.log('Updated highscore to MongoDB. Response: ', data);
        }
      );
  }

  /**
   * Called when game loads or when a return button is clicked.
   */
  function initialiseGame() {
    console.log("button clicked");
    setState(prevState => {
      return {
        gameState: GameState.MainMenu,
        songToPlay: null
      };
    });
  }

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

  function setFunctionFromScoreboard(startProgressBar, updateScoreboard, songEndScoreboard) {
    setScoreboardFunctions(prevState => {
      return {
        startProgressBar: startProgressBar,
        updateScoreboard: updateScoreboard,
        songEndScoreboard: songEndScoreboard
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

  /**
   * Called when the required song data (beatmap and audio) have been loaded.
   * Updates the state to SongBegin which starts the game.
   * @param {Object} songData - Same as previous songData but contains song assets including the beatmap and audio. 
   */
  function songDataLoaded(songData) {
    setState(prevState => {
      console.log("Song data has been loaded...");
      return {
        ...prevState,
        gameState: GameState.SongBegin,
        songToPlay: songData
      };
    });
  }

  function songEnd(scoreData) {
    console.log('We\'re back!');

    if (state.songToPlay == null) {
      return;
    }
    console.log(scoreData, state.songToPlay);

    if (scoreData.score > state.songToPlay.score) {
      state.songToPlay.score = scoreData.score;
      scoreData.isNewHighscore = true;
    } else {
      scoreData.isNewHighscore = false;
    }

    setState(prevState => {
      console.log('Song has ended and state is updated');
      return {
        ...prevState,
        gameState: GameState.SongEnd,
        scoreData: scoreData
      };
    });
  }

  function songReplay() {
    setState(prevState => {
      console.log('>>> Let\'s replay this song...');
      return {
        ...prevState,
        gameState: GameState.SongBegin,
      };
    });
  }

  const gameAreaComponent = getGameAreaComponent(state);

  return (
    <div className='landing'>
      <RhythmLane active={state.gameState == GameState.SongBegin} songData={state.songToPlay} lane='top'
        scoreboardFunctions={scoreboardFunctions} isSongEnd={state.gameState == GameState.SongEnd}></RhythmLane>

      <div className='game-area'>
        <div className='game-area-container'>
          {gameAreaComponent}
        </div>
        <div className='scrolling-image'>
        </div>
      </div>

      <RhythmLane active={state.gameState == GameState.SongBegin} songData={state.songToPlay} lane='bottom'
        scoreboardFunctions={scoreboardFunctions} isSongEnd={state.gameState == GameState.SongEnd}></RhythmLane>

      <ScoreBoard isLoading={state.gameState == GameState.SongLoading || state.gameState == GameState.SiteLoading} 
        isActive={state.gameState == GameState.SongBegin} songData={state.songToPlay} 
        setUpdateFunction={setFunctionFromScoreboard} songEnd={songEnd}></ScoreBoard>
    </div>
  );
}

export default GameLayout;