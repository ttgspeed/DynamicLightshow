var stats = new Stats();

// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

setInterval( function () {

    stats.begin();

    	var analyser, canvas, canvasContext;

		window.addEventListener('load', init, false);
		
		//bpm divided by 4
		var qbpm = 30;
		
		//set some stuff up
		var ittr = 0;
		var beat = 1;
		
		var runtotal = 0;
		var runavg = 0;
		
		var beattotal = 0;
		var beatavg = 0;
		
		function init() {
			setupWebAudio();
			setupDrawingCanvas();
			draw();
		}
		
		// Wire up the <audio> element with the Web Audio analyser (currently Webkit only)
		function setupWebAudio() {
			// Get our <audio> element
			var audio = document.getElementById('music');
			// Create a new audio context (that allows us to do all the Web Audio stuff)
			var audioContext = new webkitAudioContext();
			// Create a new analyser
			analyser = audioContext.createAnalyser();
			// Create a new audio source from the <audio> element
			var source = audioContext.createMediaElementSource(audio);
			// Connect up the output from the audio source to the input of the analyser
			source.connect(analyser);
			// Connect up the audio output of the analyser to the audioContext destination i.e. the speakers (The analyser takes the output of the <audio> element and swallows it. If we want to hear the sound of the <audio> element then we need to re-route the analyser's output to the speakers)
			analyser.connect(audioContext.destination);
		
			// Get the <audio> element started	
			audio.play();
		}
		
		// Draw the audio frequencies to screen
		function draw() {
			ittr++;
			
			//ghetto way of counting beats
			if(ittr >= qbpm)
				beat++;
			
			// Setup the next frame of the drawing
			webkitRequestAnimationFrame(draw);
		  
			// Create a new array that we can copy the frequency data into
			var freqByteData = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(freqByteData);
		
			//empty canvas so we aren't drawing on top of existing bars
			canvasContext.clearRect(0, 0, canvas.width, canvas.height);
		
			//add the current volume to the total
			for (var i = 0; i < freqByteData.length; i++) {		
				runtotal += parseInt(freqByteData[i]);
			}
			
			//the average max volume for the current run (~30 runs per beat)
			runavg = Math.floor(runtotal/freqByteData.length);
			
			beattotal += runavg;
			
			//the average volume for the beat
			if(ittr >= qbpm)
			{
				beatavg = Math.floor(beattotal/qbpm);
			}
			
			//draw some stats
			$("#work").text("Beat: "+beat+" || Run Avg: "+runavg+" || Beat Avg: "+beatavg);
			
			//control the top lights. If the current run is louder than the beat's average volume, turn the lights on
			if((parseInt(runavg) > beatavg))
			{	
				$(".mau5").css("background-image", "url('img/cubeOn.png')");
				if(ittr%4 == 0){
					lightnum = Math.floor(Math.random() * 3) + 1;
					$("#l"+lightnum).css("background-image", "url('img/lightOn.png')");
					$("#r"+lightnum).css("background-image", "url('img/lightOn.png')");
				}
			}
			else
			{
				$(".mau5").css("background-image", "url('img/cubeOff.png')");
			}
			if(ittr%4 == 3){
				for(i = 1; i < 4; i++){
					$("#l"+i).css("background-image", "url('img/lightOff.png')");
					$("#r"+i).css("background-image", "url('img/lightOff.png')");
				}
			}
			
			//reset the run
			runtotal = 0;
			
			
			if(ittr >= qbpm)
			{
				//more lights because why not. These will be less frequent though (controls the cube)
				if(beatavg > 0)
					$(".lights").css("background-image", "url('img/powerOn.png')");
				else
					$(".lights").css("background-image", "url('img/powerOff.png')");
				
				//reset everything else because we just completed one beat	
				ittr = 0;
				beattotal = 0;
				
				//reset the beat because we just completed a measure
				if(beat > 4)
				{
					beat = 1;
				}
			}
		}
		
		// Basic setup for the canvas element, so we can draw something on screen
		function setupDrawingCanvas() {
			canvas = document.createElement('canvas');
			// 1024 is the number of samples that's available in the frequency data
			canvas.width = 800;
			// 255 is the maximum magnitude of a value in the frequency data
			canvas.height = 600;
			document.body.appendChild(canvas);
			canvasContext = canvas.getContext('2d');
			canvasContext.fillStyle = "#742dd7";
		}

    stats.end();

}, 1000 / 60 );