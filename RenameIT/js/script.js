/*
# This file is part of RenameIT.
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

/* TITLEBAR BUTTONS */
var gui = require('nw.gui'),
 	win = gui.Window.get(),
 	maximized = 0,
 	min = $('#min'),
	max = $('#max'),
	close = $('#close');
/* Updating state of maximized variable */
win.on('maximize', function() {
	maximized = 1;
});
win.on('unmaximize', function() {
	maximized = 0;
});
min.click(function() {
	win.minimize()
});
max.click(function() {
	$('#max').toggleClass("unmax");
	if(maximized == 1) {
		win.unmaximize();
	} else {
		win.maximize();
	}
});
close.click(function() {
	win.close();
});

/* BASIC VARIABLES */
var oldpath = [], 
	oldname = [],
	newname = [];

/*DRAG AND DROP CODE*/
window.ondragover = function(e) { event.preventDefault(); };
window.ondragenter = function(e) { event.preventDefault(); $('.uploadIcon').addClass('uploadIconAnimation'); };
window.ondragleave = function(e) { event.preventDefault(); };


/* Acting after dropped files */
window.ondrop = function (e) {
	event.preventDefault();
	$('.uploadIcon').removeClass('uploadIconAnimation');
	for (var i = 0; i < e.dataTransfer.files.length; ++i) {
		if( oldpath.indexOf(e.dataTransfer.files[i].path) != -1 ) {
		} else {
			oldpath.push(e.dataTransfer.files[i].path);
			oldname.push(e.dataTransfer.files[i].name);
		}
	}

	/* BUILDING HTML CODE */
	newname = oldname.slice();
	oldpath.sort();
	oldname.sort();
	newname.sort();
	$('table').show();
	$('#drop').hide();
	$('tbody').empty();
	for(var i=0;i<oldpath.length;i++) {
		$('tbody').append('<tr> <td><input type="checkbox" id="'+i+'" checked /></td> <td class="dir"><span class="short" title="'+oldpath[i]+'">'+oldpath[i]+'</span></td> <td><input type="text" value="'+oldname[i]+'" /></td> </tr>');
	}

	/* ANIMATE RENAME BUTTON */
	if( !$('.submit').hasClass('submit-movement') ) {
		$('.submit').addClass('submit-movement');
	}
	

};

/* KEEP ARRAY UPDATED IF THERE ARE MANUAL CHANGES */
$("body").on("change", "input[type=text]", function() {
	$('input[type=checkbox]').not('#master').each(function() {
		var n = $(this).attr('id');
		newname[n] = $(this).parent().next().next().find('input[type=text]').val();
	});
});

/* CHECKBOXES SELECTION */
$('#master').click(function() {
	if(this.checked) {
		$('input[type="checkbox"]').each(function() {
			this.checked = true;
		});
	} else {
		$('input[type="checkbox"]').each(function() {
			this.checked = false;
		});
	}	
});
$('body').on('click', 'input[type="checkbox"]', function() {
	if(!this.checked) { $('#master').attr('checked', false); }
});

/* ORDER BY NAME */
$('#order').click(function() {
	oldpath.reverse();
	oldname.reverse();
	newname.reverse();
	$('.ord').toggleClass("ord-rotate");
	$('tbody').empty();
	for(var i=0;i<oldpath.length;i++) {
		$('tbody').append('<tr> <td><input type="checkbox" id="'+i+'" checked /></td> <td clsas="dir"><span class="short" title="'+oldpath[i]+'">'+oldpath[i]+'</span></td> <td><input type="text" value="'+oldname[i]+'" /></td> </tr>');
	}
});

/* CLEAR BUTTONS */
$('#clear_new').click(function() {
	newname.length = 0;
	$('input[type=text]').each(function() {
		$(this).val('');
	});
});
$('#clear_old').click(function() {
	$('table').hide();
	$('#drop').show();
	$('#tool').empty();
	$('.submit').removeClass('submit-movement');
	$('tbody').empty();
	oldpath.length = 0, oldname.length = 0, newname.length = 0;
});



/* COPY TOOL */
$('#copy').click(function() {

	if($("table").is(":visible")) {
		$('input[type=checkbox]').not('#master').each(function() {
			if(this.checked) {
				var n = $(this).attr('id');
				newname[n] = oldname[n];
				$(this).parent().next().next().find('input[type=text]').val(newname[n]);
			}
		});
	}
});

/* REPLACE TOOL */
$('#replace').click(function() {
	if( $("table").is(":visible") ) {
		$('#tool').html('<div style="float:left; text-align:right; padding:10px 0; margin-right:10px;"><label>Replace the name <input type="radio" name="replace" value="1" /></label><br /><label>Replace the exten. <input type="radio" name="replace" value="2" /></label><br /><input style="width:140px;" type="text" id="text" placeholder="Replace with..." /> </div> <div style="float:right;"><div class="button go">Go</div> <div class="button close">Close</div></div>');
		
		$('.go').click(function() {

			$('input[type=checkbox]').not('#master').each(function() {
				if(this.checked) {
					var n = $(this).attr('id');
					var ext = /(?:\.([^.]+))?$/.exec(newname[n])[1];
					var name = newname[n].replace("."+ext, "");

					if( $('input[name=replace]:checked').val() == 1 ) {
						newname[n] = $('#text').val() + "." + ext;
						$(this).parent().next().next().find('input[type=text]').val(newname[n]);
					} else if( $('input[name=replace]:checked').val() == 2 ) {
						newname[n] = name + "." + $('#text').val();
						$(this).parent().next().next().find('input[type=text]').val(newname[n]);
					} else {
						alert("Select if you want replace the name or the extension.");
					}

				}	
			});
		});

	}
});

