// code copied from foodform to avoid tinkering with addfood.html

if (Meteor.isClient) {
    Template.editform.events({
        'submit form': function (event, template) {
            // Prevent default browser form submit
            event.preventDefault();

            var file_id = 0;

            console.log("editform submit");
            // Get values from form element
            const target = event.target;
            const Name = target.name.value;
            const energy = target.energy.value;
            const carbs = target.carbs.value;
            const sugar = target.sugar.value;
            const fat = target.fat.value;
            const salt = target.salt.value;
            const prot = target.prot.value;
            const fiber = target.fiber.value;
            const category = target.category.value;
            const manufacturer = target.manufacturer.value;
            const barcode = target.barcode.value;

            if (target.image.files[0] === undefined) {
                file_id = Session.get('itemImageId'); // retain image if new one not given
                console.log("no image, file_id: "); console.log(file_id);
                Meteor.call('fuuditest.update', Name, energy, carbs,
                        sugar, fat, salt, prot, fiber, file_id, category, manufacturer, barcode);
                }
            else {
                Images.insert(event.target.image.files[0], function (err, fileObj) {
                    if (err) {
                        // handle error
                        console.log(err);
                    } else {
                        // handle success depending what you need to do
                        file_id = fileObj._id;
                        Meteor.call('fuuditest.update', Name, energy, carbs,
                                    sugar, fat, salt, prot, fiber, file_id, category, manufacturer, barcode);
                    }
                });
            }
            target.name.value = '';  // Clear form
            target.energy.value = '';
            target.carbs.value = '';
            target.sugar.value = '';
            target.fat.value = '';
            target.salt.value = '';
            target.prot.value = '';
            target.fiber.value = '';
            //target.category.value = null; // to do: how to clear select
            target.manufacturer.value = '';
            target.barcode.value = '';
            if (event.target.image.files[0]) {
                    //event.target.image.files[0] = '';  // to do: how to clear image selection
            }

        },
    });
/*----------------------------------------------------------------------------------------------------*/
    Template.editform.onRendered(function () {

        $('.food-edit-body').validate({
            messages: {
                name: 'Required'
            }
        });
//        console.log("editform.onrendered");
        var inputs = document.querySelectorAll('.myFileInput2');
        Array.prototype.forEach.call(inputs, function (input) {
            var label = input.nextElementSibling,
				labelVal = label.innerHTML;

            input.addEventListener('change', function (e) {
                var fileName = '';
                fileName = e.target.value.split('\\').pop();
                if (fileName === '') {
                    fileName = 'lataa kuva';
                }
                label.querySelector('span').innerHTML = fileName;
            });
        });
    });
/*----------------------------------------------------------------------------------------------------*/
    Template.editform.helpers({
        distinct_categories() {

	var ready = Meteor.subscribe('fuuditest').ready();
    var allCategories;

    var allFood = Foods.find({},  {
        sort: {kategoria: 1}, fields: {kategoria: true}
    });

    if (ready) {
        var result = [];
        allCategories = allFood.map( function(x) {return x.kategoria;});
				
        for (var c in allCategories) {
            if (allCategories[c] !== undefined && allCategories[c] !== "") {
                result[result.length] = allCategories[c];
            }
        }
    }

    return {
        categories: _.uniq(result),
        ready: ready
    };
},
});
/*----------------------------------------------------------------------------------------------------*/
Template.registerHelper('storeCat', function(category) {
    Session.set('itemCategory', category);
//    console.log('storeCat');
});
Template.registerHelper('storeImageId', function(imageId) {
    Session.set('itemImageId', imageId);
    console.log('storeImageId');
});
Template.registerHelper('selectedHelper', function(choice) {
    var storedCat = Session.get('itemCategory');
    if(storedCat === choice) {
//        console.log("selected:");
//        console.log(choice);
        return 'selected';
    }
    else return '';
});
    
/*----------------------------------------------------------------------------------------------------*/
} /* Meteor.isClient */