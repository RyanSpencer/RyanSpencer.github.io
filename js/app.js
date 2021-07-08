var request = new XMLHttpRequest(),
    app,
    projects, 
    ratings,
    masterTagList,
    activeFiltering = false,
    projectColumns = "rows-cols-3",
    techColumns = "rows-cols-4",
    techKeyColumns = "row-cols-4",
    projectComp = { props: ['project'], methods: {
        getImageUrl: function (image) {
            return 'background-image: url("vueportfolio/data/' + image +'")';
        }
    },
    template: `
        <div class="col py-2">
            <div class="card h-100">
                <div class="img-background" :style="getImageUrl(project.image)"> 
                </div>
                <div class="card-body">
                    <h5 class="card-title">{{project.name}}</h5>
                    <p class="card-text">{{project.description}}</p>
                </div>
                <div class="card-footer">
                    <a href="#" class="btn btn-primary" data-toggle="modal" data-target="#detailModal" v-bind:data-project="project.name">See Details</a>
                </div>
            </div>
        </div>
    `
    },
    ratingComp = {props: ['rating'],
        template: `
            <div class="col">
                <li class="list-group-item text-center rating">
                    <svg v-if="rating.score == '1'" width="3em" height="3em" viewBox="0 0 16 16" class="bi bi-reception-1 rating" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2zm4 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                    <svg v-else-if="rating.score == '2'" width="3em" height="3em" viewBox="0 0 16 16" class="bi bi-reception-2 rating" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-5zm4 5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                    <svg v-else-if="rating.score == '3'" width="3em" height="3em" viewBox="0 0 16 16" class="bi bi-reception-3 rating" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-5zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-8zm4 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                    <svg v-else-if="rating.score == '4'" width="3em" height="3em" viewBox="0 0 16 16" class="bi bi-reception-4 rating" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-5zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-8zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11z"/>
                    </svg>
                    <p class="rating-name">{{rating.name}}</p>
                </li>
            </div>
            
        `
    },
    searchComp = {props: ['taglist'],
        template: `
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="tagSearchButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Filter by Tags
                </button>
                <div id="dropdownContent" class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <div id="radioFilterOptions" class="btn-group btn-group-toggle" data-toggle="buttons">
                        <label class="btn btn-secondary active">
                            OR 
                            <svg data-toggle="tooltip" title="(Default) This means any project with any of the selected tags will be shown" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-exclamation-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                            </svg>
                            <input type="radio" name="searchOption" id="orSearch" checked>
                        </label>
                        <label class="btn btn-secondary">
                            AND
                            <svg data-toggle="tooltip" title="This means only projects with all the selected tags wil be shown" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-exclamation-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                            </svg>
                            <input type="radio" name="searchOption" id="andSearch">
                        </label>
                    </div>
                    <form id="taglistForm">
                        <label class="dropdown-item form-check-label" v-for="tag in taglist" v-bind:key="tag" v-bind:for="tag + 'Check'">
                            <input class="form-check-input" type="checkbox" v-bind:id="tag + 'Check'" aria-label="Checkbox for following text input">
                            {{tag}}
                        </label>
                    </form>
                </div>
            </div>
        `
}
//Simple repeated functionality of making every project shown
function showAllProjects() {
    projects.forEach((project) => {
        project.shown = true;
    });
}

//Whenever someone clicks the button in the alert, it will uncheck all the checks and showEverything
function emptyChecks() {
    $('input[type="checkbox"]').prop('checked', false);
    showAllProjects();
    app.activeFiltering = false;
}

