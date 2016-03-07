/*
# This file is part of TranslateIT.
#
# Copyright(c) 2015 Giacomo Cerquone
# cerquone96@hotmail.it
# http://www.giacomocerquone.it
#
# This file may be licensed under the terms of of the
# GNU General Public License Version 2 (the ``GPL'').
#
# Software distributed under the License is distributed
# on an ``AS IS'' basis, WITHOUT WARRANTY OF ANY KIND, either
# express or implied. See the GPL for the specific language
# governing rights and limitations.
#
# You should have received a copy of the GPL along with this
# program. If not, go to http://www.gnu.org/licenses/gpl.html
# or write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
*/

/* CREATING VARS */
/* Node_modules */
var fs = require('fs'),
	parser = require("subtitles.parser.min.js"),
	gui = require('nw.gui'),
	win = gui.Window.get(),
/* Caching titlebar buttons */
 	$min = $('#min'),
	$max = $('#max'),
	$close = $('#close'),
/* State variable */
 	maximized = 0,
/* Caching other page elements */
	$range = $('input[type=range]'),
	$range_value = $('.range-value'),
	$text = $('input[type=text]'),
	$minutes = $('#minutes'),
	$read_srt_text = $('#read'),
/* Creating old_srt to store the uploaded srt */
	old_srt,
/* Creating new_srt to prepare the creation of the new srt */
	new_srt;

/* TITLEBAR BUTTONS */
$min.click(function() {
	win.minimize()
});
$max.click(function() {
	$(this).toggleClass("unmax");
	if(maximized) {
		win.unmaximize();
	} else {
		win.maximize();
	}
});
$close.click(function() {
	win.close();
});
/* Updating state of maximized variable */
win.on('maximize', function() {
	maximized = 1;
});
win.on('unmaximize', function() {
	maximized = 0;
});

/*DRAG AND DROP CODE*/
window.ondragover = function(e) { event.preventDefault(); };
window.ondragenter = function(e) { event.preventDefault(); $('.uploadIcon').addClass('uploadIconAnimation'); };
window.ondragleave = function(e) { event.preventDefault(); };

/* Acting after dropped files */
window.ondrop = function (e) {
	event.preventDefault();

	/* Hide drop element and show the interface */
	$('.uploadIcon').removeClass('uploadIconAnimation');
	$('#drop').hide();
	$('#container').show();

	/* FILLING OPERATIONS */
	/* Reading from srt and filling the two vars */
	var srt = fs.readFileSync(e.dataTransfer.files[0].path,'utf8');
	old_srt = parser.fromSrt(srt), new_srt = parser.fromSrt(srt);
	/* Deleting values of the text key in new_srt */
	for(var i=0;i<new_srt.length;i++) {
		new_srt[i].text = "";
	}

	/* Setting max attr of range = to subs' number */
	$range.attr('max', old_srt.length);
	/* Insert minutes of first sub in the interface */
	$minutes.text(old_srt[0].startTime+' -> '+old_srt[0].endTime);
	/* Insert the original text of first sub in the interface */
	$read_srt_text.text(old_srt[0].text);
};

/* FILLING OPERATION WITH INPUT RANGE */
/* Display the first value of input range in a span */
$range_value.html($range.val());
$range.on('input', function() {
	/* Keep update the span-value of input range */
    $range_value.html(this.value);

    /* Insert minutes of the sub chosen through the range */
	$minutes.text(old_srt[this.value].startTime+' -> '+old_srt[this.value].endTime);
	/* Insert the original text */
	$read_srt_text.text(old_srt[this.value].text);
	/* Insert the new text added in new_srt */
	$text.val(new_srt[this.value].text);
});
/* Add new text in new_srt */
$text.on('input', function() {
	var n = $range.val();
	new_srt[n].text = $text.val();
});

/* MOVING BETWEEN SUBS WITH BUTTONS AND KEYS */
/* object containing functions to move forward or backwards */
var move = {
	forward: function() {
		$range.val(parseInt($range.val())+1).trigger('input');
	},
	backwards: function() {
		$range.val(parseInt($range.val())-1).trigger('input');
	}
}
$('#next').click(function() {
	move.forward();
});
$('#prev').click(function() {
	move.backwards();
});
$(window).keydown(function(e) {
	if (e.target.tagName == "INPUT" && e.which != 13)
		return;
	if(e.which == 37) {
		move.backwards();
	} else if(e.which == 39) {
		move.forward();
	} else if(e.which == 13) {
		move.forward();
	}
});