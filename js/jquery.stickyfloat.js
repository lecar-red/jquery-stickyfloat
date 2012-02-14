/*
 * stickyfloat - jQuery plugin for verticaly floating anything in a constrained area
 * 
 * Example: jQuery('#menu').stickyfloat({duration: 400});
 * parameters:
 * 		duration 	- the duration of the animation
 *		startOffset - the amount of scroll offset after it the animations kicks in
 *		offsetY		- the offset from the top when the object is animated
 *		lockBottom	- 'true' by default, set to false if you don't want your floating box to stop at parent's bottom
 * $Version: 05.16.2009 r1
 * Copyright (c) 2009 Yair Even-Or
 * vsync.design@gmail.com

 * Mods by: Christopher Haupt, Webvanta Inc. 
 * http://www.webvanta.com/, http://twitter.com/chaupt, http://github.com/chaupt
 * Honor options set by user.
 *
 * Fork/plugin work by: Lee Carmichael
 * http://github.com/lecar-red
 *  - update to support iteration on jquery object
 */
( function($) {
	$.fn.stickyfloat = function(options) {
		return this.each( function() {
			// we check each parent for overflow to find valid option to use
			// for positioning, need better name than base
			var base = $(this).parents().map( function() {
				if ( $(this).css('overflow') == 'scroll' || 
					 $(this).css('overflow') == 'auto' ) {
					return this;
			   	}
			}).first();

			// might pay to check css('overflow') too but if
			// scrollHeight not equaling height indicates element
			// with overflow and scrollbars 
			if ( base.prop('scrollHeight') != base.height() ) {
				_position_overflow( $(this), options, base );
			}
			else {
				_position($(this), options) 
			}
		});

		// setup position and scroll
		function _position($obj, options) {
			var parentPaddingTop = parseInt($obj.parent().css('padding-top'));
			var startOffset      = $obj.parent().offset().top;
			
			var opts = $.extend({
				startOffset: startOffset, 
				offsetY: parentPaddingTop, 
				duration: 400,
				lockBottom: true 
			}, options);

			$obj.css({ position: 'relative' });

			if(opts.lockBottom){
				var bottomPos = $obj.parent().height() - $obj.height() + opts.offsetY; //get the maximum scrollTop value
				if( bottomPos < 0 )
					bottomPos = 0;
			}

			$(window).scroll(function () {
					$obj.stop(); // stop all calculations on scroll event

					var pastStartOffset     = $(window).scrollTop() > opts.startOffset; // check if the window was scrolled down more than the start offset declared.
					var objFartherThanTopPos  = $obj.offset().top > opts.startOffset; // check if the object is at it's top position (starting point)
					var objBiggerThanWindow   = $obj.outerHeight() < $(window).height();  // if the window size is smaller than the Obj size, then do not animate.

					// if window scrolled down more than startOffset OR obj position is greater than
					// the top position possible (+ offsetY) AND window size must be bigger than Obj size
				if( (pastStartOffset || objFartherThanTopPos) && objBiggerThanWindow ){ 
					var newpos = ($(document).scrollTop() - opts.startOffset + opts.offsetY );

					if ( newpos > bottomPos )
						newpos = bottomPos;

					if ( $(document).scrollTop() < opts.startOffset ) // if window scrolled < starting offset, then reset Obj position (opts.offsetY);
						newpos = opts.offsetY;

					$obj.animate({ top: newpos }, opts.duration );
				}
			});
		}; // end calc

		// position when float is inside of overflow with scroll 
		// p - overflow element (not parent) need to change
		function _position_overflow($obj, options, p) {
			// var par              = $obj.parent();
			// not sure about this yet, if we are inside div > div > div
			var parentPaddingTop = parseInt( $obj.parent().css('padding-top') );
			
			// offset is relative to document not current element
			//var startOffset      = p.offset().top - $obj.parent().offset().top;
			var startOffset      = $obj.parent().offset().top - p.offset().top;

			// set defaults and overrides
			var opts = $.extend({
				startOffset: startOffset, 
				offsetY:     parentPaddingTop, 
				duration:    400, 
				lockBottom:  true
			}, options);

			$obj.css({ position: 'relative' });

			if(opts.lockBottom) {
				// get the maximum scrollTop value but using scrollHeight 
				// (for overflow elements)
				var bottomPos = 
					$obj.parent().prop('scrollHeight') - $obj.height() + opts.offsetY; 

				_emit_log("bottomPos [" + $obj.attr('id') + "]: " + bottomPos );

				if( bottomPos < 0 )
					bottomPos = 0;
			}

			// scroll attached to overflow element
			$(p).scroll(function() {
				var msg = "[" + $obj.attr('id') + "]: ";

				// ** These don't appear to be needed inside scrolling overflow **
				// check if the overflow element was scrolled down more 
				// than the start offset declared.
				var pastStartOffset     = $(this).scrollTop() > opts.startOffset; 

				// check if the object is at it's top position (starting point)
				var objFartherThanTopPos  = $obj.offset().top > opts.startOffset; 

				// scrollTop isn't completely correct here
				// newpos will be need to take into account 
				var newpos = $(this).scrollTop() - opts.startOffset + opts.offsetY;

				_emit_log( 
					msg + 
					"scrollTop: "   + $(this).scrollTop() + " " +
					"startOffset: " + opts.startOffset    + " " +
					"offsetY: "     + opts.offsetY        + " " +
					"newpos:  "     + newpos    + " " +
					"bottomPos: "   + bottomPos + " "
				); 

				// stop scroll at bottom of parent
				if ( newpos > bottomPos )
					newpos = bottomPos; 

				if ( $(this).scrollTop() < opts.startOffset )
					newpos = opts.offsetY;

				$obj.stop();

				if ( newpos < 0 ) 
					newpos = 0;

				// nothing to do here
				//if ( !pastStartOffset && !objFartherThanTopPos ) 
				//	return;

				// move until obj is outside of parent size, then stop
				_emit_log( 
					msg + 
					"scrollTop: " + $(this).scrollTop() + " " + 
					"header + div size: " + ( $obj.parent().height() - $obj.height() ) + " " +
					"newpos: " + newpos
				);

				$obj.animate({ top: newpos }, opts.duration );
			});
		};

		function _emit_log(msg) {
			if ( console.log && window.debug ) 
				console.log(msg);
		};
	};
})(jQuery);
