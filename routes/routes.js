Router.route('/', function () {
    this.render('mockup');
});

Router.route('/recipes', function () {
    this.render('recipes');
});

Router.route('/foods/:_category', function () {
    var category = this.params._category;

    if (category === "add") {
        this.render('addfood');
    }
    else if (category === "edit") {
        //console.log("edit food");
        this.render('editfood');
    } else {
        this.render('foods', {
            data: {
                fooditem: function() {
                    Meteor.subscribe('fuuditest');
                    return Foods.find({kategoria: category }, {sort: {nimi: 1}});
                }
            }
        });
    }
});

Router.route('/categories', function () {
    this.render('categories');
});

Router.route('/allimages', function () {
    this.render('allimages');
});

Router.route('/categories/:_category', function () {
  var category = this.params._category;
  this.render('subcategories', {
        data: {
            categoryitem: function(){
                var ready = Meteor.subscribe('fuuditest').ready();
                var allCategories;

                var allFood = Foods.find({ yläkategoria: category }, {
                    sort: {kategoria: 1}, fields: {kategoria: true}
                });

                if (ready) {
                    var result = [];
                    allCategories = allFood.map( function(x) {return x.kategoria;});

                    var unique_categories = _.uniq(allCategories);

                    for (var c in unique_categories) {
                        if (unique_categories[c] !== undefined && unique_categories[c] !== "") {
                        result[result.length] = unique_categories[c];
                        }
                    }
                    return result;
                }
            },
        }
    });
});

Router.route('/food/:_nimi', function () {
    var name = this.params._nimi; //name
    this.render('food', {
        data: {
            fooditem: function(){ 
                Meteor.subscribe('fuuditest');
                return Foods.findOne({nimi: name}) 
            },
            // image: function(){ 
            //     var i_id = Foods.findOne({name: name}).image_id;
            //     return Images.findOne(i_id)
            // }
        }
    });
});
