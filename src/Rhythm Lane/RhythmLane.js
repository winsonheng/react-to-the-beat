import { useRef } from 'react';
import './RhythmLane.css';
import hitSound from '../assets/audio/hit-sound.mp3';

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

	const activationCircle = useRef();
	let isSongInProgress = false;

	let keyframes = Array(0);
	let timings = Array(0);
	let beats = Array(0);

	if (props.active) {

		// TODO: Check how to make this work
		console.log(props.songData);
		const bpm = 231;
		const crotchet = 60 * 1000 / bpm;
		const initOffset = 1800;

		if (props.lane == 'top') {
			let audio = new Audio(URL.createObjectURL(props.songData.audioBlob));
    	audio.load();
    	audio.play();
		}

		const arr = [0,3,3.5,4,5,6,7,8,10,12,14,16,19,19.5,20,21,22,23,24,24.25,24.5,24.75,25,25.25,25.5,25.75,26,26.25,26.5,26.75,27,27.25,27.5,27.75,28];
		keyframes = Array(arr.length).fill(0);
		timings = Array(arr.length).fill(0);

		console.log('Just become active', keyframes.length);

		let currX = 1000;
		for (const i in arr) {
			currX = initOffset + arr[i] * crotchet;
			keyframes[i] = [
				{ transform: `translateX(${currX}px)`, visibility: 'visible' },
				{ transform: `translateX(0px)`, visibility: 'hidden' }
			];
			timings[i] = {
				duration: currX,
			}
		}

	}

	function waitForBeatsToLoad() {
		console.log('waiting', 'beat-' + (keyframes.length - 1));
		waitForElm('#beat-' + (keyframes.length - 1)).then((elm) => {
			console.log('Element is ready');
			beginSong();
		});
	}

	function beginSong() {
		if (!props.active || isSongInProgress) {
			return;
		}
		isSongInProgress = true;

		console.log('beginning');
		beats = Array(keyframes.length);
		for (const i in keyframes) {
			const beatWrapper = document.getElementById(props.lane+'-beat-wrapper-' + i);
			beatWrapper.animate(keyframes[i], timings[i]);
			beatWrapper.addEventListener('animationend', (e) => {
				console.log('finish');
				beatWrapper.classList.add('beat-inactive');
			});
			const beat = document.getElementById(props.lane+'-beat-' + i);
			beats[i] = beat;
		}

		beats.reverse();

		const songPlayer = document.querySelector('#song-player');

		setTimeout(() => {
			songPlayer.currentTime = 0;
			songPlayer.play();
		}, 1000);

		activationCircle.current.addEventListener('animationend', (e) => {
			activationCircle.current.classList.remove('activation-circle-hit');
		});

		document.addEventListener('keydown', (e) => {
			const audio = new Audio(hitSound);
			audio.play();
			activationCircle.current.classList.add('activation-circle-hit');
			if (beats.length > 0) {
				beats.pop().classList.add('beat-hit');
			}
		});

	}

	return (
		<div className='rhythm-lane'>
			<div className={props.active ? 'activation-line-active' : 'activation-line-inactive'}></div>
			<audio id='song-player' src={props.songData == null ? null : props.songData.songSrc} preload='auto'></audio>
			<div className='beat-container'>
				<div className='activation-beat-container'>
					<div className={props.active ? 'activation-circle-active' : 'activation-circle-inactive'} ref={activationCircle}></div>
				</div>
				{keyframes.map((item, index) => (
					<div className='beat-wrapper' key={index} id={props.lane + '-beat-wrapper-' + index}>
						<div className='beat' key={index} id={props.lane+'-beat-' + index}></div>
					</div>
				))} 
				{waitForBeatsToLoad()}
			</div>
		</div>
	)
}

export default RhythmLane;