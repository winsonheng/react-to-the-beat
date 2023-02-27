import React, { useEffect, useRef, useState } from 'react';
import { formatNumberWithCommas } from '../util/StringFormatter';
import ProgressBar from 'react-bootstrap/ProgressBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ScoreBoard.css';

const GRADE_BOUNDARIES = {
  D: 0,
  C: 800000,
  B: 850000,
  A: 900000,
  AA: 950000,
  EX: 980000,
  PM: 1000000
};

function getGrade(score) {
  if (score >= GRADE_BOUNDARIES.PM) {
    return 'PM';
  } else if (score >= GRADE_BOUNDARIES.EX) {
    return 'EX';
  } else if (score >= GRADE_BOUNDARIES.AA) {
    return 'AA';
  } else if (score >= GRADE_BOUNDARIES.A) {
    return 'A';
  } else if (score >= GRADE_BOUNDARIES.B) {
    return 'B';
  } else if (score >= GRADE_BOUNDARIES.C) {
    return 'C';
  } else {
    return 'D';
  }
}

const MAX_SCORE = 1000000;

export const JUDGEMENT_TYPES = {
  PERFECT: 0,
  EARLY: 1,
  LATE: 2,
  MISS: 3
};

export default function ScoreBoard(props) {

  const SCORE_REF = useRef();
  const GRADE_REF = useRef();
  const ACCURACY_REF = useRef();
  const COMBO_REF = useRef();
  const PERFECT_REF = useRef();
  const EARLY_REF = useRef();
  const LATE_REF = useRef();
  const MISS_REF = useRef();
  const PROGRESS_BAR = useRef();

  let score = useRef(0);
  let accuracy = useRef(0);
  let accuracySum = useRef(0);
  let combo = useRef(0);
  let curBeatCount = useRef(0);
  let perfect = useRef(0);
  let early = useRef(0);
  let late = useRef(0);
  let miss = useRef(0);
  let songBeatCount = useRef(0);
  let perfectScore = useRef(0);
  let farScore = useRef(0);

  const [scoreState, setScoreState] = useState({
    loaded: false,
  });

  const [isActiveState, setIsActiveState] = useState(false);

  const [progressNow, setProgressNow] = useState(0);

  useEffect(() => {
    props.setUpdateFunction(startProgressBar, updateScoreboard);
  }, [isActiveState]);


  if (props.isActive && !scoreState.loaded) {

    songBeatCount.current = props.songData.beatmapAssets.beatCount;
    perfectScore.current = MAX_SCORE / songBeatCount.current;
    farScore.current = perfectScore.current / 2;

    setScoreState(prevState => {
      return {
        ...prevState,
        score: 0,
        loaded: true,
        songBeatCount: songBeatCount.current,
        perfectScore: perfectScore.current,
        farScore: farScore.current
      };
    });

    setIsActiveState(prevState => {
      return true;
    })
    
    console.log(perfectScore.current, farScore.current);
  }

  function startProgressBar(duration) {
    console.log('Starting progress bar...');
    const interval = 250;
    const delta = 100 * interval / (duration * 1000);

    setProgressNow(prevState => {
      return delta;
    });

    setInterval(() => {
      setProgressNow(prevState => {
        return prevState + delta;
      });
    }, interval);
  }

  function updateScoreboard(beatAcc, beatJudgement) {

    curBeatCount.current++;
    combo.current++;
    accuracySum.current += beatAcc;
    accuracy.current = accuracySum.current / curBeatCount.current;

    switch (beatJudgement) {
      case JUDGEMENT_TYPES.PERFECT:
        perfect.current++;
        score.current += perfectScore.current;
        break;
      case JUDGEMENT_TYPES.EARLY:
        early.current++;
        score.current += farScore.current;
        break;
      case JUDGEMENT_TYPES.LATE:
        late.current++;
        score.current += farScore.current;
        break;
      case JUDGEMENT_TYPES.MISS:
        miss.current++;
        combo.current = 0;
    }

    SCORE_REF.current.innerText = formatNumberWithCommas(Math.round(score.current));
    GRADE_REF.current.innerText = getGrade(score.current);
    ACCURACY_REF.current.innerText = (Math.round(accuracy.current * 100) / 100) + '%';
    COMBO_REF.current.innerText = combo.current + 'X';
    PERFECT_REF.current.innerText = perfect.current;
    EARLY_REF.current.innerText = early.current;
    LATE_REF.current.innerText = late.current;
    MISS_REF.current.innerText = miss.current;

  }

  return (
    <div className='scoreboard-container'>
      <div className={'loading-container ' + (props.isLoading ? 'loading-text-active' : '')}>
        <div className='loading-text'>Loading assets ... </div>
      </div>
      
      <ProgressBar className='song-progress-bar' ref={PROGRESS_BAR} animated now={progressNow}/>

      <div className='scoreboard'>

        <div className='score-accuracy-combo-container'>
          <div className='score-container'>
            <div className='score' ref={SCORE_REF}>0</div>
            <div className='score-text-container'>
              <div className='score-text' ref={GRADE_REF}>D</div>
            </div>
          </div>
          <div className='accuracy-combo-container'>
            <div className='accuracy-container'>
              <div className='accuracy-combo-text'>Accuracy</div>
              <div className='accuracy-combo' ref={ACCURACY_REF}>00.00%</div>
            </div>
            <div className='combo-container'>
              <div className='accuracy-combo-text'>Combo</div>
              <div className='accuracy-combo' ref={COMBO_REF}>0X</div>
            </div>
          </div>
        </div>

        <div className='judgement-container'>
          <div className='judgement perfect'>
            <div className='judgement-text'>PERFECT</div>
            <div className='judgement-count' ref={PERFECT_REF}>0</div>
          </div>
          <div className='judgement early'>
            <div className='judgement-text'>EARLY</div>
            <div className='judgement-count' ref={EARLY_REF}>0</div>
          </div>
          <div className='judgement late'>
            <div className='judgement-text'>LATE</div>
            <div className='judgement-count' ref={LATE_REF}>0</div>
          </div>
          <div className='judgement miss'>
            <div className='judgement-text'>MISS</div>
            <div className='judgement-count' ref={MISS_REF}>0</div>
          </div>
        </div>

        <div className='song-details-container'>

        </div>

      </div> 
    </div>
  )
}
