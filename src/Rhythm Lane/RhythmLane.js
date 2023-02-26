import { useRef } from 'react';
import './RhythmLane.css';
import hitSound from '../assets/audio/hit-sound.mp3';

const AUDIO_PLAYER = new Audio();
const FIXED_DELAY = 1000;
const LATENCY = 100;
const PERFECT_WINDOW = 80;
const FAR_WINDOW = 125;
const MISS_WINDOW = 200;

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
	console.log('props: ', props);

	const hitSoundAudio = new Audio(hitSound);
	const activationCircle = useRef();
	const hitText = useRef();

	let lastBeatOfTop;
	let lastBeatOfBottom;

	let isSongInProgress = false;

	let keyframes = Array(0); // Object array where each Object contains the keyframes of animation
	let durations = Array(0); // Object array where each Object contains the duration of animation
	let timings = Array(0); // Float array of time taken to reach activation circle
	let beatIds = Array(0);
	let beats = Array(0);

	let windowWidth = 0;
	let translateOffset = 0; // The extra length a beat travels after reaching the activation circle

	if (props.active) {
		console.log(props.songData);
		windowWidth = window.innerWidth;
		translateOffset = 70 + windowWidth * 0.255;
		console.log(windowWidth, translateOffset);
		loadAudio();
		createBeats();
	}

	function loadAudio() {
		if (props.lane == 'top') {
			AUDIO_PLAYER.src = URL.createObjectURL(props.songData.audioBlob);
			AUDIO_PLAYER.load();
		}
	}

	function createBeats() {
		const songData = props.songData;
		const bpm = songData.bpm;
		const crotchet = 60 * 1000 / bpm;
		console.log('bpm: ', bpm, 'crotchet: ', crotchet);
		const initOffset = songData.initOffset;

		let beats = props.lane == 'top' ? songData.beatmapAssets.top : songData.beatmapAssets.bottom;

		lastBeatOfTop = songData.beatmapAssets.top.at(-1)[0];
		lastBeatOfBottom = songData.beatmapAssets.bottom.at(-1)[0];

		beatIds = Array(beats.length);
		keyframes = Array(beats.length);
		durations = Array(beats.length);
		timings = Array(beats.length);

		console.log('Just become active', keyframes.length);

		let currX;
		for (const i in beats) {
			console.log('beat ', i, ': ', beats[i][1], " pos: ", beats[i][0]);
			beatIds[i] = beats[i][0];

			currX = translateOffset + initOffset + beats[i][1] * crotchet;

			keyframes[i] = [
				{ transform: `translateX(${currX}px)`, visibility: 'visible' },
				{ transform: `translateX(0px)`, visibility: 'hidden' }
			];

			durations[i] = {
				duration: currX,
			}

			timings[i] = currX - translateOffset;
		}
	}

	function waitForBeatsToLoad() {
		console.log('waiting', 'beat-' + lastBeatOfTop, ' and ', lastBeatOfBottom);

		// Wait for the last beat of both the top and bottom lanes to load
		// Then wait wait a a couple of seconds as defined by fixedDelay
		// Then wait for audio file to load
		waitForElm('#beat-' + lastBeatOfTop).then((elm) => {
			console.log('Element is ready: ', elm, props.lane);
			waitForElm('#beat-' + lastBeatOfBottom).then((elm) => {
				console.log('Element is ready: ', elm, 'bottom');
				setTimeout(function() {
					beginSong();
				}, FIXED_DELAY);
			});
		});
	}

	function beginSong() {
		if (!props.active || isSongInProgress) {
			return;
		}
		isSongInProgress = true;

		console.log('beginning song');
		
		beats = Array(keyframes.length);
		for (const i in keyframes) {
			const beatId = beatIds[i];
			const beat = document.getElementById('beat-' + beatId);
			beats[i] = beat;

			const beatWrapper = document.getElementById('beat-wrapper-' + beatId);

			beatWrapper.animate(keyframes[i], durations[i]).onfinish = () => {
				console.log('finish animate');
				beatWrapper.classList.add('beat-inactive');
			};

			beat.animate([], { duration: timings[i] + MISS_WINDOW }).onfinish = () => {
				if (beats.at(-1) == beat) {
					console.log('MISSED LATE!!!');
					beat.classList.add('beat-hit-miss');

					const hitTextDiv = hitText.current;
					hitTextDiv.innerText = 'MISS!';
					hitTextDiv.style.color = 'red';
					resetAnimations(hitTextDiv);
					hitTextDiv.classList.add('hit-text-active');

					beats.pop();
					timings.pop();
				}
			}

		}

		if (props.lane == 'top') {
			AUDIO_PLAYER.play();
		}

		beats.reverse();
		timings.reverse();

		activationCircle.current.addEventListener('animationend', (e) => {
			activationCircle.current.classList.remove('activation-circle-hit');
		});

		hitText.current.addEventListener('animationend', (e) => {
			hitText.current.classList.remove('hit-text-active');
		});

		document.addEventListener('keydown', (e) => {

			if (props.lane == 'top' && (e.key === 's' || e.key === 'd')
					|| props.lane == 'bottom' && (e.key === 'j' || e.key === 'k')) {

				hitSoundAudio.currentTime = 0;
				hitSoundAudio.play();
				activationCircle.current.classList.add('activation-circle-hit');

				if (beats.length > 0) {
					const curBeat = beats.at(-1);
					const diffTiming = AUDIO_PLAYER.currentTime * 1000 + LATENCY - timings.at(-1);
					const absDiffTiming = Math.abs(diffTiming);
					const isEarly = diffTiming < 0;

					const hitTextDiv = hitText.current;
					console.log(AUDIO_PLAYER.currentTime * 1000 + LATENCY, diffTiming);

					if (absDiffTiming > MISS_WINDOW) {
						return;
					}

					resetAnimations(hitTextDiv);

					hitTextDiv.classList.add('hit-text-active');

					if (absDiffTiming <= PERFECT_WINDOW) {
						curBeat.classList.add('beat-hit');
						hitTextDiv.innerText = 'Perfect!';
						hitTextDiv.style.color = 'lightgreen';
					} else if (absDiffTiming <= FAR_WINDOW) {
						curBeat.classList.add('beat-hit');
						if (isEarly) {
							hitTextDiv.innerText = 'Early!';
							hitTextDiv.style.color = 'deepskyblue';
						} else {
							hitTextDiv.innerText = 'Late!';
							hitTextDiv.style.color = 'orange';
						}
					} else { // absDiffTiming <= MISS_WINDOW
						curBeat.classList.add('beat-hit-miss');
						hitTextDiv.innerText = 'MISS!';
						hitTextDiv.style.color = 'red';
					}

					beats.pop();
					timings.pop();

				}

			} 
		});

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
				{beatIds.map((item, index) => (
					<div className='beat-wrapper' key={item} id={'beat-wrapper-' + item}>
						<div className='beat' key={item} id={'beat-' + item}></div>
					</div>
				))} 
				{waitForBeatsToLoad()}
			</div>
		</div>
	)
}

export default RhythmLane;