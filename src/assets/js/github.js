// unauthenticated requests are rate-limited to 6/min
var githubSearchURL = 'https://api.github.com/search/repositories';
var sort = 'sort=stars&order=desc';
var githubOrg = '+org:Esri';

function assembleSearchUrl(keywords) {
    var query = '?q=';

    if (keywords) {
        keywords = keywords.trim();
        query += 'topic:' + keywords.replace(/ +/g, '+topic:');
    }

    query += '+NOT+deprecated';
    query += githubOrg;
    return githubSearchURL + query + '&' + sort;
}

function showQueryResults(tags, response) {
    if (!response.message) {
        var items = response.items,
        i,
        dateUpdated,
        html,
        project;

        if (Array.isArray(items) /*&& items.length > 0*/) {
            html = '';
            //$('#content').html('<div class="alert alert-green is-active text-center">' + items.length + '</div>');
            $('#numReposFound').html('<div class="number-repos text-center">'+items.length+'</div>');
            // for (i = 0; i < items.length; i ++) {
            //     project = items[i];
            //     dateUpdated = new Date(project.updated_at).toLocaleDateString();
            //     html += '<div class="card card-bar-blue block trailer-1"><div class="card-content"><h4 class="trailer-0">' + project.name + '</h4><div class="font-size--2"><span class="text-green"><b>' + (project.language || '') + '</b></span><span class="font-size--3 text-light-gray right">' + dateUpdated + '</span></div><p class="leader-1">' + (project.description || '') + '</p><div class="card-last"></div><div class="leader-1"><span class="icon-fork"></span> ' + project.forks_count + ' <span class="icon-star padding-left-1"> ' + project.stargazers_count + ' </span></div><a href="' + project.html_url + '" class="btn btn-clear text-center leader-half">View it on github</a></div></div>';
            // }
            // $('#content').html('<div class="block-group block-group-3-up tablet-block-group-2-up phone-block-group-1-up">' + html + '</div>');
        } else {
            //$('#content').html('<div class="alert alert-red is-active text-center">No projects found with tags ' + tags + '</div>');
            //$('#numReposFound').html("0");
            $('#numReposFound').html('<div class="number-repos text-center">'+items.length+'</div>');
        }
    } else if (response.message && response.message.indexOf('API rate limit exceeded') > -1) {
        //$('#content').html('<div class="alert alert-red is-active text-center">Hold your horses. GitHub only allows six searches per minute.</div>');
        console.log("GitHub API rate limit exceeded...");
    }
}

function showQueryError(tags, error) {
    $('#numReposFound').html('<div class="alert alert-red is-active text-center">Error ' + error.message + ' searching for ' + tags + '</div>');
}

function redirectIfQuery() {
    var pageName = window.location.toString(),
        delimiterPosition,
        redirectURL = 'https://github.com/Esri?q=',
        topicList = document.getElementById('esri-topic-list').childNodes,
        redirected = false;

    delimiterPosition = pageName.indexOf('#');

    // if a hashed query is passed and cant be matched with our list of valid topics, redirect a canned github search
    if (delimiterPosition >= 0 && pageName.length - 1 > delimiterPosition) {
        for (var i=1; i < topicList.length; i++) {
            if (pageName.substr(delimiterPosition + 1) === topicList[i].innerHTML) {
                return redirected;
            }
        }

        pageName = redirectURL + pageName.substr(delimiterPosition + 1);
        redirected = true;
        window.location = pageName;
    }

    return redirected;
}

$(function() {
    var inlineLinks = document.getElementsByClassName("subdued-links");
    for (var i = 0; i < inlineLinks.length; ++i) {
        inlineLinks[i].addEventListener("click", function(){
        window.location.hash = this.id;
        });
    }

    if (redirectIfQuery()) {
        return;
    }
    $(".chosen-select").chosen({width: "100%", max_selected_options: 3});
    $(".chosen-container .search-field .chosen-search-input").attr("spellcheck", false);
    // $(".repo-language").click(function() {
    //     var e = this.innerHTML.replace(/ /g, "");
    //     return $("select").val(e).trigger("liszt:updated").change(),
    //         window.location.hash = e,
    //         !1
    // }),
    $("select").change(function() {
        var selectedOptions,
            selectedTags = [];
        selectedOptions = $("select option:selected"),

        selectedOptions.each(function() {
            selectedTags.push($(this).data("filter"));
        });

        if (selectedTags.length > 0) {
            var tags = selectedTags.join(" ");
            var searchURL = assembleSearchUrl(tags);
            //$('#content').html('<div class="alert is-active text-center">Looking for projects matching ' + tags + '</div>');
            fetch(searchURL).then(function (response) {
               response.json().then(function(json) {
                   showQueryResults(tags, json)
               }, function (error) {
                   showQueryError(tags, error);
               });
            },
            function (error) {
                showQueryError(tags, error);
            });
        } else {
            $('#numReposFound').html('&nbsp;');
        }
        window.location.hash = selectedTags.join(",");
    }),
    $(document).ready(function() {
        var e = window.location.hash;
        null !== e && "" != e && ($("select").val(e.replace(/#/, "").split(",")),
            $("select").trigger("liszt:updated").change())
    }),
    $(document).ready(function() {

        var n, i = !1, o = 3e3, a = 0; //c = ["JavaScript", "ActionScript", "Objective-C", "Java", "Python", "DotNet", "iOS", "C-Sharp", "Android", "QuickStart", "Local-Government", "Bootstrap", "Mapping", "GeoJSON", "Mobile", "Code-Challenge", "Utility", "Storytelling", "Geocoding", "ArcGIS", "Hadoop", "Web", "Social", "Analysis", "Offline", "Runtime", "Dashboard", "Public", ""];
        function e(e) {
            window.clearInterval(n),
            e && (n = setInterval(t, o))
        }
        function t() {
            $("select").val(c[a]),
                $("select").trigger("liszt:updated").change(),
                a < c.length - 1 ? a++ : a = 0
        }
        $(document).keydown(function(t) {
            38 === t.which && t.shiftKey && i ? o > 1e3 && (o -= 1e3) : 40 === t.which && t.shiftKey && i && 5e3 > o && (o += 1e3),
            i && e(i)
        })
        $("#btnViewRepos").on("click", function(e){
            e.preventDefault();
            var selectedOptions,
                selectedTags = [],
                urlEsriBase = "https://github.com/Esri",
                urlEsriRepos;

            selectedOptions = $("select option:selected"),
            selectedOptions.each(function() {
                selectedTags.push($(this).data("filter"));
            });
            if (selectedTags.length > 0) {
                var tags = selectedTags.join("+topic:");
                window.location.href = urlEsriBase + '?q=topic:' + tags;
            } else {
                window.location.href = urlEsriBase;
            }
        })
    })
});
