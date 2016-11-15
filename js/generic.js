function backToMainMenu() {
	$(".scores").hide();
	$(".control_window").show();
}

function get_scores() {
	 $("#get_scores").click(function () {
        
        // call stats function
        $.get( "scores/get_scores.php", function( data ) {
            if(data.trim() != "") {
                data = JSON.parse(data);
                let scores = $("ul.scores");
                scores.empty();
                for(let d in data) {
                    scores.append( $("<li>").append($("<a>").text(data[d].score)));
                }
                scores.append( $("<li>").append($("<a>").attr("id", "back").attr("onclick", "backToMainMenu()").text(" < ")));
                $("ul.control_window").hide();
                scores.show();
            }
        });
    });
}

// just a number
function sendScoreToServer (score = 0) {
    $.ajax({type: 'POST', url: `/?${score}`})
}

function getTopScores (numberOfScores) {
    let result = []
    let data = $.ajax({type: "GET", url: "/stats", async: false}).responseText;
    data = data.split(',').map(Number).sort((a,b) => Number(a) < Number(b))
    for (let i = 0; i < numberOfScores; i++) {
        if (data[i])
            result.push(data[i])
        else
            result.push(0)
    }
    return result
}