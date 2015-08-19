var duration = 8; // seconds

var sloganSource = 'images/data.json';
var imagesPath = 'images/';

var defaultCrimeSource = 'crimes.json';
var defaultCrimes = [];
var defaultCrimeProbability = 0.3;

var side = 0;

Array.prototype.randomize = function() {
	var i = this.length, j, temp;
	if (i > 1 && (i > 2 || Math.random() > 0.5)) {
		while ( --i ) {
			j = Math.floor( Math.random() * i );
			temp = this[i];
			this[i] = this[j];
			this[j] = temp;
		}
	}
}

var reloadSlogans = function() {
	$.ajax({ url: sloganSource, dataType: "json", success: processSlogans, cache: false })
}

var processSlogans = function(data) {
	data.randomize();
	preloadImages(data);
	iterateSlogans(data, 0)
};

var iterateSlogans = function(data, i) {
	if (i < data.length) {
		showSlogan(data[i]);
		side = (side + 1) % 2;
		setTimeout(function() {
			iterateSlogans(data, i + 1);
		}, duration * 1000);
	} else {
		reloadSlogans();
	}
}

var preloadImages = function(data) {
	$.each(data, function(i, slogan) {
		var img = new Image();
		img.src = imagesPath + slogan.image;
	});
}

var showSlogan = function(slogan) {
	var poster = "#poster" + side;
	$(poster + " .picture").show().attr("src", imagesPath + slogan.image);

	var crime = getRandomCrime(slogan);
	var date = new Date(slogan.date);
	var dateString = $.format.date(date, "yyyyMMdd");
	var timeString = $.format.date(date, "SSS-HH:mm:ss");
	changeCaptionLine(poster, timeString, ' .line1 .left');
	changeCaptionLine(poster, dateString, ' .line1 .right');
	changeCaptionLine(poster, slogan.name || '&nbsp;', ' .line2 .center');
	changeCaptionLine(poster, crime || '&nbsp;', ' .line3 .left');

	placeClaim(poster);
}

var placeClaim = function(poster) {
  var scale = 1 + randomRange(0.1);
	$(poster + " .claim").css("-webkit-transform",
	                          "skewX(" + randomRange(1) + "deg) " +
														"skewY(" + randomRange(3) + "deg) " +
														"rotate(" + randomRange(5) + "deg) " +
													  "translateX(" + randomRange(30) + "px) " +
													  "translateY(" + randomRange(60) + "px) " +
													  "scale(" + scale + "," + scale + ")");
}

var randomRange = function(range) {
	return 2.0 * range * Math.random() - range;
	//return -range;
}

var getRandomCrime = function(slogan) {
	addToDefaultCrimes(slogan.crime);
	return optionallyUseDefaultCrime(slogan.crime);
}

var addToDefaultCrimes = function(crime) {
	if (crime.length > 0 &&
		$.inArray(crime, defaultCrimes) < 0) {
		defaultCrimes.push(crime);
	}
}

var optionallyUseDefaultCrime = function(crime) {
	if (defaultCrimes.length > 0 &&
		(crime.length == 0 ||
		 Math.random() < defaultCrimeProbability)) {
		defaultCrimes.randomize();
		return defaultCrimes[0];
	} else {
		return crime;
	}
}

var changeCaptionLine = function(poster, line, css) {
	$(poster + css).html(line);
}

var setCatcher = function(poster) {
	var catcher = $(poster + ' .catcher img');
	if (Math.random() < catcherProbability) {
		catchers.randomize();
		catcher.attr('src', catcherPath + catchers[0]).show();
	} else {
		catcher.hide();
	}
}

var splitCaption = function(caption) {
	return splitLineBySeparators(caption, ["\n", ".", "-", ",", ":", " "]);
}

var splitLineBySeparators = function(line, separators) {
	var sep = separators.shift();
	var lines = splitNonEmpty(line, sep);
	switch (lines.length) {
		case 1:
			if (separators.length == 0) {
				return [line, ''];
			} else {
				return splitLineBySeparators(line, separators);
			}
		case 2:
			return lines;
		default:
			return randomJoinLines(lines);
	}
}

var splitNonEmpty = function(line, separator) {
	var lines = line.split(separator);
	appendSeparator(lines, separator);
	if (lines[lines.length - 1].length == 0) {
		lines.pop();
	}
	return lines;
}

var appendSeparator = function(lines, separator) {
	for (var i = 0; i < lines.length - 1; i++) {
		lines[i] = lines[i] + separator;
	}
}

var randomJoinLines = function(lines) {
	var split = Math.floor(1 + (lines.length - 1) * Math.random());
	var line1 = '';
	var line2 = '';
	for (var i = 0; i < split; i++) {
		line1 += lines[i];
	}
	for (var i = split; i < lines.length; i++) {
		line2 += lines[i];
	}
	return [line1, line2];
}

var loadDefaultCrimes = function() {
	$.getJSON(defaultCrimeSource, function(data) {
		defaultCrimes = data;
	});
}

var requestFullScreen = function() {
	if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement &&
			!document.webkitFullscreenElement &&
			!document.msFullscreenElement ) {  // current working methods
		var el = $('body').get(0);
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  }
}

$(function() {
	loadDefaultCrimes();
	reloadSlogans();
	$(document).on('keydown', function(e) {
		if (e.keyCode == 13) {
			requestFullScreen();
		}
	})
});
