import { useRef, useState } from 'react';
import { JUDGEMENT_TYPES } from '../ScoreBoard/ScoreBoard';
import './RhythmLane.css';
import hitSound from '../assets/audio/hit-sound.mp3';

const AUDIO_PLAYER = new Audio();
const FIXED_DELAY = 1000;
const LATENCY = 150;
const PERFECT_WINDOW = 80;
const FAR_WINDOW = 125;
const MISS_WINDOW = 200;

function calculateAccuracy(absDiffTiming) {
	if (absDiffTiming <= PERFECT_WINDOW) {
		return 100;
	} else if (absDiffTiming > MISS_WINDOW) {
		return 0;
	}
	return 100 * (MISS_WINDOW - absDiffTiming) / (MISS_WINDOW - PERFECT_WINDOW);
}

function waitForElm(selector) {
	return new Promise(resolve => {
			if (document.querySelector(selector)) {
					return resolve(document.querySelector(selector));
			}

			const observer = new MutationObserver(mutations => {
					if (document.querySelector(selector)) {
							resolve(document.querySelector(selector));
							observer.disconnect();
					}
			});

			observer.observe(document.body, {
					childList: true,
					subtree: true
			});
	});
}

function RhythmLane(props) {

	const [isInitialised, setIsInitialised] = useState(false);

	const hitSoundAudio = new Audio(hitSound);
	const activationCircle = useRef();
	const hitText = useRef();

	let lastBeatOfTop = useRef();
	let lastBeatOfBottom = useRef();

	const isKeydownAdded = useRef(false);
	let isSongInProgress = useRef(false);
	let currBeatIndex = useRef(0);

	let keyframes = useRef(Array(0)); // Object array where each Object contains the keyframes of animation
	let durations = useRef(Array(0)); // Object array where each Object contains the duration of animation
	let timings = useRef(Array(0)); // Float array of time taken to reach activation circle
	let beatIds = useRef(Array(0));
	let beats = useRef(Array(0));

	let windowWidth = useRef(0);
	let translateOffset = useRef(0); // The extra length a beat travels after reaching the activation circle

	console.log('In rhythm lane, ', props.isSongEnd, isInitialised);

	if (props.isSongEnd) {
		console.log('Resetting state as song has ended');
		isSongInProgress.current = false;
		document.removeEventListener('keydown', keyDownHandler);
	}

	if (props.active && !isInitialised) {
		windowWidth.current = window.innerWidth;
		translateOffset.current = 70 + windowWidth.current * 0.25;
		console.log(windowWidth.current, translateOffset.current);
		loadAudio();
		createBeats();
		waitForBeatsToLoad();
	}

	function loadAudio() {
		if (props.lane == 'top') {
			AUDIO_PLAYER.src = URL.createObjectURL(props.songData.audioBlob);
			AUDIO_PLAYER.load();
			AUDIO_PLAYER.addEventListener('ended', (e) => {
				console.log('------------------SONG END---------------------');
				songEndRhythmLane();
			});
		}
	}

	function createBeats() {
		console.log('Creating beats!!!', props.lane);

		const songData = props.songData;
		const bpm = songData.bpm;
		const crotchet = 60 * 1000 / bpm;
		const initOffset = songData.initOffset;

		let beats = props.lane == 'top' ? songData.beatmapAssets.top : songData.beatmapAssets.bottom;

		lastBeatOfTop.current = songData.beatmapAssets.top.at(-1)[0];
		lastBeatOfBottom.current = songData.beatmapAssets.bottom.at(-1)[0];

		currBeatIndex.current = 0;


		beatIds.current = Array(beats.length);
		keyframes.current = Array(beats.length);
		durations.current = Array(beats.length);
		timings.current = Array(beats.length);

		let currX;

		for (const i in beats) {

			beatIds.current[i] = beats[i][0];
			currX = translateOffset.current + initOffset + beats[i][1] * crotchet;

			keyframes.current[i] = [
				{ transform: `translateX(${currX}px)`, visibility: 'visible' },
				{ transform: `translateX(0px)`, visibility: 'hidden' }
			];

			durations.current[i] = {
				duration: currX,
			}

			timings.current[i] = currX - translateOffset.current;
		}
	}

	function waitForBeatsToLoad() {
		console.log('waiting', 'beat-' + lastBeatOfTop.current, ' and ', lastBeatOfBottom.current);

		// Wait for the last beat of both the top and bottom lanes to load
		// Then wait wait a a couple of seconds as defined by fixedDelay
		// Then wait for audio file to load
		waitForElm('#beat-' + lastBeatOfTop.current).then((elm) => {
			console.log('Element is ready: ', elm, props.lane);
			waitForElm('#beat-' + lastBeatOfBottom.current).then((elm) => {
				console.log('Element is ready: ', elm, props.lane);
				setTimeout(function() {
					beginSong();
				}, FIXED_DELAY);
			});
		});
	}

	function beginSong() {
		console.log('Attempting to begin song... ', props.active, isSongInProgress.current);

		if (!props.active || isSongInProgress.current) {
			return;
		}
		isSongInProgress.current = true;

		console.log('beginning song');

		if (props.lane == 'top') {
			AUDIO_PLAYER.play();
			props.scoreboardFunctions.startProgressBar(AUDIO_PLAYER.duration);
		}
		
		beats.current = Array(keyframes.current.length);
		for (const i in keyframes.current) {
			const beatId = beatIds.current[i];
			const beat = document.getElementById('beat-' + beatId);
			beats.current[i] = beat;

			const beatWrapper = document.getElementById('beat-wrapper-' + beatId);

			// Animation ends when beat exits the left side of the screen
			beatWrapper.animate(keyframes.current[i], durations.current[i]).onfinish = () => {
				beat.classList.remove('beat-hit');
				beat.classList.remove('beat-hit-miss');
			};

			// Animation ends when beat has passed the hit window
			// Consider beat as 'MISS'
			beat.animate([], { duration: timings.current[i] + MISS_WINDOW }).onfinish = () => {
				if (beats.current[currBeatIndex.current] == beat) {
					beat.classList.add('beat-hit-miss');

					const hitTextDiv = hitText.current;
					hitTextDiv.innerText = 'MISS!';
					hitTextDiv.style.color = 'red';
					resetAnimations(hitTextDiv);
					hitTextDiv.classList.add('hit-text-active');

					currBeatIndex.current++;

					props.scoreboardFunctions.updateScoreboard(0, JUDGEMENT_TYPES.MISS);
				}
			}

		}



		activationCircle.current.addEventListener('animationend', (e) => {
			activationCircle.current.classList.remove('activation-circle-hit');
		});

		hitText.current.addEventListener('animationend', (e) => {
			hitText.current.classList.remove('hit-text-active');
		});

		if (!isKeydownAdded.current) {
			document.addEventListener('keydown', keyDownHandler);

			isKeydownAdded.current = true;
		}


	}

	function keyDownHandler(e) {
		console.log(e.key);

			if (props.lane == 'top' && (e.key === 's' || e.key === 'd')
					|| props.lane == 'bottom' && (e.key === 'j' || e.key === 'k')) {

				hitSoundAudio.currentTime = 0;
				hitSoundAudio.play();
				activationCircle.current.classList.add('activation-circle-hit');

				if (beats.current.length > currBeatIndex.current) {

					const curBeat = beats.current[currBeatIndex.current];
					const diffTiming = AUDIO_PLAYER.currentTime * 1000 + LATENCY - timings.current[currBeatIndex.current];
					const absDiffTiming = Math.abs(diffTiming);
					const isEarly = diffTiming < 0;

					const hitTextDiv = hitText.current;

					if (absDiffTiming > MISS_WINDOW) {
						return;
					}

					resetAnimations(hitTextDiv);

					hitTextDiv.classList.add('hit-text-active');

					const beatAcc = calculateAccuracy(absDiffTiming);
					let beatJudgement;

					if (absDiffTiming <= PERFECT_WINDOW) {

						curBeat.classList.add('beat-hit');
						hitTextDiv.innerText = 'Perfect!';
						hitTextDiv.style.color = 'lightgreen';
						beatJudgement = JUDGEMENT_TYPES.PERFECT;

					} else if (absDiffTiming <= FAR_WINDOW) {

						curBeat.classList.add('beat-hit');

						if (isEarly) {

							hitTextDiv.innerText = 'Early!';
							hitTextDiv.style.color = 'deepskyblue';
							beatJudgement = JUDGEMENT_TYPES.EARLY;

						} else {

							hitTextDiv.innerText = 'Late!';
							hitTextDiv.style.color = 'orange';
							beatJudgement = JUDGEMENT_TYPES.LATE;

						}
					} else { // absDiffTiming <= MISS_WINDOW

						curBeat.classList.add('beat-hit-miss');
						hitTextDiv.innerText = 'MISS!';
						hitTextDiv.style.color = 'red';
						beatJudgement = JUDGEMENT_TYPES.MISS;

					}

					currBeatIndex.current++;

					props.scoreboardFunctions.updateScoreboard(calculateAccuracy(absDiffTiming), beatJudgement);

				}

			}
	}

	function songEndRhythmLane() {
		props.scoreboardFunctions.songEndScoreboard();
	}

	function resetAnimations(targetDiv) {
		targetDiv.getAnimations().forEach((anim) => {
			anim.cancel();
			anim.play();
		});
	}

	return (
		<div className={'rhythm-lane ' + props.lane}>
			<div className={props.active ? 'activation-line-active' : 'activation-line-inactive'}></div>
			<div className='beat-container'>
				<div className='hit-text-container'>
					<div className='hit-text' ref={hitText}>Perfect!</div>
				</div>
				<div className='activation-beat-container'>
					<div className={props.active ? 'activation-circle-active' : 'activation-circle-inactive'} ref={activationCircle}></div>
				</div>
				{beatIds.current.map((item, index) => (
					<div className='beat-wrapper' key={item} id={'beat-wrapper-' + item}>
						<div className='beat' key={item} id={'beat-' + item}></div>
					</div>
				))}
			</div>
		</div>
	)
}

export default RhythmLane;