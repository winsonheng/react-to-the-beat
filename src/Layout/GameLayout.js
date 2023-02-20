import './GameLayout.css';
import RhythmLane from '../Rhythm Lane/RhythmLane';
import ScoreBoard from '../ScoreBoard/ScoreBoard';

function GameLayout() {
    function handleButtonOnClick() {
        const rhythmLane = document.getElementById('rhythmLaneTop');
        console.log("button clicked");
        rhythmLane.classList.add('rhythm-sidebar-remove');
    }
    return (
        <div className='landing'>
            <RhythmLane></RhythmLane>
            <div className='game-area'>
                <div className='scrolling-image'></div>
            </div>
            <RhythmLane></RhythmLane>
            <ScoreBoard></ScoreBoard>
        </div>
    );
}

export default GameLayout;