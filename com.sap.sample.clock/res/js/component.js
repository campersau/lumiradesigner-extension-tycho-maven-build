sap.designstudio.sdk.Component.subclass("com.sap.sample.clock.Clock", function() {

	var that = this;

	this.tagCanvas = null;

	this.init = function() {
		this.tagCanvas = document.createElement("canvas");
		this.$().append($(this.tagCanvas));
	};

	this.afterUpdate = function() {
		setInterval(clock, 100);
	};

	var saveIsRailwayClock = false;
	
	this.isRailwayClock = function(value) {
		if (value == undefined) {
			return saveIsRailwayClock;
		} else {
			saveIsRailwayClock = value;
			return this;
		}
	};	

	function clock() {

		var DEG2RAD = Math.PI / 180;
		var COLOR_DARK_RED = "#D80000";
		var DELAY_SECS = 2; // delay second hand that many seconds at noon position

		var w = that.$().width();
		var h = that.$().height();

		that.tagCanvas.setAttribute("width", "" + w);
		that.tagCanvas.setAttribute("height", "" + h);

		var UNIT = 100;
		var scale = Math.min(w, h) / (2 * UNIT);

		var halfWidth = UNIT * scale;

		var bodyWidth = 8.0 * scale;

		var hourTickStart = 75 * scale;
		var hourTickEnd = 85 * scale;
		var hourTickWidth = 5 * scale;

		var minuteTickStart = 81 * scale;
		var minuteTickEnd = 85 * scale;
		var minuteTickWidth = 3 * scale;

		var hourHandStart = -10 * scale;
		var hourHandEnd = 55 * scale;
		var hourHandWidth = 10 * scale;

		var minuteHandStart = -10 * scale;
		var minuteHandEnd = 80 * scale;
		var minuteHandWidth = 6 * scale;

		var secondHandStart = 0 * scale;
		var secondHandEnd = 71 * scale;
		var secondHandWidth = 3 * scale;

		var secondHandRingOffset = 50 * scale;
		var secondHandRingRadius = 10 * scale;

		var bossRadius = 8.0 * scale;

		var shadowOffsetX = 2 * scale;
		var shadowOffsetY = 2 * scale;
		var shadowOffsetBlur = 5 * scale;
		var shadowColor = "rgba(0, 0, 0, 0.4)";

		var ctx = that.tagCanvas.getContext("2d");

		// clear canvas

		ctx.clearRect(0, 0,  2 * halfWidth, 2 * halfWidth);
		ctx.translate(halfWidth, halfWidth);
		ctx.rotate(-90 * DEG2RAD);

		// draw clock body

		ctx.strokeStyle = "black";
		ctx.fillStyle = "white";
		ctx.lineWidth = bodyWidth;
		ctx.lineCap = saveIsRailwayClock ? "square" : "round";

		ctx.beginPath();
		ctx.arc(0, 0, (halfWidth - bodyWidth / 2), 0, 360 * DEG2RAD);
		ctx.fill();

		ctx.save();
		ctx.shadowOffsetX = shadowOffsetX;
		ctx.shadowOffsetY = shadowOffsetY;
		ctx.shadowBlur = shadowOffsetBlur;
		ctx.shadowColor = shadowColor;

		ctx.beginPath();
		ctx.arc(0, 0, (halfWidth - bodyWidth / 2), 225 * DEG2RAD, 45 * DEG2RAD);
		ctx.stroke();
		ctx.restore();

		ctx.beginPath();
		ctx.arc(0, 0, (halfWidth - bodyWidth / 2), 0, 360 * DEG2RAD);
		ctx.stroke();

		// draw hour ticks

		ctx.lineWidth = hourTickWidth;
		ctx.save();
		for (var i = 0; i < 12; i++) {
			ctx.rotate(360 / 12 * DEG2RAD);
			ctx.beginPath();
			ctx.moveTo(hourTickStart, 0);
			ctx.lineTo(hourTickEnd, 0);
			ctx.stroke();
		}
		ctx.restore();

		// draw minute ticks

		ctx.save();
		ctx.lineWidth =  minuteTickWidth * (saveIsRailwayClock ? 0.75 : 1.0);
		for (i = 0; i < 60; i++) {
			if (i % 5 != 0) {
				ctx.beginPath();
				ctx.moveTo(minuteTickStart, 0);
				ctx.lineTo(minuteTickEnd, 0);
				ctx.stroke();
			}
			ctx.rotate(360 / 60 * DEG2RAD);
		}
		ctx.restore();

		// draw hands

		var now = new Date();
		var hours = now.getHours() % 12;
		var minutes = now.getMinutes();
		var seconds = now.getSeconds();
		var milliseconds = now.getMilliseconds();

		ctx.save();
		ctx.shadowOffsetX = shadowOffsetX;
		ctx.shadowOffsetY = shadowOffsetY;
		ctx.shadowBlur = shadowOffsetBlur;
		ctx.shadowColor = shadowColor;

		ctx.rotate(((hours / 12) + (minutes / 12 / 60) + (seconds / 60 / 60 / 12)) * 360 * DEG2RAD);
		ctx.lineWidth = hourHandWidth;
		ctx.beginPath();
		ctx.moveTo(hourHandStart, 0);
		ctx.lineTo(hourHandEnd, 0);
		ctx.stroke();
		ctx.restore();

		// draw minute hand

		ctx.save();
		ctx.shadowOffsetX = shadowOffsetX;
		ctx.shadowOffsetY = shadowOffsetY;
		ctx.shadowBlur = shadowOffsetBlur;
		ctx.shadowColor = shadowColor;

		if (saveIsRailwayClock) {
			ctx.rotate(minutes / 60 * 360 * DEG2RAD);
		} else {
			ctx.rotate(((minutes / 60) + (seconds / 60 / 60)) * 360 * DEG2RAD);
		}

		ctx.lineWidth = minuteHandWidth;
		ctx.beginPath();
		ctx.moveTo(minuteHandStart, 0);
		ctx.lineTo(minuteHandEnd, 0);
		ctx.stroke();
		ctx.restore();

		// draw second hand

		ctx.save();
		ctx.shadowOffsetX = shadowOffsetX;
		ctx.shadowOffsetY = shadowOffsetY;
		ctx.shadowBlur = shadowOffsetBlur;
		ctx.shadowColor = shadowColor;

		if (saveIsRailwayClock) {
			ctx.rotate(displaySeconds(seconds + milliseconds / 1000, DELAY_SECS) / 60 * 360 * DEG2RAD);
		} else {
			ctx.rotate(seconds / 60 * 360 * DEG2RAD);
		}

		ctx.strokeStyle = COLOR_DARK_RED;
		ctx.lineWidth = secondHandWidth;
		ctx.beginPath();
		ctx.moveTo(secondHandStart, 0);

		if (saveIsRailwayClock) {
			ctx.arc(secondHandRingOffset, 0, secondHandRingRadius, 180 * DEG2RAD, 360 * DEG2RAD);
			ctx.lineTo(secondHandEnd, 0);
			ctx.arc(secondHandRingOffset, 0, secondHandRingRadius, 360 * DEG2RAD, 180 * DEG2RAD);
		} else {
			ctx.lineTo(secondHandEnd, 0);
		}

		ctx.moveTo(0, 0);
		ctx.arc(0, 0, bossRadius - secondHandWidth / 2, 0, 360 * DEG2RAD);
		ctx.stroke();
		ctx.restore();

		// draw boss

		ctx.save();
		ctx.fillStyle = COLOR_DARK_RED;
		ctx.beginPath();
		ctx.arc(0, 0, bossRadius, 0, 360 * DEG2RAD);
		ctx.fill();
		ctx.restore();
	}

	function displaySeconds(fullSeconds, delaySeconds) {
		 return (fullSeconds > (60 - delaySeconds)) ? 0 : fullSeconds / (60 - delaySeconds) * 60;
	}
});
