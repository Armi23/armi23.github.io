var kkeys = [], konami = "38,38,40,40,37,39,37,39,66,65";

        $(document).keydown(function(e) {
          kkeys.push( e.keyCode );
          if ( kkeys.toString().indexOf( konami ) >= 0 ) {
            $(document).unbind('keydown',arguments.callee);

            // do something awesome
            $("#container").fadeOut( "slow" );
            $("#controls").fadeOut( "slow" );
            $("#timeline").fadeOut( "slow" );
            $("#barchart").fadeOut( "slow" );
            $("#instructions").fadeOut( "slow" );
            $("body").attr('style','background-color:black').fadeIn("fast");
            $("main").append($('<div>').attr('id','zombiegame'));
              
$("#zombiegame").append($('<iframe id="gameframe" src="http://www.gamezhero.com/get-game-code/170f6aa36530c364b77ddf83a84e7351" id="game_frame" name="game_frame" width="800" height="440" align="middle" scrolling="No" frameborder="0"></iframe>'));
            
            $("#dev-container").html("Developed By:<br><br><a href=\"http://www.linkedin.com/in/shahyansajid/\">Shahyan A. Sajid</a> - Harvard '15<br><a href=\"http://aadah.me/\">Abdi-Hakin Dirie</a>").fadeIn("slow");
            
          }
        });