/* FIND AND REPLACE TOOL */
$('#find-replace').click(function() {
	if( $("table").is(":visible") ) {
		$('#tool').html('<div style="float:left; text-align:right; padding:10px 0; margin-right:10px;"><label>Name <input type="radio" name="replace" value="1" /></label> <label>Ext. <input type="radio" name="replace" value="2" /></label><br /><input style="width:140px;" type="text" id="find" placeholder="find" /><br/><input style="width:140px;" type="text" id="toreplace" placeholder="replace with" /> </div> <div style="float:right;"><div class="button go">Go</div> <div class="button close">Close</div></div>');

		$('.go').click(function() {

			$('input[type=checkbox]').not('#master').each(function() {
				if(this.checked) {
					var n = $(this).attr('id');
					var ext = /(?:\.([^.]+))?$/.exec(newname[n])[1];
					var name = newname[n].replace("."+ext, "");

					if( $('input[name=replace]:checked').val() == 1 ) {
						newname[n] = name.replace( $('#find').val(), $('#toreplace').val() ) + "." + ext;
						$(this).parent().next().next().find('input[type=text]').val(newname[n]);
					} else if( $('input[name=replace]:checked').val() == 2 ) {
						newname[n] = name + "." + ext.replace( $('#find').val(), $('#toreplace').val() );
						$(this).parent().next().next().find('input[type=text]').val(newname[n]);
					} else {
						alert("Select if you want replace the name or the extension.");
					}

				}	
			});
		});

	}
});

/* NUMBER TOOL */
$('#number').click(function() {
	if( $("table").is(":visible") ) {
		$('#tool').html('<div style="float:left; text-align:right; padding:10px 0; margin-right:10px;"><div style=""><label>Beginning <input type="radio" name="number" value="1" /></label><br /><label>End <input type="radio" name="number" value="2" /></label></div> <!-- <div style="float:right;"> <label>Digits <br/> <input type="number" name="digits" /></label></div><div style="clear:both;"> </div> --> <input style="width:140px;" type="text" id="delimiter" placeholder="Delimiter" /> </div> <div style="float:right;"><div class="button go">Go</div> <div class="button close">Close</div></div>');

		$('.go').click(function() {
		var i=1;
			$('input[type=checkbox]').not('#master').each(function() {
				if(this.checked) {

					var n = $(this).attr('id');
					var ext = /(?:\.([^.]+))?$/.exec(newname[n])[1];
					var name = newname[n].replace("."+ext, "");

					if( $('input[name=number]:checked').val() == 1 ) {
						newname[n] = i + $('#delimiter').val() + newname[n];
						$(this).parent().next().next().find('input[type=text]').val(newname[n]);
					} else if( $('input[name=number]:checked').val() == 2 ) {
						newname[n] = name + $('#delimiter').val() + i + "." + ext;
						$(this).parent().next().next().find('input[type=text]').val(newname[n]);
					} else {
						alert("Select if you want append the numbers to the beginning or the end.");
					}
				i++;
				}
			});
		});

	}
});

/* DELETE TOOL */
$('#delete').click(function() {
	if( $("table").is(":visible") ) {
		$('#tool').html('<div style="float:left; text-align:right; padding:16px 0; margin-right:10px;"><label>From char: </label><input type="number" id="n1" min="1" value="1" /><br /><label>To: </label><input type="number" id="n2" min="1" value="1" /></div> <div style="float:right;"><div class="button go">Go</div> <div class="button close">Close</div></div>');

		$('.go').click(function() {

			$('input[type=checkbox]').not('#master').each(function() {
				if(this.checked) {
					var n = $(this).attr('id');
					var n1 = $('#n1').val(), n2 = $('#n2').val();

					var toremove = newname[n].slice(n1-1,n2);
					newname[n] = newname[n].replace(toremove, "");

					$(this).parent().next().next().find('input[type=text]').val(newname[n]);
				}
			});
		});
			
	}
});

/* DELETE HTML TOOL */
$('body').on('click', '.close', function() {
	$('#tool').empty();
});

/* RENAME IT */
$('.submit').click(function () {
var fs = require('fs');
	if($("table").is(":visible")) {
			$('input[type=checkbox]').not('#master').each(function() {
				if(this.checked) {
					var n = $(this).attr('id');
					newname[n] = $(this).parent().next().next().find('input[type=text]').val();
					var path = oldpath[n].replace(oldname[n], "");

					fs.rename(oldpath[n], path+newname[n]);

					oldpath[n] = oldpath[n].replace(oldname[n], newname[n]);
					$('.dir').html("<span class='short' title="+oldpath[n]+">"+oldpath[n]+"</span>");
					oldname[n] = newname[n];

				}
			});
	}


});