request.onload  = function() {
    projects = JSON.parse(request.response);

    showAllProjects();

    //Takes the list of projects, and map them to return only the tags
    //Flatten the tags into a single list
    //Transfer it into a set since sets have no duplicates, to get all tags used
    masterTagList = Array.from(
        new Set(
            projects.map((project) => {
                return project.tags;
            })
            .flat()
        ));


    ratings = [
        {
            name: 'Javascript',
            score: 4
        },
        {
            name: "Java",
            score: 2
        },
        {
            name: "C#",
            score: 3
        },
        {
            name: "C++",
            score: 3
        },
        {
            name: "Maya",
            score: 2
        },
        {
            name: "Jira",
            score: 4
        },
        {
            name: "AngularJS",
            score: 4
        },
        {
            name: "Node",
            score: 3
        },
        {
            name: "Unity",
            score: 4
        },
        {
            name: "Unreal",
            score: 2
        },
        {
            name: "Lumberyard",
            score: 1
        },
        {
            name: "HTML & CSS",
            score: 4
        },
        {
            name: "React",
            score: 2
        },
        {
            name: "Vue",
            score: 2
        },
        {
            name: "Photoshop",
            score: 2
        },
        {
            name: "mongodb",
            score: 2
        }
    ];

    app = new Vue({
        el: '#mainApp',
        components: {
            'portfolio-work': projectComp,
            'rating-line': ratingComp,
            'search-tags': searchComp
        },
        mounted() {
            this.handleResize()
            window.addEventListener('resize', this.handleResize)
        },
        destroyed() {
            window.removeEventListener('resize', this.handleResize)
        },
        methods: { 
            handleResize() {
                var size1080p = window.matchMedia('(max-width: 1080px)').matches;
                var size625p = window.matchMedia('(max-width: 625px)').matches;
                this.projectColumns =  size1080p ?  size625p ?  'row-cols-1': 'row-cols-2' : 'row-cols-3';
                this.techColumns = size1080p ? size625p ?  'row-cols-2': 'row-cols-3' : 'row-cols-4';
                this.techKeyColumns = size1080p ? 'row-cols-2' : 'row-cols-4';
             }
        },
        data: {
            projects: projects,
            ratings: ratings,
            taglist: masterTagList,
            activeFiltering: activeFiltering,
            projectColumns: projectColumns,
            techColumns: techColumns,
            techKeyColumns: techKeyColumns,
            modalInfo : {
                name: 'Placeholder Title',
                details: 'Lorem Ipsum',
                gallery: null,
                git: null,
                link: null,
                tags: []
            }
        }
    });

    window.wait

    //Jquery event called when bootstrap tries to show a modal
    $('#detailModal').on('show.bs.modal', function(event){
        //Grab the button that was clicked so we can determine the project that is being expanded
        var button = $(event.relatedTarget),
            projectObj = projects.filter( obj => {
                return obj.name === button.data('project');
            })[0];
        app.modalInfo = projectObj;
    })

    //Prevents propogation of clicks on the dropdown from echoing up the application, which cause errant closes sometimes
    $('.dropdown-menu').on('click', function(e) {
        e.stopPropagation();
    })

    //You have to activate??? the tooltips when the application launch
    $('[data-toggle="tooltip"]').tooltip();

    //Listen for checkbox and aradio button changes
    $('input[type="checkbox"], input[type="radio"]').on('change', function () {
        //Grab the list of checks and radio buttons
        var formChildren = Array.from($('#taglistForm').children()),
            radioButtons = Array.from($('#radioFilterOptions').children()),
            //We only really need the name and checked value of the checkbox
            checkedTags = formChildren.map((box) => {
                return {
                    name: box.innerText,
                    value: $(box).children()[0].checked
                }
            
            })
            //filter it to only get the boxex actually checked
            .filter((checkBox) => checkBox.value),
            //Simplify the buttons down to an id and checked stauts
            searchType = radioButtons.map((button) => {
                return {
                    name: button.lastElementChild.id,
                    value: button.lastElementChild.checked
                }
            })
            //Find the button that's checked and just get it's id
            .find((button) => button.value).name;
        //Checks if any checkboxes are checked, meaning we are filtering
        app.activeFiltering = checkedTags.length > 0;
        projects.forEach((project) => {
            //If none of the checkboxes are checked, everything should be shown
            if(! app.activeFiltering) {
                project.shown = true;
            }
            else {
                var relevantTags = checkedTags.filter((checkBox) => {
                    //Return if the tag is included in the project, and tag is checked
                    return project.tags.includes(checkBox.name)
                });
                //At this point, any checked tags that this project has will be in relevantTags.
                if(relevantTags.length > 0) {
                    //two search types, 'or' and 'and'
                    //If it's or, we're showing all projects that have any tags, so true,
                    //If it's and, we're only showing projects with all tags, so we comapre the tags checked vs checked tags for this project
                    project.shown = searchType === 'orSearch' ? true : relevantTags.length == checkedTags.length;
                }
                else {
                    project.shown = false;
                }
            }
        });
      });

    //Sort the Ratings list so that higher scores go first, with same scores sorted alphabetically 
    ratings.sort(function compareSort(a, b) {
        if (a.score > b.score) return -1;
        if (b.score > a.score) return 1;
        
        if (a.name < b.name) return -1;
        if (b.name < a.name) return 1;
        return 0;
    });
    }
request.responeType = 'json';

request.open('GET', 'vueportfolio/data/projects.json');
request.send();
