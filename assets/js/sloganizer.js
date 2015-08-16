var duration = 2; // seconds

var sloganSource = 'images/data.json';
var imagesPath = 'images/';

var defaultCaptionSource = 'claims.json';
var defaultCaptions = [];
var defaultCaptionProbability = 0.0;

var catcherPath = 'catcher/';
var catcherSource = 'catchers.json';
var catchers = [];
var catcherProbability = 0.6;

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
	$.getJSON(sloganSource, processSlogans);
}

var processSlogans = function(data) {
	//data.randomize();
	preloadImages(data);
	iterateSlogans(data, 0)
};

var iterateSlogans = function(data, i) {
	if (i < data.length) {
		showSlogan(data[i]);
		//side = (side + 1) % 2;
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

	var lines = splitCaption(getRandomCaption(slogan));
	changeCaptionLine(poster, lines[0], ' .line1');
	changeCaptionLine(poster, lines[1], ' .line2');

	setCatcher(poster);
}

var getRandomCaption = function(slogan) {
	slogan.captions.randomize();
	var caption = slogan.captions[0].trim();
	//addToDefaultCaptions(caption);
	return optionallyUseDefaultCaption(caption);
}

var addToDefaultCaptions = function(caption) {
	if (caption.length > 0 &&
		$.inArray(caption, defaultCaptions) < 0) {
		defaultCaptions.push(caption);
	}
}

var optionallyUseDefaultCaption = function(caption) {
	if (defaultCaptions.length > 0 &&
		(caption.length == 0 ||
		 Math.random() < defaultCaptionProbability)) {
		defaultCaptions.randomize();
		return defaultCaptions[0];
	} else {
		return caption;
	}
}

var changeCaptionLine = function(poster, line, css) {
	var width = Math.floor(60 + Math.random() * 50);
	$(poster + css + " .slabtext").html(line);
	$(poster + css + ".slabtextdone").
		removeClass('slabtextdone').
		addClass('slabtextinactive').
		attr('style', 'width: ' + width + '%').
		slabText({maxFontSize: 144});
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

var loadDefaultCaptions = function() {
	$.getJSON(defaultCaptionSource, function(data) {
		defaultCaptions = data;
	});
}

var loadCatchers = function() {
	$.getJSON(catcherSource, function(data) {
		catchers = data;
		$.each(data, function(i, catcher) {
			var img = new Image();
			img.src = catcherPath + catcher;
		});
	});
}

$(function() {
	loadDefaultCaptions();
	loadCatchers();
	reloadSlogans();
});
