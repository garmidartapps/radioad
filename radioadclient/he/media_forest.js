	var options = {
		artist_image_base_url: "http://mediafor.w07.wh-2.com/images/artists/",
		poll_url: "http://mediaforest.biz/ws/ntt.ashx?fmt=jsonp&action=last_played&mfid=MFIL_RADIO_BEINTCHUMI",
		poll_every: 15
	};

	$(document).ready(function() { 

		jQuery('img').bind('error', function (e) {
			if (this.src.indexOf(options.artist_image_base_url) == 0)
				this.src = options.artist_image_base_url + "noartist.jpg";
		});

		poll();

	});
	
	function poll() {
		//console.log("polling...");
		$.ajax({
			type: 'GET',
			url: options.poll_url,
			async: true,
			jsonpCallback: 'callback',
			contentType: "application/json",
			dataType: 'jsonp',
			success: function (json) {
				//console.dir(json);
				display(json);
				setTimeout(poll, options.poll_every * 1000);
			},
			error: function (e) {
				//console.log(e.message);
				setTimeout(poll, options.poll_every * 1000);
			}
		});
	}

	
	function display(json) {
		if (json[0].artist == $("#artist_0").text() && json[0].title == $("#title_0").text())
			return;
		for (var i = 0; i < json.length; i++) {
			set_artist_image("artist_image_" + i, json[i].artist);
			$("#stime_" + i).text(json[i].stime.split("T")[1].substr(0, 5));
			$("#artist_" + i).text(json[i].artist);
			$("#title_" + i).text(json[i].title);
		}
	}

	
	function set_artist_image(img_id, artist) {
	   $("#" + img_id).attr("src", options.artist_image_base_url + artist + ".jpg");
	}
	
